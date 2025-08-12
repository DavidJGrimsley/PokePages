import React from 'react';
import { ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { EventCounter } from '~/components/EventCounter';
import { CounterBuilds } from '@/src/components/CounterBuilds';
import { eventConfig } from '@/constants/eventConfig';
import { buildsConfig } from '@/constants/buildsConfig';

// Static generation for all event slugs
export async function generateStaticParams(): Promise<{ counterEvent: string }[]> {
  // Use the keys from eventConfig as the valid event slugs
  return Object.keys(eventConfig).map((key) => ({ counterEvent: key }));
}

export default function CounterEvent() {
  const { counterEvent } = useLocalSearchParams<{ counterEvent: string }>();
  
  // Ensure counterEvent is a string (handle both array and string cases)
  let eventSlug = Array.isArray(counterEvent) ? counterEvent[0] : counterEvent;
  
  // During static generation, we might get the literal route parameter
  // In this case, we'll use client-side routing to get the actual parameter
  if (eventSlug === '[counterEvent]' || !eventSlug) {
    // Try to get from the current URL if we're on the client
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const match = pathname.match(/\/events\/([^\/]+)$/);
      if (match && match[1] && eventConfig[match[1] as keyof typeof eventConfig]) {
        eventSlug = match[1];
      }
    }
    
    // If we still don't have a valid slug, default to the first available event
    if (!eventSlug || eventSlug === '[counterEvent]' || !eventConfig[eventSlug as keyof typeof eventConfig]) {
      eventSlug = Object.keys(eventConfig)[0]; // Default to first event
    }
  }
  
  // Get the event configuration for this Pokemon
  const config = eventSlug ? eventConfig[eventSlug as keyof typeof eventConfig] : null;
  
  // If no config found, try the first available event as fallback
  const finalConfig = config || eventConfig[Object.keys(eventConfig)[0] as keyof typeof eventConfig];
  const finalEventSlug = config ? eventSlug : Object.keys(eventConfig)[0];
  
  // Get builds for this specific event
  const eventBuilds = buildsConfig[finalEventSlug as keyof typeof buildsConfig];

  // SEO meta content
  const title = `Shiny ${finalConfig.pokemonName} Event Counters & Tera Raid Builds | PokePages`;
  const description = `Best counters and builds for the Shiny ${finalConfig.pokemonName} Tera Raid event in Pokémon Scarlet & Violet. Find effective strategies, optimal builds, and complete event details for ${finalConfig.pokemonName}.`;
  const keywords = `shiny ${finalConfig.pokemonName.toLowerCase()}, ${finalConfig.pokemonName.toLowerCase()} counters, tera raid builds, pokemon scarlet violet, ${finalConfig.pokemonName.toLowerCase()} event, tera raid battles, pokemon builds, ${finalConfig.pokemonName.toLowerCase()} strategy`;
  const shinyPokemonName = `Shiny ${finalConfig.pokemonName}`;
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "author": {
      "@type": "Organization",
      "name": "PokePages"
    },
    "publisher": {
      "@type": "Organization",
      "name": "PokePages"
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://pokepages.app/events/${finalEventSlug}`
    },
    "keywords": keywords,
    "about": {
      "@type": "VideoGame",
      "name": "Pokémon Scarlet and Violet"
    }
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </Head>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <EventCounter
          pokemonName={finalConfig.pokemonName}
          pokemonId={finalConfig.pokemonId}
          teraType={finalConfig.teraType}
          eventTitle={finalConfig.eventTitle}
          eventDescription={finalConfig.eventDescription}
          eventKey={finalEventSlug}
          startDate={finalConfig.startDate}
          endDate={finalConfig.endDate}
          distributionStart={finalConfig.distributionStart}
          distributionEnd={finalConfig.distributionEnd}
          targetCount={finalConfig.targetCount}
          maxRewards={finalConfig.maxRewards}
        />
        
        {eventBuilds && (
          <CounterBuilds
            bossPokemonName={shinyPokemonName}
            attackerBuilds={eventBuilds.attackers}
            defenderBuilds={eventBuilds.defenders}
          />
        )}
      </ScrollView>
    </>
  );
}
