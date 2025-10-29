import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Container } from 'components/UI/Container';
import { TypeHeader } from '@/src/components/Type/TypeHeader';
import { TypeAnalysis } from '@/src/components/Type/Analyzer';
import { TypeSelector } from '@/src/components/Type/Selector';
import { type PokemonType, ALL_STANDARD_TYPES } from '~/constants/typeUtils';

export default function TypeAnalyzer() {
  const [typeOne, setTypeOne] = useState<PokemonType>('fire');
  const [typeTwo, setTypeTwo] = useState<PokemonType | null>(null);

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
    // Prevent selecting the same type as type one
    if (type === typeOne) {
      return; // Don't allow same type selection
    }
    setTypeTwo(type);
  };

  return (
    <Container>
      <TypeHeader />
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

