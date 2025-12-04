import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

import { TeraRaidEvent, EventStatus } from '~/constants/events/types';
import { getTeraRaidStatus } from '~/utils/helperFX';
import { useEventClaim } from '~/services/eventClaimsService';
import { cn } from '~/utils/cn';
import { BaseEventCard } from './BaseEventCard';
import { EventClaimButton } from './EventClaimButton';

interface TeraRaidEventCardProps {
  event: TeraRaidEvent;
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

export const TeraRaidEventCard: React.FC<TeraRaidEventCardProps> = ({ event, eventKey }) => {
  const status = getTeraRaidStatus(
    event.periods.period1.start,
    event.periods.period1.end,
    event.periods.period2?.start,
    event.periods.period2?.end
  );
  const { claimed, toggleClaim } = useEventClaim(eventKey);

  const getStatusBgClass = () => {
    if (status === EventStatus.PERIOD1_ACTIVE || status === EventStatus.PERIOD2_ACTIVE) {
      return 'bg-green-500';
    }
    if (status === EventStatus.PERIOD1_ENDED) {
      return 'bg-orange-500';
    }
    return 'bg-app-brown';
  };

  const getStatusLabel = () => {
    const now = new Date();
    const p1Start = new Date(event.periods.period1.start);
    
    if (now < p1Start) {
      return 'COMING SOON';
    }
    if (status === EventStatus.PERIOD1_ACTIVE) {
      return 'PERIOD 1';
    }
    if (status === EventStatus.PERIOD2_ACTIVE) {
      return 'PERIOD 2';
    }
    if (status === EventStatus.PERIOD1_ENDED) {
      return 'BETWEEN';
    }
    return 'ENDED';
  };

  const getDateDisplay = () => {
    const now = new Date();
    const p1Start = new Date(event.periods.period1.start);
    
    if (status === EventStatus.PERIOD1_ACTIVE) {
      return `Period 1 ends: ${formatUserFriendlyDate(event.periods.period1.end)}`;
    }
    
    if (status === EventStatus.PERIOD2_ACTIVE && event.periods.period2) {
      return `Period 2 ends: ${formatUserFriendlyDate(event.periods.period2.end)}`;
    }
    
    if (status === EventStatus.PERIOD1_ENDED && event.periods.period2) {
      return `Period 2 starts: ${formatUserFriendlyDate(event.periods.period2.start)}`;
    }
    
    if (now < p1Start) {
      return `Raid starts: ${formatUserFriendlyDate(event.periods.period1.start)}`;
    }
    
    const lastEnd = event.periods.period2?.end || event.periods.period1.end;
    return `Raid ended: ${formatUserFriendlyDate(lastEnd)}`;
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
      additionalContent={
        <View className="flex-row items-center mb-xs">
          <View className="bg-purple-600 px-xs py-xxs rounded mr-xs">
            <Text className="text-app-white text-xs font-bold">{event.raidLevel}★ RAID</Text>
          </View>
          <Text className="typography-copy-bold text-app-text">{event.pokemonName}</Text>
          {event.teraType && (
            <Text className="typography-copy text-app-secondary ml-xs">
              ({event.teraType} Tera)
            </Text>
          )}
        </View>
      }
    >
      {event.periods.period2 && (
        <Text className="typography-copy text-app-accent mb-xs">
          Available in 2 periods
        </Text>
      )}

      {/* Caught/Uncaught toggle button with trophy icon */}
      {(status === EventStatus.PERIOD1_ACTIVE || status === EventStatus.PERIOD2_ACTIVE || status === EventStatus.ENDED) && (
        <EventClaimButton
          claimed={claimed}
          onToggle={toggleClaim}
          iconName="trophy"
          claimedLabel="✓ Caught"
          unclaimedLabel="Mark as Caught"
        />
      )}
    </BaseEventCard>
  );
};
