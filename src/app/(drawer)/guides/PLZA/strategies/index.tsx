import React from 'react';
import { Container } from 'components/UI/Container';
import { BouncyText } from '@/src/components/TextTheme/BouncyText';
import MultiLayerParallaxScrollView from '@/src/components/Parallax/MultiLayerParallaxScrollView';
import { StrategyCard } from '@/src/components/UI/StrategyCard';
import strategiesConfig from '@/src/constants/PLZAStrategiesConfig.json';
import { Platform, View, Text } from 'react-native';
import Head from 'expo-router/head';
import { EVYields } from '@/src/components/Guides/EVYields';

import { InProgressDisclaimer } from '@/src/components/Meta/InProgressDisclaimer';
import { Frame } from 'components/UI/Frame';
import { VideoCarousel } from '@/src/components/Guides/VideoCarousel';

export default function Strategies() {
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

  // SEO meta content
  const title = 'Pokémon Legends Z-A Strategies & Guides | PokePages';
  const description = 'Complete strategy guides for Pokémon Legends Z-A including shiny hunting, real-time battles, competitive ranking, team building, and more.';
  const keywords = 'pokemon legends za strategies, legends za guides, shiny hunting guide, real-time battles, competitive pokemon, team building, pokemon za tips';
  
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
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
      "@id": "https://pokepages.app/guides/PLZA/strategies"
    },
    "keywords": keywords,
    "about": {
      "@type": "VideoGame",
      "name": "Pokémon Legends: Z-A"
    }
  };

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
        <meta property="og:url" content="https://pokepages.app/guides/PLZA/strategies" />
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
        <link rel="canonical" href="https://pokepages.app/guides/PLZA/strategies" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </Head>
      <Container>
        <MultiLayerParallaxScrollView 
          titleElement={<BouncyText text="Strategies" />}
          headerHeight={isMobile ? 75 : 150}
        >
          <Text
            role="heading"
            aria-level={1}
            className="text-xl font-bold mb-lg text-gray-700 dark:text-gray-400"
          >
            Master Pokémon Legends Z-A with these comprehensive guides
          </Text>
          <InProgressDisclaimer />
          
          {Object.values(strategiesConfig).map((strategy) => (
            <StrategyCard
              key={strategy.id}
              id={strategy.id}
              title={strategy.title}
              subtitle={strategy.subtitle}
              icon={strategy.icon}
            />
          ))}

          
         
          <VideoCarousel videoIds={["mE3xS2Myzq4", "XcG0nh5AvYg"]} isMobile={isMobile} />
        </MultiLayerParallaxScrollView>
      </Container>
    </>
  );
}
