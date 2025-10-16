import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { Container } from 'components/UI/Container';
import { AppText } from '@/src/components/TextTheme/AppText';
import { BouncyText } from '@/src/components/TextTheme/BouncyText';
import MultiLayerParallaxScrollView from '@/src/components/Parallax/MultiLayerParallaxScrollView';
import { Collapsible } from '@/src/components/UI/Collapsible';
import colors from '@/src/constants/style/colors';
import strategiesConfig from '@/src/constants/PLZAStrategiesConfig.json';
import { Platform } from 'react-native';

// Static generation for all strategy slugs
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return Object.keys(strategiesConfig).map((key) => ({ id: key }));
}

export default function StrategyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  
  // Ensure id is a string
  let strategySlug = Array.isArray(id) ? id[0] : id;
  
  // Get the strategy configuration
  const config = strategySlug ? strategiesConfig[strategySlug as keyof typeof strategiesConfig] : null;
  
  // If no config found, default to first strategy
  const finalConfig = config || strategiesConfig[Object.keys(strategiesConfig)[0] as keyof typeof strategiesConfig];
  
  // SEO meta content
  const title = `${finalConfig.title} - Pokémon Legends Z-A | PokePages`;
  const description = finalConfig.description;
  const keywords = `pokemon legends za, ${finalConfig.title.toLowerCase()}, legends za guide, pokemon strategy, ${strategySlug}, kalos guide`;
  
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
      "@id": `https://pokepages.app/guides/PLZA/strategies/${strategySlug}`
    },
    "keywords": keywords,
    "about": {
      "@type": "VideoGame",
      "name": "Pokémon Legends: Z-A"
    },
    "articleSection": "Strategy Guide",
    "genre": "Gaming Guide"
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
        <meta property="og:url" content={`https://pokepages.app/guides/PLZA/strategies/${strategySlug}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="robots" content="index, follow" />
        <meta property="article:section" content="Strategy Guide" />
        <meta property="article:tag" content="Pokémon Legends Z-A" />
        <meta property="article:tag" content="Strategy Guide" />
        <link rel="canonical" href={`https://pokepages.app/guides/PLZA/strategies/${strategySlug}`} />
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
          titleElement={<BouncyText text={`${finalConfig.icon} ${finalConfig.title}`} />}
          headerHeight={isMobile ? 75 : 150}
        >
          <AppText className="text-xl font-bold mb-md text-app-secondary">
            {finalConfig.subtitle}
          </AppText>

          <AppText className="text-base mb-lg text-app-text">
            {finalConfig.description}
          </AppText>

          {finalConfig.sections.map((section, index) => (
            <Collapsible key={index} title={section.title} animatedOpen={index === 0}>
              <AppText className="text-base mb-md text-gray-700 dark:text-gray-200 font-semibold">
                {section.content}
              </AppText>
              
              {section.bullets.map((bullet, bulletIndex) => (
                <AppText key={bulletIndex} className="text-base mb-sm text-gray-600 dark:text-gray-300">
                  • {bullet}
                </AppText>
              ))}
            </Collapsible>
          ))}
        </MultiLayerParallaxScrollView>
      </Container>
    </>
  );
}
