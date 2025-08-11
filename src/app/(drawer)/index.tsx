import { Stack, Link } from 'expo-router';
import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';

import { Container } from '~/components/Container';
import { eventConfig } from '@/constants/eventConfig';

const getEventStatus = (startDate: string, endDate: string): 'active' | 'upcoming' | 'ended' => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) return 'upcoming';
  if (now > end) return 'ended';
  return 'active';
};

const formatEventDate = (dateString: string, userLocale: string = 'en-US'): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString(userLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
};

export default function Home() {

  // Generate events from our configuration
  const activeCounterEvents = useMemo(() => 
    Object.entries(eventConfig)
      .map(([key, config]) => ({
        key,
        buttonText: `Join the ${config.pokemonName} Challenge!`,
        href: `/(drawer)/events/${key}` as any,
        status: getEventStatus(config.startDate, config.endDate),
        isActive: getEventStatus(config.startDate, config.endDate) === 'active',
        pokemonName: config.pokemonName,
        endDate: config.endDate,
        teraType: config.teraType,
        targetCount: config.targetCount,
      }))
      .filter(event => event.isActive),
    [] // Empty dependency array means it only calculates once
  );

  return (
    <>
      <Stack.Screen options={{ title: 'Poké Pages' }} />
      <Container>
        <ScrollView contentContainerStyle={styles.container}>
          

          <View style={styles.newsSection}>
            <Text style={styles.sectionTitle}>🎉 Latest News & Events</Text>
            
            {/* Dynamic News Cards for Active Events */}
            {activeCounterEvents.map((event) => (
              <View key={event.key} style={styles.newsCard}>
                <Text style={styles.newsTitle}>{event.pokemonName} Global Challenge is LIVE!</Text>
                <Text style={styles.newsContent}>
                  Join trainers worldwide in defeating {event.pokemonName} to unlock special Mystery Gift rewards. 
                  We need {event.targetCount.toLocaleString()} defeats by the event deadline!
                </Text>
                <Text style={styles.newsDate}>
                  Active until {formatEventDate(event.endDate)}
                </Text>
              </View>
            ))}

            {/* Static fallback if no active events */}
            {activeCounterEvents.length === 0 && (
              <View style={styles.newsCard}>
                <Text style={styles.newsTitle}>Treasures of Ruin Event Series</Text>
                <Text style={styles.newsContent}>
                  No events are currently active. Check back for new events featuring the legendary Treasures of Ruin!
                </Text>
                <Text style={styles.newsDate}>Check back soon!</Text>
              </View>
            )}

            <View style={styles.newsCard}>
              <Text style={styles.newsTitle}>Treasures of Ruin Event Series</Text>
              <Text style={styles.newsContent}>
                Four legendary Pokemon challenges featuring Wo-Chien, Chien-Pao, Ting-Lu, and Chi-Yu! 
                Each event runs for two weeks with different Tera Types and special rewards.
              </Text>
              <Text style={styles.newsDate}>Ongoing Series</Text>
            </View>

            {/* { activeCounterEvent.length > 0 && (
              <Link href={activeCounterEvent[0]?.href} asChild>
                <Pressable style={styles.featuredButton}>
                  <Text style={styles.featuredButtonText}>{activeCounterEvent[0]?.buttonText}</Text>
                  <Text style={styles.featuredButtonSubtext}>Click to contribute to the global counter</Text>
                </Pressable>
              </Link>
            )} */}

            {/* Multiple Active Event Buttons */}
            {activeCounterEvents.map((event) => (
              <Link key={event.key} href={event.href} asChild>
                <Pressable style={styles.featuredButton}>
                  <Text style={styles.featuredButtonText}>{event.buttonText}</Text>
                  <Text style={styles.featuredButtonSubtext}>Click to contribute to the global counter</Text>
                </Pressable>
              </Link>
            ))}
            {/* <Link href="/(drawer)/events/wo-chien" asChild>
              <Pressable style={styles.featuredButton}>
                <Text style={styles.featuredButtonText}>🚀 Join the Shiny Wo-Chien Challenge!</Text>
                <Text style={styles.featuredButtonSubtext}>Click to contribute to the global counter</Text>
              </Pressable>
            </Link> */}

            <Link href="/(drawer)/events" asChild>
              <Pressable style={styles.eventsButton}>
                <Text style={styles.eventsButtonText}>View All Events</Text>
              </Pressable>
            </Link>
          </View>

          {/* <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>🌟 Features</Text>
            
            <View style={styles.featureGrid}>
              <View style={styles.featureCard}>
                <Text style={styles.featureTitle}>Global Counters</Text>
                <Text style={styles.featureText}>
                  Track community progress on Pokemon defeat challenges with real-time counters
                </Text>
              </View>
              
              <View style={styles.featureCard}>
                <Text style={styles.featureTitle}>Event Updates</Text>
                <Text style={styles.featureText}>
                  Stay informed about the latest Pokemon events and distribution news
                </Text>
              </View>
              
              <View style={styles.featureCard}>
                <Text style={styles.featureTitle}>Battle Strategies</Text>
                <Text style={styles.featureText}>
                  Get tips and team recommendations for event Pokemon battles
                </Text>
              </View>
              
              <View style={styles.featureCard}>
                <Text style={styles.featureTitle}>Community Driven</Text>
                <Text style={styles.featureText}>
                  Join thousands of trainers working together towards common goals
                </Text>
              </View>
            </View>
          </View> */}
        </ScrollView>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 0,
  },
  header: {
    backgroundColor: '#3498db',
    padding: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ecf0f1',
    textAlign: 'center',
    lineHeight: 22,
  },
  newsSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  newsCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#e74c3c',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  newsContent: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    marginBottom: 8,
  },
  newsDate: {
    fontSize: 12,
    color: '#e74c3c',
    fontWeight: '500',
  },
  eventsButton: {
    backgroundColor: '#3498db',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  eventsButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  featuredButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  featuredButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  featuredButtonSubtext: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.9,
  },
  featuresSection: {
    padding: 20,
    backgroundColor: '#ecf0f1',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 16,
  },
});
