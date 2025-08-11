import { Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Text, View, StyleSheet, Linking, Pressable } from 'react-native';

import { ScreenContent } from '~/components/ScreenContent';

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
      // .replace(/[^a-z0-9-]/g, '') // Remove special characters except hyphens
      // .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      // .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  // Sanitize Pokemon name for Pokemon.com URL (they use hyphens instead of removing spaces)
  const sanitizePokemonNameForPokemonCom = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      // .replace(/[^a-z0-9-]/g, '') // Remove special characters except hyphens
      // .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      // .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  };

  const sanitizedPokemonName = sanitizePokemonNameForUrl(eventInfo.pokemonName);
  const sanitizedPokemonNameForPokemonCom = sanitizePokemonNameForPokemonCom(eventInfo.pokemonName);
  
  const serebiiUrl = `https://www.serebii.net/scarletviolet/teraraidbattles/event-${sanitizedPokemonName}spotlight.shtml`;
  const pokemonComUrl = `https://www.pokemon.com/us/pokemon-news/${sanitizedPokemonNameForPokemonCom}-appears-in-5-star-tera-raid-battles-in-pokemon-scarlet-and-pokemon-violet`;

  return (
    <>
      <Stack.Screen options={{ title: '' }} />
      <ScreenContent path="app/modal.tsx" title="Extra Info">
        <View style={styles.container}>

          
          <Text style={styles.mainText}>
            This counter is <Text style={styles.highlight}>unofficial and separate</Text> from the official Pokemon event.
          </Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Official Event Details</Text>
            <Text style={styles.bodyText}>
              The official event requires players worldwide to collectively defeat {eventInfo.pokemonName} one million times between <Text style={styles.dateHighlight}>{eventInfo.startDate} and {eventInfo.endDate}</Text>. 
              If this goal is met, a {eventInfo.pokemonName} will be distributed via Mystery Gift from <Text style={styles.dateHighlight}>{eventInfo.distributionStart} to {eventInfo.distributionEnd}</Text>.
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ To Ensure Your Battles Count</Text>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>• Connect to the internet periodically during the event</Text>
              <Text style={styles.tipItem}>• Check Poké Portal News for official progress updates</Text>
              <Text style={styles.tipItem}>• Redeem your Mystery Gift during the distribution period if the goal is achieved</Text>
            </View>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎯 Community Counter Info</Text>
            <Text style={styles.bodyText}>
              This community counter helps us track progress but is not foolproof - there may be other players defeating {eventInfo.pokemonName} who aren&apos;t using this tracker. 
              <Text style={styles.emphasis}> Let&apos;s aim for more than the required million to account for any missed contributions!</Text>
            </Text>
          </View>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📚 Resources</Text>
            <Text style={styles.bodyText}>
              For complete event details and updates:
            </Text>
            <View style={styles.linksList}>
              <Pressable 
                style={styles.linkItem}
                onPress={() => Linking.openURL(pokemonComUrl)}
              >
                <Text style={styles.linkText}>🔗 Official Pokémon News - {eventInfo.pokemonName} Event</Text>
              </Pressable>
            </View>
            <Text style={styles.bodyText}>
              For raid guides and more information on the event from top content creators and trusted sources, check out:
            </Text>
            <View style={styles.linksList}>
              <Pressable 
                style={styles.linkItem}
                onPress={() => Linking.openURL(serebiiUrl)}
              >
                <Text style={styles.linkText}>🔗 Serebii Event Guide - Detailed Battle Information</Text>
              </Pressable>
              <Pressable 
                style={styles.linkItem}
                onPress={() => Linking.openURL('https://www.youtube.com/@AustinJohnPlays')}
              >
                <Text style={styles.linkText}>🔗 Austin John Plays - YouTube Channel</Text>
              </Pressable>
              <Pressable 
                style={styles.linkItem}
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
        </View>
      </ScreenContent>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
  },
  warningBanner: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#856404',
    flex: 1,
  },
  mainText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  highlight: {
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#555',
  },
  dateHighlight: {
    fontWeight: '600',
    color: '#e74c3c',
    backgroundColor: '#fdf2f2',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tipsList: {
    marginTop: 8,
  },
  tipItem: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
    marginBottom: 6,
    paddingLeft: 8,
  },
  emphasis: {
    fontWeight: '600',
    color: '#2980b9',
  },
  rewardsBanner: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    alignItems: 'center',
  },
  rewardsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center',
  },
  rewardsText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1B5E20',
    textAlign: 'center',
  },
  rewardsDetails: {
    marginTop: 16,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  rewardsDetailTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
    textAlign: 'center',
  },
  rewardsDetailItem: {
    fontSize: 16,
    lineHeight: 18,
    color: '#1B5E20',
    marginBottom: 4,
    paddingLeft: 4,
  },
  rewardHighlight: {
    fontWeight: 'bold',
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  rewardsDetailFooter: {
    fontSize: 12,
    color: '#388E3C',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  linksList: {
    marginTop: 12,
  },
  linkItem: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
});
