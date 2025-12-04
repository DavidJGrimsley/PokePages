import React from 'react';
import { View, Text, ScrollView, Pressable, Linking, Platform } from 'react-native';
import { getGameLabel } from '~/utils/gameLabels';
import { VideoCarousel } from '~/components/Guides/VideoCarousel';
import { CounterBuilds } from '~/components/CounterBuilds';
import { Footer } from '~/components/Meta/Footer';

interface EventDetailLayoutProps {
  event: any;
  heroContent?: React.ReactNode;
  children?: React.ReactNode;
  showCounterBuilds?: boolean;
}

export const EventDetailLayout: React.FC<EventDetailLayoutProps> = ({
  event,
  heroContent,
  children,
  showCounterBuilds = false,
}) => {
  return (
    <ScrollView className="flex-1 bg-app-background dark:bg-dark-app-background">
      <View className="p-md">
        {/* H1 - Main Event Title */}
        <Text 
          className="text-app-text dark:text-dark-app-text mb-sm text-center"
          style={{ fontFamily: 'Modak', fontSize: 32 }}
        >
          {event.title}
        </Text>

        {/* H2 - Game Name */}
        <Text className="typography-subheader text-app-primary dark:text-app-accent mb-sm text-center">
          {getGameLabel(event.game, false)}
        </Text>

        {/* Description */}
        <Text className="typography-copy text-app-secondary dark:text-gray-400 mb-md text-center">
          {event.description}
        </Text>

        {/* Hero Content (EventCounter, PokemonStatsDisplay, etc.) */}
        {heroContent}

        {/* Event-specific content cards */}
        {children}

        {/* YouTube Videos */}
        {event.youtubeVideos && event.youtubeVideos.length > 0 && (
          <View className="mb-md">
            <Text className="typography-subheader text-app-text dark:text-dark-app-text mb-sm px-md">
              Video Guides
            </Text>
            <VideoCarousel 
              videoIds={event.youtubeVideos} 
              isMobile={Platform.OS === 'ios' || Platform.OS === 'android'} 
            />
          </View>
        )}

        {/* Official Links */}
        {event.officialLinks && event.officialLinks.length > 0 && (
          <View className="bg-app-white dark:bg-dark-app-background rounded-lg p-md mb-md border border-app-secondary dark:border-app-accent">
            <Text className="typography-subheader text-app-text dark:text-dark-app-text mb-sm">
              Official Links
            </Text>
            {event.officialLinks.map((link: string, index: number) => (
              <Pressable
                key={index}
                onPress={() => Linking.openURL(link)}
                className="mb-xs"
              >
                <Text className="typography-copy text-app-accent dark:text-app-primary underline">
                  🔗 {link}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {/* Counter Builds (for raids and counter events) */}
        {showCounterBuilds && event.pokemonName && (
          <CounterBuilds pokemonName={event.pokemonName} />
        )}
      </View>
      <Footer />
    </ScrollView>
  );
};
