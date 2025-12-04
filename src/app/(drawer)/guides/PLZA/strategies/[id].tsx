import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import Head from 'expo-router/head';
import { Container } from 'components/UI/Container';
import { AppText } from '@/src/components/TextTheme/AppText';
import { BouncyText } from '@/src/components/TextTheme/BouncyText';
import MultiLayerParallaxScrollView from '@/src/components/Parallax/MultiLayerParallaxScrollView';
import { Collapsible } from '@/src/components/UI/Collapsible';
import strategiesConfig from '@/src/constants/PLZAStrategiesConfig.json';
import { Platform, View, Text } from 'react-native';
import { EVYields } from '@/src/components/Guides/EVYields';
import { VideoCarousel } from '@/src/components/Guides/VideoCarousel';
import { ImageGallery } from '@/src/components/Guides/ImageGallery';
import { Strategy, StrategiesConfig } from '@/src/types/strategy';
import FavoriteToggle from '@/src/components/UI/FavoriteToggle';
import { registerFeature } from '@/src/utils/featureRegistry';

// Static generation for all strategy slugs
export async function generateStaticParams(): Promise<{ id: string }[]> {
  return Object.keys(strategiesConfig).map((key) => ({ id: key }));
}

export default function StrategyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
  
  // Ensure id is a string
  let strategySlug = Array.isArray(id) ? id[0] : id;
  
  // Get the strategy configuration with proper typing
  const config = strategySlug ? (strategiesConfig as StrategiesConfig)[strategySlug] : null;
  
  // If no config found, default to first strategy
  const finalConfig: Strategy = config || (strategiesConfig as StrategiesConfig)[Object.keys(strategiesConfig)[0]];
  
  // Register feature for favorites - use actual route path which preserves case
  const actualPath = typeof window !== 'undefined' ? window.location.pathname : `/guides/PLZA/strategies/${strategySlug}`;
  // Extract the path segments to construct feature key - handle case sensitivity
  const pathMatch = actualPath.match(/\/guides\/([^\/]+)\/strategies\/([^\/]+)/);
  const gameFolder = pathMatch?.[1] || 'PLZA';
  const featureKey = `feature:guides.${gameFolder}.strategies.${strategySlug}`;
  
  React.useEffect(() => {
    registerFeature({
      key: featureKey,
      title: finalConfig.title,
      path: `/guides/PLZA/strategies/${strategySlug}`,
      icon: 'book'
    });
  }, [strategySlug, finalConfig.title, featureKey]);
  
  // SEO meta content
  const title = `PP: ${finalConfig.title} - Pokémon Legends Z-A | PokePages`;
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
          titleElement={<BouncyText text={`${finalConfig.icon} ${finalConfig.title}`} />}
          headerHeight={isMobile ? 75 : 150}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text
              role="heading"
              aria-level={1}
              className="text-xl font-bold flex-1 text-app-secondary"
            >
              {finalConfig.subtitle}
            </Text>
            <FavoriteToggle featureKey={featureKey} featureTitle={finalConfig.title} />
          </View>

          <AppText className="text-base mb-0 text-gray-700 dark:text-gray-400">
            {finalConfig.description}
          </AppText>

          {finalConfig.sections.map((section, index) => (
            <Collapsible key={index} title={section.title} animatedOpen={index === 0}>
              <AppText className="text-base mb-md  font-semibold">
                {section.content}
              </AppText>
              
              {section.bullets.map((bullet, bulletIndex) => {
                // Render separator bar for empty bullets
                if (!bullet || bullet.trim() === '') {
                  return (
                    <View key={bulletIndex} className="w-full h-[2px] bg-app-primary dark:bg-app-accent my-3" />
                  );
                }
                
                return (
                  <AppText key={bulletIndex} className="text-base text-gray-600 dark:text-gray-200 mb-sm ">
                    • {bullet}
                  </AppText>
                );
              })}

              {/* Section-level YouTube Videos */}
              {section.youtubeIDs && section.youtubeIDs.length > 0 && (
                <VideoCarousel videoIds={section.youtubeIDs} isMobile={isMobile} />
              )}

              {/* Section-level Images */}
              {section.pics && section.pics.length > 0 && (
                <ImageGallery pics={section.pics} />
              )}
            </Collapsible>
          ))}

          {id === 'competitive-training' && (
            <EVYields game="PLZA" />
          )}

          {/* Strategy-level YouTube Videos (at the bottom of the page) */}
          {finalConfig.youtubeIDs && finalConfig.youtubeIDs.length > 0 && (
            <View className="mt-8">
              <AppText className="text-xl font-bold mb-4 text-app-secondary">
                Related Videos
              </AppText>
              <VideoCarousel videoIds={finalConfig.youtubeIDs} isMobile={isMobile} />
            </View>
          )}

        </MultiLayerParallaxScrollView>
      </Container>
    </>
  );
}
