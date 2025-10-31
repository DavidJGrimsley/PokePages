import React from 'react';
import Head from 'expo-router/head';
import { Container } from 'components/UI/Container';
import { ComingSoon } from 'components/Meta/ComingSoon';

export default function RaidCounter() {
  // SEO meta content
  const title = 'Tera Raid Boss Counter | Best Pokémon for Tera Raids | PokePages';
  const description = 'Counter any Tera Raid boss in Pokémon Scarlet and Violet. Select a raid boss and their Tera type to get optimal strategies, recommended builds, movesets, and counters.';
  const keywords = 'tera raid counter, pokemon raid boss, tera raid builds, best tera raid pokemon, raid strategies, tera type counter, pokemon sv raids, 7 star raids';
  const canonicalUrl = 'https://pokepages.app/guides/gen9/raid-counter';

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Tera Raid Boss Counter",
    "description": description,
    "url": canonicalUrl,
    "applicationCategory": "GameApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Raid boss counter recommendations",
      "Optimal build suggestions",
      "Tera type analysis",
      "Moveset recommendations"
    ]
  };

  return (
    <Container>
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
      <ComingSoon 
        title="Raid Boss Counter"
        subtitle="Select a raid boss and their Tera type to get optimal counter strategies with recommended builds and movesets!"
        icon="⚔️"
        colorScheme="light"
      />
    </Container>
  );
}
