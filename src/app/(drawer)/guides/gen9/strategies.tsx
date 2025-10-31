import React from 'react';
import Head from 'expo-router/head';
import { Container } from 'components/UI/Container';
import { ComingSoon } from 'components/Meta/ComingSoon';

export default function Strategies() {
  // SEO meta content
  const title = 'Pokémon Scarlet & Violet Strategies | Shiny Hunting & Competitive Guide | PokePages';
  const description = 'Master Pokémon Scarlet and Violet with comprehensive strategy guides including shiny hunting techniques, competitive battling, breeding, team building, and more.';
  const keywords = 'pokemon scarlet violet strategies, shiny hunting guide, competitive pokemon, breeding guide, team building, pokemon sv tips, paldea strategies, masuda method';
  const canonicalUrl = 'https://pokepages.app/guides/gen9/strategies';

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Pokémon Scarlet & Violet Strategy Guides",
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
        title="Strategies"
        subtitle="Shiny hunting, competitive play, and more!"
        icon="📚"
        colorScheme="light"
      />
    </Container>
  );
}
