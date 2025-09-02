import React from 'react';
import { Stack, Link } from 'expo-router';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

import { eventConfig } from '@/constants/eventConfig';
import { theme } from '@/constants/style/theme';
import { getEventStatus } from '~/utils/helperFX';
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
  const getStatusColor = () => {
    switch (status) {
      case 'active': return theme.colors.light.green;
      case 'distribution': return theme.colors.light.red;
      case 'upcoming': return theme.colors.light.flag;
      case 'ended': return theme.colors.light.brown;
      case 'limbo': return theme.colors.light.primary;
      default: return theme.colors.light.brown;
    }
  };

  return (
    <Link href={href as any} asChild>
      <Pressable style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>
              {status === 'active' ? 'ACTIVE' : status === 'distribution' ? 'CLAIM NOW!' : status === 'limbo' ? 'WAITING' : status === 'upcoming' ? 'UPCOMING' : 'ENDED'}
            </Text>
          </View>
        </View>
        <Text style={styles.eventDescription}>{description}</Text>
        {endDate && (
          <>
            {(status === 'upcoming') && (
              <Text style={styles.endDate}>Raid starts: {startDate}</Text>
            )}
            {(status === 'active') && (
              <Text style={styles.endDate}>Raid ends: {endDate}</Text>
            )}
            {status === 'limbo' && distributionStartDate && (
              <Text style={styles.endDate}>Distribution Starts: {distributionStartDate}</Text>
            )}
            {status === 'distribution' && distributionEndDate && (
              <Text style={styles.endDate}>Distribution Ends: {distributionEndDate}</Text>
            )}
            {status === 'ended' && (
              <Text style={styles.endDate}>Event ended: {distributionEndDate}</Text>
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
  console.log('status:', events.map(event => event.status));

  return (
    <>
      <Stack.Screen options={{ title: 'Pokemon Events' }} />
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Participate in global Pokemon challenges and events!</Text>
          
        </View>

        <View style={styles.eventsContainer}>
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
          <View style={styles.noEvents}>
            <Text style={styles.noEventsTitle}>No events available at the moment.</Text>
            <Text style={styles.noEventsSubtitle}>Check back later for new Pokemon events!</Text>
          </View>
        )}
      </ScrollView>
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.light.background,
  },
  header: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
  },
  title: {
    ...theme.typography.header,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
  },
  eventsContainer: {
    paddingHorizontal: theme.spacing.lg,
  },
  eventCard: {
    backgroundColor: theme.colors.light.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
    borderWidth: 1,
    borderColor: theme.colors.light.secondary,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  eventTitle: {
    ...theme.typography.subheader,
    color: theme.colors.light.primary,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    minWidth: 70,
    alignItems: 'center',
  },
  statusText: {
    color: theme.colors.light.white,
    fontSize: theme.fontSizes.xs,
    fontWeight: 'bold',
  },
  eventDescription: {
    ...theme.typography.copy,
    color: theme.colors.light.secondary,
    marginBottom: theme.spacing.xs,
  },
  endDate: {
    ...theme.typography.copy,
    color: theme.colors.light.text,
    fontStyle: 'italic',
  },
  noEvents: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  noEventsTitle: {
    ...theme.typography.subheader,
    color: theme.colors.light.brown,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  noEventsSubtitle: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    textAlign: 'center',
  },
});
