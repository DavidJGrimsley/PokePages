import { Stack, Link } from 'expo-router';
import { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';

import { Container } from '~/components/Container';
import { NewestFeature } from '~/components/NewestFeature';
import { eventConfig } from '@/constants/eventConfig';
import { theme } from '@/constants/style/theme';

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
            <Text style={styles.sectionTitle}>🎉 Latest Features</Text>
            
            {/* Featured newest feature */}
            <NewestFeature
              title="Top Raid builds"
              description="Use these pokemon in 5, 6, and 7 star tera raids in Pokemon Scarlet and Violet."
              path="/(drawer)/resources/top50"
            />
            <Text style={styles.sectionTitle}>🎉 Latest News</Text>
          
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
            <Text style={styles.sectionTitle}>🎉 Latest Events</Text>
            
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

          <View style={styles.featuresSection}>
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
          </View>
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
    backgroundColor: theme.colors.light.primary,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    ...theme.typography.header,
    color: theme.colors.light.white,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.copy,
    color: theme.colors.light.white,
    textAlign: 'center',
    lineHeight: 22,
  },
  newsSection: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.light.white,
  },
  sectionTitle: {
    ...theme.typography.header,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.md,
  },
  newsCard: {
    backgroundColor: theme.colors.light.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.light.red,
  },
  newsTitle: {
    ...theme.typography.subheader,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.sm,
  },
  newsContent: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    lineHeight: 30,
    marginBottom: theme.spacing.sm,
  },
  newsDate: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.light.red,
    fontWeight: '500',
  },
  eventsButton: {
    backgroundColor: theme.colors.light.secondary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  eventsButtonText: {
    ...theme.typography.callToAction,
    color: theme.colors.light.white,
  },
  featuredButton: {
    backgroundColor: theme.colors.light.red,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.medium,
  },
  featuredButtonText: {
    ...theme.typography.callToAction,
    color: theme.colors.light.white,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  featuredButtonSubtext: {
    ...theme.typography.copy,
    color: theme.colors.light.white,
    textAlign: 'center',
    opacity: 0.9,
  },
  featuresSection: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.light.background,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    backgroundColor: theme.colors.light.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    width: '48%',
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  featureTitle: {
    ...theme.typography.subheader,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.sm,
  },
  featureText: {
    fontSize: theme.fontSizes.xs,
    color: theme.colors.light.brown,
    lineHeight: 16,
  },
});
