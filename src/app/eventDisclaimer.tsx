import { Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, Text, View, Linking, Pressable, ScrollView } from 'react-native';
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
  return (
    <>
      <Stack.Screen options={{ title: '' }} />
        <ScrollView className="flex-1 bg-app-background p-lg">
          
          <Text className="typography-copy text-app-text text-center mb-md leading-6">
            This counter is <Text className="font-bold text-app-primary">unofficial and separate</Text> from the official Pokemon event.
          </Text>
          
          <View className="bg-app-white p-md rounded-lg mb-lg border-l-4 border-l-blue-500">
            <Text className="typography-subheader text-app-text mb-sm">📅 Official Event Details</Text>
            <Text className="typography-copy text-app-brown mb-sm leading-5">
              The official event requires players worldwide to collectively defeat {eventInfo.pokemonName} one million times between <Text className="font-semibold text-blue-600">{eventInfo.startDate} and {eventInfo.endDate}</Text>. 
              If this goal is met, a {eventInfo.pokemonName} will be distributed via Mystery Gift from <Text className="font-semibold text-blue-600">{eventInfo.distributionStart} to {eventInfo.distributionEnd}</Text>.
            </Text>

            {!(status === 'upcoming') && 
              <View className="mt-sm">
                <Pressable 
                  className="bg-blue-500 p-sm rounded-md mb-sm"
                  onPress={() => Linking.openURL(pokemonComUrl)}
                >
                  <Text className="text-white text-sm font-medium">🔗 Official Pokémon News - {eventInfo.pokemonName} Event</Text>
                </Pressable>
                {(status === 'ended' || status === 'distribution') && <Pressable 
                  className="bg-blue-500 p-sm rounded-md"
                  onPress={() => Linking.openURL(pokemonFinishedUrl)}
                >
                  <Text className="text-white text-sm font-medium">🔗 Goal Met News from Pokemon.com</Text>
                </Pressable>}
              </View>
            }

          </View>
          
          <View className="bg-app-white p-md rounded-lg mb-lg border-l-4 border-l-green-500">
            <Text className="typography-subheader text-app-text mb-sm">✅ Redeem your Mystery Gift during the distribution period if the goal is achieved </Text>
            <Pressable 
                className="bg-app-accent p-sm rounded-md"
                onPress={() => Linking.openURL(claimMysteryGiftUrl)}
              >
                <Text className="text-white text-sm font-medium">🔗 How to claim Mystery Gifts - Video from Mr. DJ (Developer of this app)</Text>
              </Pressable>
          </View>
          
          <View className="bg-app-white p-md rounded-lg mb-lg border-l-4 border-l-orange-500">
            <Text className="typography-subheader text-app-text mb-sm">🎯 Community Counter Info</Text>
            <View className="mb-sm">
              <Text className="typography-copy text-app-brown mb-xs leading-5">• This community counter helps us track progress but is not foolproof - there may be other players defeating {eventInfo.pokemonName} who aren&apos;t using this tracker.  </Text>
              <Text className="typography-copy text-app-brown mb-xs leading-5">• To Ensure Your Battles Count, connect to the internet periodically during the event</Text>
              <Text className="typography-copy text-app-brown mb-xs leading-5">• Check Poké Portal News for official progress updates</Text>
            </View>

            <Text className="typography-copy text-app-brown">
              <Text className="font-semibold text-app-primary"> Let&apos;s aim for more than the required million to account for any missed contributions!</Text>
            </Text>
          </View>
          
          <View className="bg-app-white p-md rounded-lg mb-lg border-l-4 border-l-purple-500">
            <Text className="typography-subheader text-app-text mb-sm">📚 Resources</Text>
            <Text className="typography-copy text-app-brown mb-sm leading-5">
              For raid guides and more information on the event from top content creators and trusted sources, check out:
            </Text>
            <View className="gap-2">
              <Pressable 
                className="bg-gray-600 p-sm rounded-md"
                onPress={() => Linking.openURL(serebiiUrl)}
              >
                <Text className="text-white text-sm font-medium">🔗 Serebii Event Guide - Detailed Battle Information</Text>
              </Pressable>
              <Pressable 
                className="bg-gray-600 p-sm rounded-md"
                onPress={() => Linking.openURL('https://www.youtube.com/@AustinJohnPlays')}
              >
                <Text className="text-white text-sm font-medium">🔗 Austin John Plays - YouTube Channel</Text>
              </Pressable>
              <Pressable 
                className="bg-gray-600 p-sm rounded-md"
                onPress={() => Linking.openURL('https://www.youtube.com/@Osirus')}
              >
                <Text className="text-white text-sm font-medium">🔗 Osirus - YouTube Channel</Text>
              </Pressable>
            </View>
          </View>
          
          <View className="bg-gradient-to-r from-yellow-400 to-orange-500 p-md rounded-lg shadow-app-large">
            <Text className="typography-subheader text-white mb-sm">🎁 Bonus Rewards</Text>
            <View>
              <Text className="typography-copy text-white mb-xs leading-5">
                • Every additional 100,000 defeats: <Text className="font-bold text-yellow-200">40 Tera Shards</Text>
              </Text>
              <Text className="typography-copy text-white leading-5">
                • Maximum: <Text className="font-bold text-yellow-200">400 Tera Shards</Text> (at 2 million total defeats)
              </Text>
            </View>
          </View>
        </ScrollView>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </>
  );
}

