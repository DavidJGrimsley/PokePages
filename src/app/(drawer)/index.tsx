import { Stack, Link } from 'expo-router';
import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';

import { Container } from 'components/UI/Container';
import { NewestFeature } from 'components/Meta/NewestFeature';
import { eventConfig } from 'constants/eventConfig';
import DrizzleCounter from 'components/Events/DrizzleCounter';
import TypeChartDisplay from '@/src/components/Resources/TypeChartDisplay';
import AuthStatus from 'components/Auth/AuthStatus';

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
        <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 0 }}>
          {/* Auth Status Debug Component */}
          {/* <AuthStatus /> */}
          
          <View className="p-lg bg-app-white">
            <Text className="typography-header text-app-text mb-md">🎉 Latest Features</Text>
            
            {/* Featured newest feature */}
            <NewestFeature
              title="Type Calculator"
              description="Use when battling to see type advantages."
              path="/(drawer)/resources/type-calculator"
            />
          
            <Text className="typography-header text-app-text mb-md">🎉 Latest Events</Text>
            
            {/* Multiple Active Event Buttons */}
            {activeCounterEvents.map((event) => (
              <Link key={event.key} href={event.href} asChild>
                <Pressable className="bg-red-500 py-lg px-lg rounded-lg items-center mt-md mb-sm shadow-app-medium">
                  <Text className="typography-cta text-app-white text-center mb-xs">{event.buttonText}</Text>
                  <Text className="typography-copy text-app-white text-center opacity-90">Click to contribute to the global counter</Text>
                </Pressable>
              </Link>
            ))}
           
            <Link href="/(drawer)/events" asChild>
              <Pressable className="bg-app-secondary py-md px-lg rounded-md items-center mt-sm">
                <Text className="typography-cta text-app-white">View All Events</Text>
              </Pressable>
            </Link>
            
            <Text className="typography-header text-app-text mb-md">🎉 Latest News</Text>
          
            {/* Dynamic News Cards for Active Events */}
            {activeCounterEvents.map((event) => (
              <View key={event.key} className="bg-app-background p-md rounded-lg mb-md border-l-4 border-l-red-500">
                <Text className="typography-subheader text-app-text mb-sm">{event.pokemonName} Global Challenge is LIVE!</Text>
                <Text className="typography-copy text-app-brown mb-sm">
                  Join trainers worldwide in defeating {event.pokemonName} to unlock special Mystery Gift rewards. 
                  We need {event.targetCount.toLocaleString()} defeats by the event deadline!
                </Text>
                <Text className="text-xs text-red-500 font-medium">
                  Active until {formatEventDate(event.endDate)}
                </Text>
              </View>
            ))}

            {/* Static fallback if no active events */}
            {activeCounterEvents.length === 0 && (
              <View className="bg-app-background p-md rounded-lg mb-md border-l-4 border-l-red-500">
                <Text className="typography-subheader text-app-text mb-sm">Treasures of Ruin Event Series</Text>
                <Text className="typography-copy text-app-brown mb-sm">
                  No events are currently active. Check back for new events featuring the legendary Treasures of Ruin!
                </Text>
                <Text className="text-xs text-red-500 font-medium">Check back soon!</Text>
              </View>
            )}

            <View className="bg-app-background p-md rounded-lg mb-md border-l-4 border-l-red-500">
              <Text className="typography-subheader text-app-text mb-sm">Treasures of Ruin Event Series</Text>
              <Text className="typography-copy text-app-brown mb-sm">
                Four legendary Pokemon challenges featuring Wo-Chien, Chien-Pao, Ting-Lu, and Chi-Yu! 
                Each event runs for two weeks with different Tera Types and special rewards.
              </Text>
              <Text className="text-xs text-red-500 font-medium">Ongoing Series</Text>
            </View>
          </View>

          <View className="p-lg bg-app-background">
            <Text className="typography-header text-app-text mb-md">🌟 Features</Text>
            
            <View className="flex-row flex-wrap justify-between">
              <View className="bg-app-white p-md rounded-lg w-[48%] mb-md shadow-app-small">
                <Text className="typography-subheader text-app-text mb-sm">Global Counters</Text>
                <Text className="text-xs text-app-brown">
                  Track community progress on Pokemon defeat challenges with real-time counters
                </Text>
              </View>
              
              <View className="bg-app-white p-md rounded-lg w-[48%] mb-md shadow-app-small">
                <Text className="typography-subheader text-app-text mb-sm">Event Updates</Text>
                <Text className="text-xs text-app-brown">
                  Stay informed about the latest Pokemon events and distribution news
                </Text>
              </View>
              
              <View className="bg-app-white p-md rounded-lg w-[48%] mb-md shadow-app-small">
                <Text className="typography-subheader text-app-text mb-sm">Battle Strategies</Text>
                <Text className="text-xs text-app-brown">
                  Get tips and team recommendations for event Pokemon battles
                </Text>
              </View>
              
              <View className="bg-app-white p-md rounded-lg w-[48%] mb-md shadow-app-small">
                <Text className="typography-subheader text-app-text mb-sm">Community Driven</Text>
                <Text className="text-xs text-app-brown">
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


