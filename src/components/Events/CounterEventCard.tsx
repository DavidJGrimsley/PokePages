import React from 'react';
import { View } from 'react-native';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

import { CounterEvent, EventStatus } from '~/constants/events/types';
import { getCounterEventStatus } from '~/utils/helperFX';
import { useEventClaim } from '~/services/eventClaimsService';
import { BaseEventCard } from './BaseEventCard';
import { EventClaimButton } from './EventClaimButton';

interface CounterEventCardProps {
  event: CounterEvent;
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

export const CounterEventCard: React.FC<CounterEventCardProps> = ({ event, eventKey }) => {
  const status = getCounterEventStatus(
    event.startDate,
    event.endDate,
    event.distributionStart,
    event.distributionEnd
  );
  const { claimed, toggleClaim } = useEventClaim(eventKey);

  const getStatusBgClass = () => {
    switch (status) {
      case EventStatus.ACTIVE:
        return 'bg-green-500';
      case EventStatus.DISTRIBUTION:
        return 'bg-red-500';
      case EventStatus.UPCOMING:
        return 'bg-orange-500';
      case EventStatus.ENDED:
        return 'bg-app-brown';
      case EventStatus.LIMBO:
        return 'bg-app-primary';
      default:
        return 'bg-app-brown';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case EventStatus.ACTIVE:
        return 'ACTIVE';
      case EventStatus.DISTRIBUTION:
        return 'CLAIM NOW!';
      case EventStatus.LIMBO:
        return 'WAITING';
      case EventStatus.UPCOMING:
        return 'COMING SOON';
      case EventStatus.ENDED:
        return 'ENDED';
      default:
        return 'ENDED';
    }
  };

  const getDateDisplay = () => {
    switch (status) {
      case EventStatus.UPCOMING:
        return `Raid starts: ${formatUserFriendlyDate(event.startDate)}`;
      case EventStatus.ACTIVE:
        return `Raid ends: ${formatUserFriendlyDate(event.endDate)}`;
      case EventStatus.LIMBO:
        return `Distribution Starts: ${formatUserFriendlyDate(event.distributionStart)}`;
      case EventStatus.DISTRIBUTION:
        return `Distribution Ends: ${formatUserFriendlyDate(event.distributionEnd)}`;
      case EventStatus.ENDED:
        return `Event ended: ${formatUserFriendlyDate(event.distributionEnd)}`;
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
      {/* Claim button for distribution phase */}
      {status === EventStatus.DISTRIBUTION && (
        <EventClaimButton
          claimed={claimed}
          onToggle={toggleClaim}
          iconName="gift"
          claimedLabel="✓ Claimed"
          unclaimedLabel="Mark as Claimed"
        />
      )}
    </BaseEventCard>
  );
};
