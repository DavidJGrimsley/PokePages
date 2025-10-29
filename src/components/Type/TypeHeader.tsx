import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { cn } from '@/src/utils/cn';

export const TypeHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  
  // Determine which page we're on
  const isCalculator = pathname.includes('calculator');
  const isAnalyzer = pathname.includes('analyzer');
  
  const handleToggle = (page: 'calculator' | 'analyzer') => {
    if (page === 'calculator' && !isCalculator) {
      router.push('/(drawer)/resources/type/calculator');
    } else if (page === 'analyzer' && !isAnalyzer) {
      router.push('/(drawer)/resources/type/analyzer');
    }
  };

  return (
    <View className="flex-row items-center gap-3 my-3 px-2">
      {/* Toggle Switch */}
      <View className="flex-row bg-app-muted rounded-lg p-1 border border-app-border">
        <Pressable
          onPress={() => handleToggle('calculator')}
          className={cn(
            'px-4 py-2 rounded-md',
            isCalculator ? 'bg-app-accent' : 'bg-transparent'
          )}
        >
          <Text
            className={cn(
              'font-semibold text-sm',
              isCalculator ? 'text-white' : 'text-app-text'
            )}
          >
            Calculator
          </Text>
        </Pressable>
        
        <Pressable
          onPress={() => handleToggle('analyzer')}
          className={cn(
            'px-4 py-2 rounded-md',
            isAnalyzer ? 'bg-app-accent' : 'bg-transparent'
          )}
        >
          <Text
            className={cn(
              'font-semibold text-sm',
              isAnalyzer ? 'text-white' : 'text-app-text'
            )}
          >
            Analyzer
          </Text>
        </Pressable>
      </View>

      {/* Search Input */}
      <View className="flex-1">
        <TextInput
          placeholder="Search Pokémon..."
          placeholderTextColor="#9CA3AF"
          editable={false} // Disabled for now until functionality is implemented
          className={cn(
            'bg-app-surface border border-app-border rounded-lg px-4 py-2',
            'text-app-text',
            'opacity-50' // Visual indicator that it's disabled
          )}
        />
      </View>
    </View>
  );
};
