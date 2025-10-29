import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { 
  getTypeEffectiveness, 
  getDualTypeEffectiveness,
  type PokemonType,
  ALL_STANDARD_TYPES
} from '~/constants/typeUtils';
import Colors from '~/constants/style/colors';
import { TypeAnalysis } from './TypeAnalysis';
import { TypeSelector } from '@/src/components/Type/Selector';

// All available types including special ones
const ALL_TYPES: PokemonType[] = [
  ...ALL_STANDARD_TYPES,
  'stellar', 'unknown', 'shadow'
];

interface TypeEffectivenessCalculatorProps {
  showSpecialTypes?: boolean;
}

export function TypeEffectivenessCalculator({ showSpecialTypes = false }: TypeEffectivenessCalculatorProps) {
  const [attackingType, setAttackingType] = useState<PokemonType>('fire');
  const [defendingType1, setDefendingType1] = useState<PokemonType>('grass');
  const [defendingType2, setDefendingType2] = useState<PokemonType | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<PokemonType>('fire');

  const typesToShow = showSpecialTypes ? ALL_TYPES : ALL_STANDARD_TYPES;
  
  const effectiveness = defendingType2 
    ? getDualTypeEffectiveness(attackingType, defendingType1, defendingType2)
    : getTypeEffectiveness(attackingType, defendingType1);

  const getEffectivenessColor = () => {
    switch (effectiveness.description) {
      case 'super effective': return '#4CAF50';
      case 'not very effective': return '#F44336';
      case 'no effect': return '#9E9E9E';
      default: return '#FF9800';
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Type Effectiveness Calculator */}
      <View style={styles.section}>
        <Text style={styles.title}>🧮 Type Effectiveness Calculator</Text>
        
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Attacking Type:</Text>
          <TypeSelector 
            types={typesToShow}
            selectedType={attackingType}
            onTypeSelect={(t) => setAttackingType(t as PokemonType)}
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Defending Type 1:</Text>
          <TypeSelector 
            types={typesToShow}
            selectedType={defendingType1}
            onTypeSelect={(t) => setDefendingType1(t as PokemonType)}
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Defending Type 2 (Optional):</Text>
          <TypeSelector 
            types={[...typesToShow]}
            selectedType={defendingType2}
            allowNone={true}
            onTypeSelect={(type) => setDefendingType2(type)}
          />
        </View>

        <View style={[styles.result, { backgroundColor: getEffectivenessColor() }]}>
          <Text style={styles.resultText}>
            {attackingType.toUpperCase()} vs {defendingType1.toUpperCase()}
            {defendingType2 ? `/${defendingType2.toUpperCase()}` : ''}
          </Text>
          <Text style={styles.resultMultiplier}>
            {effectiveness.multiplier}x - {effectiveness.description.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Type Analysis */}
      <View style={styles.section}>
        <Text style={styles.title}>📊 Type Analysis</Text>
        <Text style={styles.subtitle}>Select a type to analyze:</Text>
        
        <TypeSelector 
          types={typesToShow}
          selectedType={selectedAnalysis}
          onTypeSelect={(t) => setSelectedAnalysis(t as PokemonType)}
        />

        <TypeAnalysis selectedType={selectedAnalysis} />
      </View>

      {/* Special Types Info */}
      {showSpecialTypes && (
        <View style={styles.section}>
          <Text style={styles.title}>⭐ Special Types Info</Text>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>Stellar:</Text> New type from Pokémon Scarlet/Violet DLC
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>Unknown:</Text> Type used for special moves like Curse
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>Shadow:</Text> Type from Pokémon GO and other games
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  section: {
    backgroundColor: Colors.light.white,
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.light.text,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.light.text,
  },
  result: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  resultText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultMultiplier: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
    color: Colors.light.text,
  },
  bold: {
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
});

export default TypeEffectivenessCalculator;