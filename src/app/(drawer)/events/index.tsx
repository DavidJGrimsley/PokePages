import React from 'react';
import { Stack } from 'expo-router';
import { View, Text, ScrollView } from 'react-native';
import Head from 'expo-router/head';

import { 
  allEvents, 
  getActiveEvents, 
  getArchivedEvents, 
  EventType,
  isCounterEvent,
  isTeraRaidEvent,
  isMysteryGiftEvent,
  isPromoCodeEvent
} from '~/constants/events';
import { 
  CounterEventCard, 
  TeraRaidEventCard, 
  MysteryGiftEventCard, 
  PromoCodeEventCard 
} from '~/components/Events';
import { Footer } from '@/src/components/Meta/Footer';

export default function EventsIndex() {
  // SEO meta content
  const title = 'Pokémon Events | Global Challenge Events & Mystery Gifts | PokePages';
  const description = 'Join global Pokémon challenge events and earn exclusive Mystery Gift rewards! Track active raids, upcoming events, and distribution periods for Pokémon Scarlet & Violet.';
  const keywords = 'pokemon events, mystery gift, global challenge, pokemon raids, tera raids, event distribution, pokemon scarlet violet events, promo codes';
  const canonicalUrl = 'https://pokepages.app/events';

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Pokémon Global Challenge Events",
    "description": description,
    "url": canonicalUrl,
    "about": [
      {
        "@type": "VideoGame",
        "name": "Pokémon Scarlet"
      },
      {
        "@type": "VideoGame",
        "name": "Pokémon Violet"
      }
    ]
  };

  // Get active and archived events by type
  const activePromoCodeEvents = getActiveEvents(EventType.PROMO_CODE);
  const archivedPromoCodeEvents = getArchivedEvents(EventType.PROMO_CODE);
  
  const activeMysteryGiftEvents = getActiveEvents(EventType.MYSTERY_GIFT);
  const archivedMysteryGiftEvents = getArchivedEvents(EventType.MYSTERY_GIFT);
  
  const activeTeraRaidEvents = getActiveEvents(EventType.TERA_RAID);
  const archivedTeraRaidEvents = getArchivedEvents(EventType.TERA_RAID);
  
  const activeCounterEvents = getActiveEvents(EventType.COUNTER);
  const archivedCounterEvents = getArchivedEvents(EventType.COUNTER);

  const hasAnyEvents = Object.keys(allEvents).length > 0;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="Poké Pages" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://pokepages.app/images/home-preview.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        
        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="https://pokepages.app/images/home-preview.png" />
        
        {/* Additional SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="author" content="Poké Pages" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </Head>
      <Stack.Screen options={{ title: 'Pokemon Events' }} />
      <ScrollView className="flex-1 bg-app-background dark:bg-dark-app-background">
        <View className="p-lg pb-md">
          <Text
            role="heading"
            aria-level={1}
            className="typography-display-responsive text-app-text dark:text-dark-app-text mb-md text-center"
          >
            Global Pokémon Events, Gifts, Raids, and Promo Codes
          </Text>
        </View>

        {/* Active Mystery Gifts Section */}
        {activeMysteryGiftEvents.length > 0 && (
          <View className="mb-lg">
            <View className="px-lg mb-md">
              <Text
                role="heading"
                aria-level={2}
                className="typography-header text-app-text dark:text-dark-app-text mb-sm"
              >
                🎁 Mystery Gifts & Special Distributions
              </Text>
              <Text className="typography-copy text-app-secondary">
                Discover special Mystery Gift distributions and exclusive Pokémon available for a limited time in Pokémon Scarlet & Violet!
              </Text>
            </View>
            <View className="px-lg">
              {activeMysteryGiftEvents.map((event) => 
                isMysteryGiftEvent(event) ? (
                  <MysteryGiftEventCard key={event.eventKey} event={event} eventKey={event.eventKey} />
                ) : null
              )}
            </View>
          </View>
        )}

        {/* Active Promo Codes Section */}
        {activePromoCodeEvents.length > 0 && (
          <View className="mb-lg">
            <View className="px-lg mb-md">
              <Text
                role="heading"
                aria-level={2}
                className="typography-header text-app-text dark:text-dark-app-text mb-sm"
              >
                🎟️ Promo Codes
              </Text>
              <Text className="typography-copy text-app-secondary">
                Enter these promo codes for exclusive Mystery Gift Pokémon and items! They are limited time only, so be sure to redeem them before they expire.
              </Text>
            </View>
            <View className="px-lg">
              {activePromoCodeEvents.map((event) => 
                isPromoCodeEvent(event) ? (
                  <PromoCodeEventCard key={event.eventKey} event={event} eventKey={event.eventKey} />
                ) : null
              )}
            </View>
          </View>
        )}

        {/* Active Tera Raids Section */}
        {activeTeraRaidEvents.length > 0 && (
          <View className="mb-lg">
            <View className="px-lg mb-md">
              <Text
                role="heading"
                aria-level={2}
                className="typography-header text-app-text dark:text-dark-app-text mb-sm"
              >
                ⚔️ Tera Raids
              </Text>
              <Text className="typography-copy text-app-secondary">
                Defeat 7-star raid bosses to catch the Mightiest Mark Pokémon, other special Pokémon, and earn exclusive rewards for Pokémon Scarlet & Violet!
              </Text>
            </View>
            <View className="px-lg">
              {activeTeraRaidEvents.map((event) => 
                isTeraRaidEvent(event) ? (
                  <TeraRaidEventCard key={event.eventKey} event={event} eventKey={event.eventKey} />
                ) : null
              )}
            </View>
          </View>
        )}

        {/* Active Global Participation Challenge Events Section */}
        {activeCounterEvents.length > 0 && (
          <View className="mb-lg">
            <View className="px-lg mb-md">
              <Text
                role="heading"
                aria-level={2}
                className="typography-header text-app-text dark:text-dark-app-text mb-sm"
              >
                🌍 Global Participation Challenge Events
              </Text>
              <Text className="typography-copy text-app-secondary">
                Join worldwide Pokémon raid events and work together with trainers across the globe to defeat powerful Pokémon. Complete challenges to unlock exclusive Mystery Gift rewards for Pokémon Scarlet & Violet!
              </Text>
            </View>
            <View className="px-lg">
              {activeCounterEvents.map((event) => 
                isCounterEvent(event) ? (
                  <CounterEventCard key={event.eventKey} event={event} eventKey={event.eventKey} />
                ) : null
              )}
            </View>
          </View>
        )}

        {/* Inactive Events Section */}
        {(archivedMysteryGiftEvents.length > 0 || archivedPromoCodeEvents.length > 0 || archivedTeraRaidEvents.length > 0 || archivedCounterEvents.length > 0) && (
          <View className="mb-lg">
            <View className="px-lg mb-md">
              <Text
                role="heading"
                aria-level={2}
                className="typography-header text-app-brown dark:text-dark-app-text mb-sm"
              >
                Inactive Events
              </Text>
            </View>

            {/* Archived Mystery Gifts */}
            {archivedMysteryGiftEvents.length > 0 && (
              <View className="mb-lg">
                <View className="px-lg mb-sm">
                  <Text className="typography-subheader text-app-text dark:text-dark-app-text">
                    🎁 Mystery Gifts & Special Distributions
                  </Text>
                </View>
                <View className="px-lg">
                  {archivedMysteryGiftEvents.map((event) => 
                    isMysteryGiftEvent(event) ? (
                      <MysteryGiftEventCard key={event.eventKey} event={event} eventKey={event.eventKey} />
                    ) : null
                  )}
                </View>
              </View>
            )}

            {/* Archived Promo Codes */}
            {archivedPromoCodeEvents.length > 0 && (
              <View className="mb-lg">
                <View className="px-lg mb-sm">
                  <Text className="typography-subheader text-app-text dark:text-dark-app-text">
                    🎟️ Promo Codes
                  </Text>
                </View>
                <View className="px-lg">
                  {archivedPromoCodeEvents.map((event) => 
                    isPromoCodeEvent(event) ? (
                      <PromoCodeEventCard key={event.eventKey} event={event} eventKey={event.eventKey} />
                    ) : null
                  )}
                </View>
              </View>
            )}

            {/* Archived Tera Raids */}
            {archivedTeraRaidEvents.length > 0 && (
              <View className="mb-lg">
                <View className="px-lg mb-sm">
                  <Text className="typography-subheader text-app-text dark:text-dark-app-text">
                    ⚔️ Tera Raids
                  </Text>
                </View>
                <View className="px-lg">
                  {archivedTeraRaidEvents.map((event) => 
                    isTeraRaidEvent(event) ? (
                      <TeraRaidEventCard key={event.eventKey} event={event} eventKey={event.eventKey} />
                    ) : null
                  )}
                </View>
              </View>
            )}

            {/* Archived Participation Challenges */}
            {archivedCounterEvents.length > 0 && (
              <View className="mb-lg">
                <View className="px-lg mb-sm">
                  <Text className="typography-subheader text-app-text dark:text-dark-app-text">
                    🌍 Global Participation Challenge Events
                  </Text>
                </View>
                <View className="px-lg">
                  {archivedCounterEvents.map((event) => 
                    isCounterEvent(event) ? (
                      <CounterEventCard key={event.eventKey} event={event} eventKey={event.eventKey} />
                    ) : null
                  )}
                </View>
              </View>
            )}
          </View>
        )}

        {!hasAnyEvents && (
          <View className="p-xl items-center">
            <Text className="typography-subheader text-app-brown text-center mb-xs">No events available at the moment.</Text>
            <Text className="typography-copy text-app-brown text-center">Check back later for new Pokemon events!</Text>
          </View>
        )}

        <Footer />
      </ScrollView>
    </>
  );
}
