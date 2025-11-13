import { TypeHeader } from '@/src/components/Type/TypeHeader';
import { TypeInfo } from '@/src/components/Type/TypeInfo';
import { Container } from '@/src/components/UI/Container';
import React, { useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import Head from 'expo-router/head';
import { type PokemonType } from '~/constants/typeUtils';

export default function TypeInfoPage() {
  const [selectedType, setSelectedType] = useState<PokemonType | null>(null);

  // SEO meta content
  const title = 'Pokémon Type Information | Type Colors & Pokémon Lists | PokePages';
  const description = 'Explore all Pokémon types with color-coded chips. Browse single and dual-type combinations and see which Pokémon have each type. Complete type reference guide.';
  const keywords = 'pokemon types, type colors, dual types, pokemon by type, type information, pokemon type list, type combinations';
  const canonicalUrl = 'https://pokepages.app/resources/type/info';

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Pokémon Type Information Guide",
    "description": description,
    "url": canonicalUrl,
    "mainEntity": {
      "@type": "ItemList",
      "name": "Pokémon Types",
      "description": "Complete list of all Pokémon types with colors and examples",
      "numberOfItems": 18
    },
    "about": {
      "@type": "Thing",
      "name": "Pokémon Types",
      "description": "The 18 different elemental types in Pokémon games"
    }
  };

  const handleTypeSelect = (type1: PokemonType, type2?: PokemonType | null) => {
    setSelectedType(type1);
    // You can also handle type2 if needed for dual type filtering
  };

  const handleClearFilter = () => {
    setSelectedType(null);
  };

  return (
    <Container>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="Poké Pages" />
        <meta property="og:url" content={canonicalUrl} />
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
        <link rel="canonical" href={canonicalUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />
      </Head>
      
      <TypeHeader onTypeSelect={handleTypeSelect} />
      {selectedType && (
        <View className="px-4 pb-2">
          <Pressable
            onPress={handleClearFilter}
            className="bg-gray-200 active:bg-gray-300 rounded-lg py-2 px-4 self-center"
          >
            <Text className="text-gray-700 font-semibold text-sm">
              Clear Filter
            </Text>
          </Pressable>
        </View>
        )}
        
      <TypeInfo selectedType={selectedType} />
      
    </Container>
  );
}
