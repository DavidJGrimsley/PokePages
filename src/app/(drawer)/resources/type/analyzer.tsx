import React, { useState } from 'react';
import { Text, View } from 'react-native';
import Head from 'expo-router/head';
import { Container } from 'components/UI/Container';
import { TypeHeader } from '@/src/components/Type/TypeHeader';
import { TypeAnalysis } from '@/src/components/Type/Analyzer';
import { TypeSelector } from '@/src/components/Type/Selector';
import { type PokemonType, ALL_STANDARD_TYPES } from '~/constants/typeUtils';

export default function TypeAnalyzer() {
  const [typeOne, setTypeOne] = useState<PokemonType>('fire');
  const [typeTwo, setTypeTwo] = useState<PokemonType | null>(null);

  // SEO meta content
  const title = 'Pokémon Type Analyzer | Type Effectiveness Calculator | PokePages';
  const description = 'Calculate and analyze Pokémon type effectiveness and weaknesses. Enter a Pokémon name or select types to see super effective, resistant, and immune matchups.';
  const keywords = 'pokemon type calculator, type effectiveness, pokemon types, type analyzer, pokemon weakness, pokemon resistance, type matchup';
  const canonicalUrl = 'https://pokepages.app/resources/type/analyzer';

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Pokémon Type Analyzer",
    "description": description,
    "url": canonicalUrl,
    "applicationCategory": "GameApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Type effectiveness calculator",
      "Pokemon search by name",
      "Dual type analysis",
      "Super effective matchups",
      "Resistance and immunity checker"
    ]
  };

  const handleTypeOneChange = (type: PokemonType | null) => {
    if (type) {
      setTypeOne(type);
      // If type two is the same as the new type one, reset it
      if (typeTwo === type) {
        setTypeTwo(null);
      }
    }
  };

  const handleTypeTwoChange = (type: PokemonType | null) => {
    // If selecting the same type as type one, reset type two to null
    if (type === typeOne) {
      setTypeTwo(null);
      return;
    }
    setTypeTwo(type);
  };

  // Handle Pokemon search selection
  const handlePokemonSelect = (type1: PokemonType, type2?: PokemonType | null) => {
    setTypeOne(type1);
    setTypeTwo(type2 || null);
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
      <Text
        role="heading"
        aria-level={1}
        className="text-lg font-semibold text-center text-gray-700 dark:text-app-secondary"
      >
        Use this Pokemon Type Calculator to analyze effectiveness{'\n'}
        Enter a Pokemon&apos;s name in the search bar to have its type filled in for you
      </Text>
      <TypeHeader onPokemonSelect={handlePokemonSelect} />
      <View className='flex-row justify-center lg:justify-start lg:ml-8 gap-4'>
        <TypeSelector
          types={ALL_STANDARD_TYPES}
          selectedType={typeOne}
          onTypeSelect={handleTypeOneChange}
          label={
            <>
              Type{'\n'}One
            </>
          }
        />
        <TypeSelector
          types={ALL_STANDARD_TYPES}
          selectedType={typeTwo}
          onTypeSelect={handleTypeTwoChange}
          allowNone={true}
          label={
            <>
              Type{'\n'}Two
            </>
          }
        />
      </View>
      <TypeAnalysis selectedType={typeOne} secondType={typeTwo} />
    </Container>
  );
}

