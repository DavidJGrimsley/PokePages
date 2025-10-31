import React from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import Head from 'expo-router/head';
import AskSimple from 'components/AI/askSimple';
import { theme } from 'constants/style/theme';

export default function Ask() {
  // SEO meta content
  const title = 'Ask AI About Pokémon | AI-Powered Pokémon Assistant | PokePages';
  const description = 'Get instant answers about Pokémon from our AI assistant. Ask questions about types, strategies, stats, moves, and more. Your personal Pokémon knowledge companion.';
  const keywords = 'pokemon ai, ask about pokemon, pokemon assistant, pokemon questions, pokemon help, ai pokemon guide';
  const canonicalUrl = 'https://pokepages.app/resources/ask';

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Pokémon AI Assistant",
    "description": description,
    "url": canonicalUrl,
    "applicationCategory": "GameApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "AI-powered Pokémon assistant",
      "Type effectiveness questions",
      "Strategy recommendations",
      "Move and ability information",
      "Stat comparisons"
    ]
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
      <Stack.Screen options={{ title: 'Ask AI' }} />
      <View style={{ flex: 1, backgroundColor: theme.colors.light.white }}>
        <AskSimple />
      </View>
    </>
  );
}
