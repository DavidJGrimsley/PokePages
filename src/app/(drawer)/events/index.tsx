import React from 'react';
import { Stack, Link } from 'expo-router';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

import { eventConfig } from 'constants/eventConfig';
import { getEventStatus } from 'utils/helperFX';
import { cn } from '~/utils/cn';
interface EventCardProps {
  title: string;
  description: string;
  href: string;
  status: 'upcoming' | 'active' | 'limbo' | 'distribution' | 'ended';
  startDate?: string;
  endDate?: string;
  distributionStartDate?: string;
  distributionEndDate?: string;
}

const EventCard: React.FC<EventCardProps> = ({ title, description, href, status, startDate, endDate, distributionStartDate, distributionEndDate }) => {
  const getStatusBgClass = () => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'distribution': return 'bg-red-500';
      case 'upcoming': return 'bg-orange-500';
      case 'ended': return 'bg-app-brown';
      case 'limbo': return 'bg-app-primary';
      default: return 'bg-app-brown';
    }
  };

  return (
    <Link href={href as any} asChild>
      <Pressable className="bg-app-white rounded-lg p-md mb-md shadow-app-small border border-app-secondary">
        <View className="flex-row justify-between items-start mb-sm">
          <Text className="typography-subheader text-app-primary flex-1 mr-sm">{title}</Text>
          <View className={cn("px-sm py-xs rounded-md min-w-[70px] items-center", getStatusBgClass())}>
            <Text className="text-app-white text-xs font-bold">
              {status === 'active' ? 'ACTIVE' : status === 'distribution' ? 'CLAIM NOW!' : status === 'limbo' ? 'WAITING' : status === 'upcoming' ? 'UPCOMING' : 'ENDED'}
            </Text>
          </View>
        </View>
        <Text className="typography-copy text-app-secondary mb-xs">{description}</Text>
        {endDate && (
          <>
            {(status === 'upcoming') && (
              <Text className="typography-copy text-app-text italic">Raid starts: {startDate}</Text>
            )}
            {(status === 'active') && (
              <Text className="typography-copy text-app-text italic">Raid ends: {endDate}</Text>
            )}
            {status === 'limbo' && distributionStartDate && (
              <Text className="typography-copy text-app-text italic">Distribution Starts: {distributionStartDate}</Text>
            )}
            {status === 'distribution' && distributionEndDate && (
              <Text className="typography-copy text-app-text italic">Distribution Ends: {distributionEndDate}</Text>
            )}
            {status === 'ended' && (
              <Text className="typography-copy text-app-text italic">Event ended: {distributionEndDate}</Text>
            )}
          </>
        )}
      </Pressable>
    </Link>
  );
};

// Helper function to determine event status based on dates
// const getEventStatus = (startDate: string, endDate: string, distributionStartDate: string, distributionEndDate: string): 'active' | 'upcoming' | 'distribution' | 'ended' => {
//   const now = new Date();
//   const start = new Date(startDate);
//   const end = new Date(endDate);
//   const distributionStart = new Date(distributionStartDate);
//   const distributionEnd = new Date(distributionEndDate);

//   if (now < start) return 'upcoming';
//   if (now < end) return 'active';
//   if (now > distributionStart && now < distributionEnd) return 'distribution';
//   return 'ended';
// };


// Format date to user-friendly format
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

export default function EventsIndex() {
  // Generate events from our configuration
  const events = Object.entries(eventConfig).map(([key, config]) => ({
    title: config.eventTitle,
    description: `Help defeat ${config.pokemonName} 1 million times worldwide to unlock Mystery Gift rewards!`,
    href: `/(drawer)/events/${key}` as any,
    status: getEventStatus(config.startDate, config.endDate, config.distributionStart, config.distributionEnd),
    startDate: formatUserFriendlyDate(config.startDate),
    endDate: formatUserFriendlyDate(config.endDate),
    distributionEndDate: formatUserFriendlyDate(config.distributionEnd),
    distributionStartDate: formatUserFriendlyDate(config.distributionStart),
  }));

  return (
    <>
      <Stack.Screen options={{ title: 'Pokemon Events' }} />
      <ScrollView className="flex-1 bg-app-background">
        <View className="p-lg pb-md">
          <Text className="typography-header text-app-text mb-xs">Participate in global Pokemon challenges and events!</Text>
        </View>

        <View className="px-lg">
          {events.map((event, index) => (
            <EventCard
              key={index}
              title={event.title}
              description={event.description}
              href={event.href}
              status={event.status}
              startDate={event.startDate}
              endDate={event.endDate}
              distributionEndDate={event.distributionEndDate}
              distributionStartDate={event.distributionStartDate}
            />
          ))}
        </View>

        {events.length === 0 && (
          <View className="p-xl items-center">
            <Text className="typography-subheader text-app-brown text-center mb-xs">No events available at the moment.</Text>
            <Text className="typography-copy text-app-brown text-center">Check back later for new Pokemon events!</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}
