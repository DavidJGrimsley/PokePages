import React from 'react';
import { Stack } from 'expo-router';
import { ScrollView } from 'react-native';
import Head from 'expo-router/head';
import { teraBuildsTop50 } from 'constants/teraBuildsTop50Config';
import { CounterBuilds } from 'components/CounterBuilds';
import { theme } from 'constants/style/theme';

export default function Top50Builds() {
  // SEO meta content
  const title = 'Top 50 Tera Raid Builds | Best Pokémon for Tera Raids | PokePages';
  const description = 'The top 50 best Pokémon builds for Tera Raids in Scarlet and Violet. Complete movesets, EVs, items, and strategies for both attackers and defenders.';
  const keywords = 'top 50 tera raid builds, best tera raid pokemon, raid builds, optimal movesets, tera raid attackers, tera raid defenders, pokemon sv builds, competitive builds';
  const canonicalUrl = 'https://pokepages.app/guides/gen9/top50';

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "url": canonicalUrl,
    "author": {
      "@type": "Organization",
      "name": "PokePages"
    },
    "publisher": {
      "@type": "Organization",
      "name": "PokePages"
    },
    "about": [
      {
        "@type": "VideoGame",
        "name": "Pokémon Scarlet"
      },
      {
        "@type": "VideoGame",
        "name": "Pokémon Violet"
      }
    ],
    "articleSection": "Strategy Guide"
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={canonicalUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </Head>
      <Stack.Screen options={{ title: 'Top 50 Builds' }} />
      <ScrollView style={{ flex: 1, backgroundColor: theme.colors.light.white }}>
        {teraBuildsTop50 && (
                  <CounterBuilds
                    attackerBuilds={teraBuildsTop50['Top Tera Raid Pokémon Builds'].attackers}
                    defenderBuilds={teraBuildsTop50['Top Tera Raid Pokémon Builds'].defenders}
                  />
                )}
      </ScrollView>
    </>
  );
}
