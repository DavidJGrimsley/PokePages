import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { 
  getTypeEffectiveness, 
  getDualTypeEffectiveness,
  getTypeMatchups,
  getWeaknesses,
  getResistances,
  type PokemonType,
  ALL_STANDARD_TYPES
} from '~/constants/typeUtils';

// All available types including special ones
const ALL_TYPES: PokemonType[] = [
  ...ALL_STANDARD_TYPES,
  'stellar', 'unknown', 'shadow'
];

interface TypeMatchupDisplayProps {
  selectedType: PokemonType;
}

function TypeMatchupDisplay({ selectedType }: TypeMatchupDisplayProps) {
  const matchups = getTypeMatchups(selectedType);
  const weaknesses = getWeaknesses(selectedType);
  const resistances = getResistances(selectedType);

  return (
    <View style={styles.matchupContainer}>
      <Text style={styles.typeTitle}>{selectedType.toUpperCase()} Type Analysis</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🗡️ Offensive (When {selectedType} attacks):</Text>
        
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Super Effective Against:</Text>
          <View style={styles.typeGrid}>
            {matchups.offensive.superEffectiveAgainst.map(type => (
              <View key={type} style={[styles.typeChip, { backgroundColor: '#4CAF50' }]}>
                <Text style={styles.typeChipText}>{type}</Text>
              </View>
            ))}
            {matchups.offensive.superEffectiveAgainst.length === 0 && (
              <Text style={styles.emptyText}>None</Text>
            )}
          </View>
        </View>

        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Not Very Effective Against:</Text>
          <View style={styles.typeGrid}>
            {matchups.offensive.notVeryEffectiveAgainst.map(type => (
              <View key={type} style={[styles.typeChip, { backgroundColor: '#F44336' }]}>
                <Text style={styles.typeChipText}>{type}</Text>
              </View>
            ))}
            {matchups.offensive.notVeryEffectiveAgainst.length === 0 && (
              <Text style={styles.emptyText}>None</Text>
            )}
          </View>
        </View>

        {matchups.offensive.noEffectAgainst.length > 0 && (
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>No Effect Against:</Text>
            <View style={styles.typeGrid}>
              {matchups.offensive.noEffectAgainst.map(type => (
                <View key={type} style={[styles.typeChip, { backgroundColor: '#9E9E9E' }]}>
                  <Text style={styles.typeChipText}>{type}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛡️ Defensive (When {selectedType} defends):</Text>
        
        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Weak To:</Text>
          <View style={styles.typeGrid}>
            {weaknesses.map(type => (
              <View key={type} style={[styles.typeChip, { backgroundColor: '#FF5722' }]}>
                <Text style={styles.typeChipText}>{type}</Text>
              </View>
            ))}
            {weaknesses.length === 0 && (
              <Text style={styles.emptyText}>None</Text>
            )}
          </View>
        </View>

        <View style={styles.subsection}>
          <Text style={styles.subsectionTitle}>Resists:</Text>
          <View style={styles.typeGrid}>
            {resistances.map(type => (
              <View key={type} style={[styles.typeChip, { backgroundColor: '#2196F3' }]}>
                <Text style={styles.typeChipText}>{type}</Text>
              </View>
            ))}
            {resistances.length === 0 && (
              <Text style={styles.emptyText}>None</Text>
            )}
          </View>
        </View>

        {matchups.defensive.immuneTo.length > 0 && (
          <View style={styles.subsection}>
            <Text style={styles.subsectionTitle}>Immune To:</Text>
            <View style={styles.typeGrid}>
              {matchups.defensive.immuneTo.map(type => (
                <View key={type} style={[styles.typeChip, { backgroundColor: '#795548' }]}>
                  <Text style={styles.typeChipText}>{type}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

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
      <View style={styles.calculatorSection}>
        <Text style={styles.title}>🧮 Type Effectiveness Calculator</Text>
        
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Attacking Type:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
            {typesToShow.map(type => (
              <Pressable
                key={type}
                onPress={() => setAttackingType(type)}
                style={[
                  styles.typeSelectorChip,
                  attackingType === type && styles.selectedType
                ]}
              >
                <Text style={[
                  styles.typeSelectorText,
                  attackingType === type && styles.selectedTypeText
                ]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Defending Type 1:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
            {typesToShow.map(type => (
              <Pressable
                key={type}
                onPress={() => setDefendingType1(type)}
                style={[
                  styles.typeSelectorChip,
                  defendingType1 === type && styles.selectedType
                ]}
              >
                <Text style={[
                  styles.typeSelectorText,
                  defendingType1 === type && styles.selectedTypeText
                ]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Defending Type 2 (Optional):</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
            <Pressable
              onPress={() => setDefendingType2(null)}
              style={[
                styles.typeSelectorChip,
                defendingType2 === null && styles.selectedType
              ]}
            >
              <Text style={[
                styles.typeSelectorText,
                defendingType2 === null && styles.selectedTypeText
              ]}>
                None
              </Text>
            </Pressable>
            {typesToShow.map(type => (
              <Pressable
                key={type}
                onPress={() => setDefendingType2(type)}
                style={[
                  styles.typeSelectorChip,
                  defendingType2 === type && styles.selectedType
                ]}
              >
                <Text style={[
                  styles.typeSelectorText,
                  defendingType2 === type && styles.selectedTypeText
                ]}>
                  {type}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
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

      <View style={styles.analysisSection}>
        <Text style={styles.title}>📊 Type Analysis</Text>
        <Text style={styles.subtitle}>Select a type to analyze:</Text>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
          {typesToShow.map(type => (
            <Pressable
              key={type}
              onPress={() => setSelectedAnalysis(type)}
              style={[
                styles.typeSelectorChip,
                selectedAnalysis === type && styles.selectedType
              ]}
            >
              <Text style={[
                styles.typeSelectorText,
                selectedAnalysis === type && styles.selectedTypeText
              ]}>
                {type}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <TypeMatchupDisplay selectedType={selectedAnalysis} />
      </View>

      {showSpecialTypes && (
        <View style={styles.specialTypesInfo}>
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
    backgroundColor: '#f5f5f5',
  },
  calculatorSection: {
    backgroundColor: 'white',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  analysisSection: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
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
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputSection: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  typeSelector: {
    maxHeight: 50,
  },
  typeSelectorChip: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  selectedType: {
    backgroundColor: '#2196F3',
  },
  typeSelectorText: {
    fontSize: 12,
    color: '#333',
    textTransform: 'capitalize',
  },
  selectedTypeText: {
    color: 'white',
    fontWeight: 'bold',
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
  matchupContainer: {
    marginTop: 16,
  },
  typeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subsection: {
    marginBottom: 12,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  typeChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    margin: 2,
  },
  typeChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#666',
    fontSize: 12,
  },
  specialTypesInfo: {
    backgroundColor: 'white',
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default TypeEffectivenessCalculator;