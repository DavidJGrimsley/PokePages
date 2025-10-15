import React from 'react';
import { Container } from 'components/UI/Container';
import { AppText } from '@/src/components/TextTheme/AppText';
import { BouncyText } from '@/src/components/TextTheme/BouncyText';
import MultiLayerParallaxScrollView from '@/src/components/Parallax/MultiLayerParallaxScrollView';
import { StrategyCard } from '@/src/components/UI/StrategyCard';
import colors from '@/src/constants/style/colors';
import strategiesConfig from '@/src/constants/PLZAStrategiesConfig.json';
import { Platform } from 'react-native';
import Head from 'expo-router/head';

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
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://pokepages.app/guides/PLZA/strategies" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
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
          headerBackgroundColor={{ dark: colors.light.secondary, light: colors.light.background }}
          titleElement={<BouncyText text="Strategies" />}
          headerHeight={isMobile ? 75 : 150}
        >
          <AppText className="text-xl font-bold mb-lg text-gray-200 dark:text-gray-800">
            Master Pokémon Legends Z-A with these comprehensive guides
          </AppText>
          
          {Object.values(strategiesConfig).map((strategy) => (
            <StrategyCard
              key={strategy.id}
              id={strategy.id}
              title={strategy.title}
              subtitle={strategy.subtitle}
              icon={strategy.icon}
            />
          ))}
        </MultiLayerParallaxScrollView>
      </Container>
    </>
  );
}
