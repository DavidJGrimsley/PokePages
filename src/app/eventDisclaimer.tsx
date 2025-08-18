import { Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Text, View, StyleSheet, Linking, Pressable, ScrollView } from 'react-native';

import { theme } from '../../constants/style/theme';
import { getEventStatus } from '~/utils/helperFX';

export default function EventDisclaimer() {
  const { eventData } = useLocalSearchParams<{ eventData?: string }>();
  
  // Parse event data or use default Wo-Chien data for backward compatibility
  let eventInfo = {
    pokemonName: 'Shiny Wo-Chien',
    startDate: 'July 22, 2025',
    endDate: 'August 3, 2025',
    distributionStart: 'August 7',
    distributionEnd: 'September 30, 2025',
  };
  
  if (eventData) {
    try {
      const parsed = JSON.parse(eventData);
      eventInfo = { ...eventInfo, ...parsed };
    } catch (error) {
      console.warn('Failed to parse event data:', error);
    }
  }

  // Sanitize Pokemon name for URL
  const sanitizePokemonNameForUrl = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '') // Remove all spaces
  };

  // Sanitize Pokemon name for Pokemon.com URL (they use hyphens instead of removing spaces)
  const sanitizePokemonNameForPokemonCom = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
  };

  const sanitizedPokemonName = sanitizePokemonNameForUrl(eventInfo.pokemonName);
  const sanitizedPokemonNameForPokemonCom = sanitizePokemonNameForPokemonCom(eventInfo.pokemonName);
  
  const serebiiUrl = `https://www.serebii.net/scarletviolet/teraraidbattles/event-${sanitizedPokemonName}spotlight.shtml`;
  const pokemonComUrl = `https://www.pokemon.com/us/pokemon-news/${sanitizedPokemonNameForPokemonCom}-appears-in-5-star-tera-raid-battles-in-pokemon-scarlet-and-pokemon-violet`;
  const pokemonFinishedUrl = `https://www.pokemon.com/us/pokemon-news/announcing-the-total-victories-against-${sanitizedPokemonNameForPokemonCom}-in-pokemon-scarlet-and-pokemon-violet`;
  const claimMysteryGiftUrl = 'https://youtu.be/63FRpg8slIw?si=CQGN-Qwy6hbuheUR&t=430';

  const status = getEventStatus(eventInfo.startDate, eventInfo.endDate, eventInfo.distributionStart, eventInfo.distributionEnd);
  console.log('Event Status:', status);
  return (
    <>
      <Stack.Screen options={{ title: '' }} />
        <ScrollView style={styles.container}>

          
          <Text style={styles.mainText}>
            This counter is <Text style={styles.highlight}>unofficial and separate</Text> from the official Pokemon event.
          </Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Official Event Details</Text>
            <Text style={styles.bodyText}>
              The official event requires players worldwide to collectively defeat {eventInfo.pokemonName} one million times between <Text style={styles.dateHighlight}>{eventInfo.startDate} and {eventInfo.endDate}</Text>. 
              If this goal is met, a {eventInfo.pokemonName} will be distributed via Mystery Gift from <Text style={styles.dateHighlight}>{eventInfo.distributionStart} to {eventInfo.distributionEnd}</Text>.
            </Text>

            {!(status === 'upcoming') && 
              <View style={styles.linksList}>
                <Pressable 
                  style={[styles.linkItem, styles.pokemonLink]}
                  onPress={() => Linking.openURL(pokemonComUrl)}
                >
                  <Text style={styles.linkText}>🔗 Official Pokémon News - {eventInfo.pokemonName} Event</Text>
                </Pressable>
                {(status === 'ended' || status === 'distribution') && <Pressable 
                  style={[styles.linkItem, styles.pokemonLink]}
                  onPress={() => Linking.openURL(pokemonFinishedUrl)}
                >
                  <Text style={styles.linkText}>🔗 Goal Met News from Pokemon.com</Text>
                </Pressable>}
              </View>
            }

          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Redeem your Mystery Gift during the distribution period if the goal is achieved </Text>
            <Pressable 
                style={[styles.linkItem, styles.myLink]}
                onPress={() => Linking.openURL(claimMysteryGiftUrl)}
              >
                <Text style={styles.linkText}>🔗 How to claim Mystery Gifts - Video from Mr. DJ (Developer of this app)</Text>
              </Pressable>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Community Counter Info</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>• This community counter helps us track progress but is not foolproof - there may be other players defeating {eventInfo.pokemonName} who aren&apos;t using this tracker.  </Text>
              <Text style={styles.tipItem}>• To Ensure Your Battles Count, connect to the internet periodically during the event</Text>
              <Text style={styles.tipItem}>• Check Poké Portal News for official progress updates</Text>
            </View>

            <Text style={styles.bodyText}>

              <Text style={styles.emphasis}> Let&apos;s aim for more than the required million to account for any missed contributions!</Text>
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📚 Resources</Text>
            <Text style={styles.bodyText}>
              For raid guides and more information on the event from top content creators and trusted sources, check out:
            </Text>
            <View style={styles.linksList}>
              <Pressable 
                style={[styles.linkItem, styles.outsideLink]}
                onPress={() => Linking.openURL(serebiiUrl)}
              >
                <Text style={styles.linkText}>🔗 Serebii Event Guide - Detailed Battle Information</Text>
              </Pressable>
              <Pressable 
                style={[styles.linkItem, styles.outsideLink]}
                onPress={() => Linking.openURL('https://www.youtube.com/@AustinJohnPlays')}
              >
                <Text style={styles.linkText}>🔗 Austin John Plays - YouTube Channel</Text>
              </Pressable>
              <Pressable 
                style={[styles.linkItem, styles.outsideLink]}
                onPress={() => Linking.openURL('https://www.youtube.com/@Osirus')}
              >
                <Text style={styles.linkText}>🔗 Osirus - YouTube Channel</Text>
              </Pressable>
            </View>
          </View>
          
          <View style={styles.rewardsBanner}>
            <Text style={styles.rewardsTitle}>🎁 Bonus Rewards</Text>
            <View style={styles.rewardsDetails}>
              <Text style={styles.rewardsDetailItem}>
                • Every additional 100,000 defeats: <Text style={styles.rewardHighlight}>40 Tera Shards</Text>
              </Text>
              <Text style={styles.rewardsDetailItem}>
                • Maximum: <Text style={styles.rewardHighlight}>400 Tera Shards</Text> (at 2 million total defeats)
              </Text>
            </View>
          </View>
        </ScrollView>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.light.background,
  },
  warningBanner: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 2,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  warningTitle: {
    fontSize: theme.fontSizes.header,
    fontWeight: theme.fontWeights.bold,
    color: '#856404',
    flex: 1,
  },
  mainText: {
    ...theme.typography.copy,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  highlight: {
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.light.red,
  },
  section: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.light.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.light.primary,
  },
  sectionTitle: {
    ...theme.typography.header,
    color: theme.colors.light.text,
    marginBottom: theme.spacing.md,
  },
  bodyText: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
  },
  dateHighlight: {
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.light.red,
    backgroundColor: '#fdf2f2',
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  tipsList: {
    marginTop: theme.spacing.sm,
  },
  tipItem: {
    ...theme.typography.copy,
    color: theme.colors.light.brown,
    marginBottom: theme.spacing.xs,
    paddingLeft: theme.spacing.sm,
  },
  emphasis: {
    fontWeight: theme.fontWeights.semibold,
    color: theme.colors.light.primary,
  },
  rewardsBanner: {
    backgroundColor: '#E8F5E8',
    borderColor: theme.colors.light.accent,
    borderWidth: 2,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.sm,
    alignItems: 'center',
  },
  rewardsTitle: {
    fontSize: theme.fontSizes.header,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.light.accent,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  rewardsText: {
    ...theme.typography.copy,
    color: theme.colors.light.primary,
    textAlign: 'center',
  },
  rewardsDetails: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.light.white,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.light.accent,
  },
  rewardsDetailTitle: {
    fontSize: theme.fontSizes.subheader,
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.light.accent,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  rewardsDetailItem: {
    ...theme.typography.copyBold,
    color: theme.colors.light.primary,
    marginBottom: theme.spacing.xs,
    paddingLeft: theme.spacing.xs,
  },
  rewardHighlight: {
    fontWeight: theme.fontWeights.bold,
    color: theme.colors.light.accent,
    backgroundColor: '#E8F5E8',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  rewardsDetailFooter: {
    ...theme.typography.copy,
    color: theme.colors.light.primary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
    fontStyle: 'italic',
  },
  linksList: {
    marginTop: theme.spacing.md,
  },
  linkItem: {
    borderWidth: 1,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  pokemonLink: {
    backgroundColor: theme.colors.light.red,
    // textShadowColor: theme.colors.light.white,
    borderColor: theme.colors.light.brown,
  },
  myLink: {
    backgroundColor: theme.colors.light.secondary,
    borderColor: theme.colors.light.primary,
  },
  outsideLink: {
    backgroundColor: theme.colors.light.accent,
    borderColor: theme.colors.light.primary,
  },
  linkText: {
    ...theme.typography.copyBold,
    // color: theme.colors.light.primary,
  },
});
