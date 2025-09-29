import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { 
  getTypeEffectiveness, 
  getDualTypeEffectiveness,
  getSuperEffectiveAgainst,
  getWeaknesses,
  getResistances,
  type PokemonType 
} from '~/constants/typeUtils';

interface TypeEffectivenessDisplayProps {
  attackingType: PokemonType;
  defendingType1: PokemonType;
  defendingType2?: PokemonType;
}

export function TypeEffectivenessDisplay({ 
  attackingType, 
  defendingType1, 
  defendingType2 
}: TypeEffectivenessDisplayProps) {
  const effectiveness = defendingType2 
    ? getDualTypeEffectiveness(attackingType, defendingType1, defendingType2)
    : getTypeEffectiveness(attackingType, defendingType1);

  const getEffectivenessColor = () => {
    switch (effectiveness.description) {
      case 'super effective': return '#4CAF50'; // Green
      case 'not very effective': return '#F44336'; // Red
      case 'no effect': return '#9E9E9E'; // Gray
      default: return '#FF9800'; // Orange for normal
    }
  };

  const getEffectivenessText = () => {
    return `${effectiveness.multiplier}x - ${effectiveness.description}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.typeContainer}>
        <Text style={styles.typeText}>
          {attackingType.toUpperCase()} vs {defendingType1.toUpperCase()}
          {defendingType2 ? `/${defendingType2.toUpperCase()}` : ''}
        </Text>
      </View>
      
      <View style={[styles.effectivenessContainer, { backgroundColor: getEffectivenessColor() }]}>
        <Text style={styles.effectivenessText}>
          {getEffectivenessText()}
        </Text>
      </View>
    </View>
  );
}

interface PokemonTypeAnalysisProps {
  pokemonType1: PokemonType;
  pokemonType2?: PokemonType;
}

export function PokemonTypeAnalysis({ pokemonType1, pokemonType2 }: PokemonTypeAnalysisProps) {
  const weaknesses = getWeaknesses(pokemonType1, pokemonType2);
  const resistances = getResistances(pokemonType1, pokemonType2);
  const superEffectiveAgainst = getSuperEffectiveAgainst(pokemonType1);

  return (
    <View style={styles.analysisContainer}>
      <Text style={styles.title}>
        {pokemonType1.toUpperCase()}{pokemonType2 ? `/${pokemonType2.toUpperCase()}` : ''} Type Analysis
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weak To ({weaknesses.length}):</Text>
        <Text style={styles.typeList}>
          {weaknesses.length > 0 ? weaknesses.join(', ') : 'None'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resists ({resistances.length}):</Text>
        <Text style={styles.typeList}>
          {resistances.length > 0 ? resistances.join(', ') : 'None'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Super Effective Against ({superEffectiveAgainst.length}):</Text>
        <Text style={styles.typeList}>
          {superEffectiveAgainst.length > 0 ? superEffectiveAgainst.join(', ') : 'None'}
        </Text>
      </View>
    </View>
  );
}

// Example usage component
export function TypeEffectivenessExample() {
  return (
    <View style={styles.exampleContainer}>
      <Text style={styles.exampleTitle}>Type Effectiveness Examples</Text>
      
      <TypeEffectivenessDisplay 
        attackingType="fire" 
        defendingType1="grass" 
      />
      
      <TypeEffectivenessDisplay 
        attackingType="water" 
        defendingType1="fire" 
        defendingType2="rock" 
      />
      
      <TypeEffectivenessDisplay 
        attackingType="electric" 
        defendingType1="ground" 
      />

      <PokemonTypeAnalysis 
        pokemonType1="fire" 
        pokemonType2="flying" 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  typeContainer: {
    flex: 1,
  },
  typeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  effectivenessContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  effectivenessText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  analysisContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  section: {
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  typeList: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  exampleContainer: {
    padding: 16,
  },
  exampleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
});

export default TypeEffectivenessExample;