import React from 'react';
import { View, Text, Pressable, Platform, Alert, Clipboard } from 'react-native';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

import { PromoCodeEvent, EventStatus } from '~/constants/events/types';
import { getPromoCodeStatus } from '~/utils/helperFX';
import { useEventClaim } from '~/services/eventClaimsService';
import { BaseEventCard } from './BaseEventCard';
import { EventClaimButton } from './EventClaimButton';
import { useShowSignInAlert } from '~/hooks/useNavigateToSignIn';

interface PromoCodeEventCardProps {
  event: PromoCodeEvent;
  eventKey: string;
}

const formatUserFriendlyDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const zonedDate = toZonedTime(date, userTimeZone);
    return format(zonedDate, 'MMMM d, yyyy \'at\' h:mm a') + ' local time';
  } catch (error) {
    console.error('Error formatting date:', error);
    return new Date(dateString).toLocaleDateString() + ' local time';
  }
};

const showAlert = (title: string, message?: string) => {
  if (Platform.OS === 'web') {
    window.alert(message ? `${title}\n${message}` : title);
  } else {
    Alert.alert(title, message);
  }
};

export const PromoCodeEventCard: React.FC<PromoCodeEventCardProps> = ({ event, eventKey }) => {
  const status = getPromoCodeStatus(event.expirationDate);
  const { claimed, toggleClaim } = useEventClaim(eventKey);
  const showSignInAlert = useShowSignInAlert();

  const handleToggleClaim = async () => {
    try {
      await toggleClaim();
    } catch (error) {
      if (error instanceof Error && error.message === 'AUTH_REQUIRED') {
        showSignInAlert();
      }
    }
  };

  const getStatusBgClass = () => {
    switch (status) {
      case EventStatus.ACTIVE:
        return 'bg-green-500';
      case EventStatus.EXPIRED:
        return 'bg-app-brown';
      default:
        return 'bg-app-brown';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case EventStatus.ACTIVE:
        return 'ACTIVE';
      case EventStatus.EXPIRED:
        return 'EXPIRED';
      default:
        return 'EXPIRED';
    }
  };

  const handleCopyCode = async (e: any) => {
    e.stopPropagation();
    try {
      if (Platform.OS === 'web') {
        await navigator.clipboard.writeText(event.code);
      } else {
        Clipboard.setString(event.code);
      }
      showAlert('Success', 'Promo code copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy code:', error);
      showAlert('Error', 'Failed to copy code to clipboard');
    }
  };

  const getDateDisplay = () => {
    if (status === EventStatus.ACTIVE) {
      return `Expires: ${formatUserFriendlyDate(event.expirationDate)}`;
    } else {
      return `Expired: ${formatUserFriendlyDate(event.expirationDate)}`;
    }
  };

  return (
    <BaseEventCard
      eventKey={eventKey}
      title={event.title}
      game={event.game}
      description={event.description}
      statusBgClass={getStatusBgClass()}
      statusLabel={getStatusLabel()}
      dateDisplay={getDateDisplay()}
    >
      {/* Promo code with copy button - outside Link to prevent navigation trigger */}
      <View className="bg-app-background rounded-md p-sm mb-xs flex-row justify-between items-center border border-app-secondary">
        <Text className="typography-mono text-app-text font-bold text-lg">{event.code}</Text>
        <Pressable
          onPress={handleCopyCode}
          className="bg-app-accent px-md py-xs rounded-md">
          <Text className="typography-copy-bold text-app-white">Copy</Text>
        </Pressable>
      </View>

      {/* Redeemed button with centered gift icon */}
      {status === EventStatus.ACTIVE && (
        <EventClaimButton
          claimed={claimed}
          onToggle={handleToggleClaim}
          iconName="key"
          claimedLabel="✓ Redeemed"
          unclaimedLabel="Mark as Redeemed"
        />
      )}
    </BaseEventCard>
  );
};
