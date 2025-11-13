import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Head from 'expo-router/head';
import { FiltersProvider } from '../../../../context/Map/FiltersContext';
import { MarkersProvider } from '../../../../context/Map/MarkersContext';
import { FilterBar } from '../../../../components/Map/FilterBar';
import { ZoomableMap } from '../../../../components/Map/ZoomableMap';
import { InProgressDisclaimer } from '@/src/components/Meta/InProgressDisclaimer';


export default function Map() {
  // SEO meta content
  const title = 'Pokémon Legends Z-A Interactive Map | Lumiose City Map | PokePages';
  const description = 'Interactive map for Pokémon Legends Z-A. Explore Lumiose City with markers for items, Pokémon locations, trainers, and important landmarks in the Kalos region.';
  const keywords = 'pokemon legends za map, lumiose city map, interactive pokemon map, kalos map, legends za locations, pokemon za items, lumiose city guide';
  const canonicalUrl = 'https://pokepages.app/guides/PLZA/map';

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Pokémon Legends Z-A Interactive Map",
    "description": description,
    "url": canonicalUrl,
    "about": {
      "@type": "VideoGame",
      "name": "Pokémon Legends: Z-A"
    }
  };

  return (
    <FiltersProvider>
      <MarkersProvider>
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
        <View style={styles.container}>
          <View style={styles.header}>
            <Text
              role="heading"
              aria-level={1}
              style={styles.headerTitle}
            >
              Explore Lumiose City
            </Text>
            <Text style={styles.headerSubtitle}>
              Navigate the Kalos region with our interactive map featuring Pokémon locations, items, trainers, and important landmarks. Perfect for planning your Legends Z-A adventure!
            </Text>
          </View>
          <InProgressDisclaimer />
          <Text> This is not yet fully implemented.</Text>
          <FilterBar />
          <ZoomableMap />
        </View>
      </MarkersProvider>
    </FiltersProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
