import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import typeAnalysis from '~/constants/typeAnalysis.json';
import { getTypeColor } from '~/utils/typeColors';

type TypeInfo = {
  id: string;
  title: string;
  description: string;
};

export default function ColorChips() {
  // Get all single types (not dual types)
  const singleTypes = Object.entries(typeAnalysis as Record<string, TypeInfo>).filter(
    ([key]) => !key.includes('-')
  );

  console.log('First type:', singleTypes[0]);
  console.log('Color for normal:', getTypeColor('normal'));

  return (
    <ScrollView className="flex-1 bg-app-background p-4">
      <Text className="text-2xl font-bold text-app-text mb-6 text-center">
        Pokémon Type Color Chips
      </Text>
      
      <View className="gap-3">
        {singleTypes.map(([key, type]) => {
          const color = getTypeColor(key);
          return (
            <View
              key={key}
              className="flex-row items-center p-4 bg-white rounded-lg shadow-sm"
            >
              {/* Color Chip */}
              <View
                style={{ 
                  backgroundColor: color,
                  width: 64,
                  height: 64,
                  borderRadius: 8,
                  marginRight: 16,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              />
              
              {/* Type Info */}
              <View className="flex-1">
                <Text className="text-lg font-bold text-app-text mb-1">
                  {type.title}
                </Text>
                <Text className="text-sm text-gray-600 mb-1">
                  {type.description}
                </Text>
                <Text className="text-xs font-mono text-gray-500">
                  {color}
                </Text>
                <Text className="text-xs font-mono text-gray-500">
                  type-{key}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      
      {/* Color Grid View */}
      <Text className="text-xl font-bold text-app-text mt-8 mb-4 text-center">
        Color Grid
      </Text>
      
      <View className="flex-row flex-wrap gap-2 justify-center mb-8">
        {singleTypes.map(([key, type]) => {
          const color = getTypeColor(key);
          return (
            <View key={`grid-${key}`} className="items-center">
              <View
                style={{ 
                  backgroundColor: color,
                  width: 80,
                  height: 80,
                  borderRadius: 8,
                  marginBottom: 8,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                }}
              />
              <Text className="text-xs font-bold text-app-text text-center">
                {type.title}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}
