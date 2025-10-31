import React from 'react';
import Head from 'expo-router/head';
import { Container } from 'components/UI/Container';
import { ComingSoon } from 'components/Meta/ComingSoon';

export default function Map() {
  // SEO meta content
  const title = 'Pokémon Scarlet & Violet Map | Paldea Region Interactive Map | PokePages';
  const description = 'Interactive map for Pokémon Scarlet and Violet showing key locations, items, gym locations, and points of interest throughout the Paldea region.';
  const keywords = 'pokemon scarlet violet map, paldea map, pokemon sv map, interactive pokemon map, gym locations, item locations, pokemon gen 9 map';
  const canonicalUrl = 'https://pokepages.app/guides/gen9/map';

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Pokémon Scarlet & Violet Interactive Map",
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
        title="Map"
        subtitle="See where key things are in the game world!"
        icon="🗺️"
        colorScheme="light"
      />
    </Container>
  );
}
