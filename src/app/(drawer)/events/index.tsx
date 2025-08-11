import React from 'react';
import { Stack, Link } from 'expo-router';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

import { eventConfig } from '@/constants/eventConfig';

interface EventCardProps {
  title: string;
  description: string;
  href: string;
  status: 'active' | 'upcoming' | 'ended';
  endDate?: string;
}

const EventCard: React.FC<EventCardProps> = ({ title, description, href, status, endDate }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'upcoming': return '#FF9800';
      case 'ended': return '#9E9E9E';
      default: return '#9E9E9E';
    }
  };

  return (
    <Link href={href as any} asChild>
      <Pressable style={styles.eventCard}>
        <View style={styles.eventHeader}>
          <Text style={styles.eventTitle}>{title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>
              {status === 'active' ? 'ACTIVE' : status === 'upcoming' ? 'UPCOMING' : 'ENDED'}
            </Text>
          </View>
        </View>
        <Text style={styles.eventDescription}>{description}</Text>
        {endDate && (
          <Text style={styles.endDate}>Ends: {endDate}</Text>
        )}
      </Pressable>
    </Link>
  );
};

// Helper function to determine event status based on dates
const getEventStatus = (startDate: string, endDate: string): 'active' | 'upcoming' | 'ended' => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'active';
};

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
    status: getEventStatus(config.startDate, config.endDate),
    endDate: formatUserFriendlyDate(config.endDate),
  }));

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
              endDate={event.endDate}
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
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    lineHeight: 24,
  },
  eventsContainer: {
    paddingHorizontal: 20,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  eventDescription: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
    marginBottom: 8,
  },
  endDate: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  noEvents: {
    padding: 40,
    alignItems: 'center',
  },
  noEventsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 8,
  },
  noEventsSubtitle: {
    fontSize: 14,
    color: '#9e9e9e',
    textAlign: 'center',
    lineHeight: 20,
  },
});
