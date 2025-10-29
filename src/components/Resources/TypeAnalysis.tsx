import React from 'react';
import { View, Text } from 'react-native';
import { 
  getTypeMatchups,
  getWeaknesses,
  getResistances,
  type PokemonType 
} from '~/constants/typeUtils';

interface TypeChipProps {
  type: PokemonType;
  backgroundColor: string;
}

function TypeChip({ type, backgroundColor }: TypeChipProps) {
  return (
    <View style={{
      backgroundColor,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      margin: 2,
    }}>
      <Text style={{
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'capitalize',
      }}>
        {type}
      </Text>
    </View>
  );
}

interface TypeGridProps {
  types: PokemonType[];
  backgroundColor: string;
  emptyMessage?: string;
}

function TypeGrid({ types, backgroundColor, emptyMessage = 'None' }: TypeGridProps) {
  return (
    <View style={{
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
    }}>
      {types.length > 0 ? (
        types.map(type => (
          <TypeChip key={type} type={type} backgroundColor={backgroundColor} />
        ))
      ) : (
        <Text style={{
          fontStyle: 'italic',
          color: '#666',
          fontSize: 12,
        }}>
          {emptyMessage}
        </Text>
      )}
    </View>
  );
}

interface TypeAnalysisProps {
  selectedType: PokemonType;
}

export function TypeAnalysis({ selectedType }: TypeAnalysisProps) {
  const matchups = getTypeMatchups(selectedType);
  const weaknesses = getWeaknesses(selectedType);
  const resistances = getResistances(selectedType);

  return (
    <View style={{ marginTop: 16 }}>
      <Text style={{
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 16,
      }}>
        {selectedType.toUpperCase()} Type Analysis
      </Text>
      
      {/* Offensive Section */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          marginBottom: 8,
        }}>
          🗡️ Offensive (When {selectedType} attacks):
        </Text>
        
        <View style={{ marginBottom: 12 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 6,
          }}>
            Super Effective Against:
          </Text>
          <TypeGrid 
            types={matchups.offensive.superEffectiveAgainst} 
            backgroundColor="#4CAF50" 
          />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 6,
          }}>
            Not Very Effective Against:
          </Text>
          <TypeGrid 
            types={matchups.offensive.notVeryEffectiveAgainst} 
            backgroundColor="#F44336" 
          />
        </View>

        {matchups.offensive.noEffectAgainst.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 6,
            }}>
              No Effect Against:
            </Text>
            <TypeGrid 
              types={matchups.offensive.noEffectAgainst} 
              backgroundColor="#9E9E9E" 
            />
          </View>
        )}
      </View>

      {/* Defensive Section */}
      <View style={{ marginBottom: 16 }}>
        <Text style={{
          fontSize: 16,
          fontWeight: 'bold',
          marginBottom: 8,
        }}>
          🛡️ Defensive (When {selectedType} defends):
        </Text>
        
        <View style={{ marginBottom: 12 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 6,
          }}>
            Weak To:
          </Text>
          <TypeGrid 
            types={weaknesses} 
            backgroundColor="#FF5722" 
          />
        </View>

        <View style={{ marginBottom: 12 }}>
          <Text style={{
            fontSize: 14,
            fontWeight: '600',
            marginBottom: 6,
          }}>
            Resists:
          </Text>
          <TypeGrid 
            types={resistances} 
            backgroundColor="#2196F3" 
          />
        </View>

        {matchups.defensive.immuneTo.length > 0 && (
          <View style={{ marginBottom: 12 }}>
            <Text style={{
              fontSize: 14,
              fontWeight: '600',
              marginBottom: 6,
            }}>
              Immune To:
            </Text>
            <TypeGrid 
              types={matchups.defensive.immuneTo} 
              backgroundColor="#795548" 
            />
          </View>
        )}
      </View>
    </View>
  );
}