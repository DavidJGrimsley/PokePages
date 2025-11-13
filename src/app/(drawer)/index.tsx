import { Stack, Link } from 'expo-router';
import Head from 'expo-router/head';
import { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Platform } from 'react-native';

import { Container } from 'components/UI/Container';
import { NewestFeature } from 'components/Meta/NewestFeature';
import { eventConfig } from 'constants/eventConfig';
// ...existing code...
import TypeChartDisplay from '@/src/components/Resources/TypeChartDisplay';
import AuthStatus from 'components/Auth/AuthStatus';
import { Footer } from '@/src/components/Meta/Footer';

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
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  
  // SEO meta content
  const title = 'Poké Pages | The Ultimate Pokémon Companion App';
  const description = 'Join thousands of trainers on Poké Pages, a social and resource hub! Track global Pokémon events, participate in community challenges, access battle strategies, type calculators, and stay updated with the latest Pokémon news and distributions.';
  const keywords = 'Pokemon, Poké Pages, Pokemon events, Pokemon battles, Pokemon community, Pokemon type chart, Pokemon strategies, Pokemon news, Pokemon Scarlet Violet, Legends Z-A, Treasures of Ruin, global challenges, Pokemon counters';
  
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
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="Poké Pages" />
        <meta property="og:image" content="https://pokepages.app/images/home-preview.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://pokepages.app/images/home-preview.png" />
        
        {/* Additional SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Poké Pages" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://pokepages.app" />
      </Head>
      <Container>
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, padding: 0 }}
          showsVerticalScrollIndicator={false}
          >
          {/* Download App Banner */}
         {!isMobile && (<Link href="/download" asChild>
            <Pressable className="bg-gradient-to-r from-blue-600 to-purple-600 py-md px-lg items-center shadow-app-medium">
              <View className="flex-row items-center">
                <Text className="typography-cta text-app-white mr-sm">📱</Text>
                <View>
                  <Text className="typography-cta text-app-white">Download Poké Pages App</Text>
                  <Text className="text-sm text-app-white opacity-90">Get early access - Sign up now!</Text>
                </View>
              </View>
            </Pressable>
          </Link>)}
          
          {/* Auth Status Debug Component */}
          
          <View className="p-lg bg-app-background dark:bg-dark-app-background">
            {/* */}
            <Text
              role="heading"
              aria-level={1}
              className="text-lg font-semibold text-center text-gray-700 dark:text-app-flag"
            >
              The Ultimate (Unofficial) Pokémon Hub
            </Text>
            <Text
              role="heading"
              aria-level={2}
              className="text-sm font-semibold text-center text-app-text dark:text-dark-app-text"
            >
              Your home for Pokémon events, strategies, and community connection
            </Text>

            {/* Messages Link */}
            <Link href="/(drawer)/social/(tabs)/messages" asChild>
              <Pressable className="bg-app-accent mb-8 py-md px-lg rounded-md items-center mt-sm">
                <Text className="typography-cta text-app-background dark:text-dark-app-background">Messages</Text>
              </Pressable>
            </Link>
            
            {/* Shortcuts */}
            {/* Should be a simple button that takes you to your favorite features, like the type calculator/chart */}
            
            {/* Featured newest feature */}
            <NewestFeature
              title="Legends Z-A Strategies"
              description="All the info for Pokémon Legends Z-A!"
              path="/(drawer)/guides/PLZA/strategies"
            />
          
            <Text
              role="heading"
              aria-level={3}
              className="typography-header text-app-secondary m-md"
            >
              Latest Events
            </Text>
            
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
              <Pressable className="bg-app-accent py-md px-lg rounded-md items-center mt-sm">
                <Text className="typography-cta text-app-background dark:text-dark-app-background">View All Events</Text>
              </Pressable>
            </Link>
            
            <Text
              role="heading"
              aria-level={3}
              className="typography-header text-app-secondary m-md"
            >
              Latest News
            </Text>
          
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

          <View className="p-lg rounded-lg mb-0 border-t-2 border-b-2 border-app-flag">
            <Text
              role="heading"
              aria-level={3}
              className="typography-header dark:text-app-background text-dark-app-background  mb-md"
            >
              Features
            </Text>
            
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
          <Footer />
        </ScrollView>
      </Container>
    </>
  );
}


