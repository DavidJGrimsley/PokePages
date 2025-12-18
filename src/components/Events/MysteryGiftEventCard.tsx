import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

import { MysteryGiftEvent, EventStatus } from '~/constants/events/types';
import { getMysteryGiftStatus } from '~/utils/helperFX';
import { useEventClaim } from '~/services/eventClaimsService';
import { cn } from '~/utils/cn';
import { BaseEventCard } from './BaseEventCard';
import { EventClaimButton } from './EventClaimButton';import { useShowSignInAlert } from '~/hooks/useNavigateToSignIn';
interface MysteryGiftEventCardProps {
  event: MysteryGiftEvent;
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

export const MysteryGiftEventCard: React.FC<MysteryGiftEventCardProps> = ({ event, eventKey }) => {
  const status = getMysteryGiftStatus(event.startDate, event.endDate, event.isOngoing);
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
      case EventStatus.UPCOMING:
        return 'bg-orange-500';
      case EventStatus.ENDED:
        return 'bg-app-brown';
      default:
        return 'bg-app-brown';
    }
  };

  const getStatusLabel = () => {
    if (event.isOngoing) {
      return 'ONGOING';
    }
    switch (status) {
      case EventStatus.ACTIVE:
        return 'ACTIVE';
      case EventStatus.UPCOMING:
        return 'COMING SOON';
      case EventStatus.ENDED:
        return 'ENDED';
      default:
        return 'ENDED';
    }
  };

  const getDateDisplay = () => {
    if (event.isOngoing) {
      return 'Available indefinitely';
    }
    switch (status) {
      case EventStatus.UPCOMING:
        return `Available: ${formatUserFriendlyDate(event.startDate)}`;
      case EventStatus.ACTIVE:
        return `Ends: ${formatUserFriendlyDate(event.endDate)}`;
      case EventStatus.ENDED:
        return `Ended: ${formatUserFriendlyDate(event.endDate)}`;
      default:
        return '';
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
      {/* Claimed button with centered gift icon */}
      {(status === EventStatus.ACTIVE || event.isOngoing) && (
        <EventClaimButton
          claimed={claimed}
          onToggle={handleToggleClaim}
          iconName="gift"
          claimedLabel="✓ Claimed"
          unclaimedLabel="Mark as Claimed"
        />
      )}
    </BaseEventCard>
  );
};
