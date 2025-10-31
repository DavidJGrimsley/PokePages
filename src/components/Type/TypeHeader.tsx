import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { cn } from '@/src/utils/cn';
import { PokemonSearch } from './PokemonSearch';
import { TypeSearch } from './TypeSearch';
import { type PokemonType } from '~/constants/typeUtils';

interface TypeHeaderProps {
  onPokemonSelect?: (type1: PokemonType, type2?: PokemonType | null) => void;
  onTypeSelect?: (type1: PokemonType, type2?: PokemonType | null) => void;
}

export const TypeHeader = ({ onPokemonSelect, onTypeSelect }: TypeHeaderProps) => {
  const pathname = usePathname();
  const router = useRouter();
  
  // Determine which page we're on
  const isInfo = pathname.includes('info');
  const isAnalyzer = pathname.includes('analyzer');
  
  // Default to analyzer if neither is explicitly in the path
  const showAnalyzer = isAnalyzer || (!isInfo && !isAnalyzer);
  const showInfo = isInfo && !isAnalyzer;
  
  const handleToggle = (page: 'info' | 'analyzer') => {
    if (page === 'info' && !showInfo) {
      router.push('/(drawer)/resources/type/info');
    } else if (page === 'analyzer' && !showAnalyzer) {
      router.push('/(drawer)/resources/type/analyzer');
    }
  };

  return (
    <View className="flex-row items-center gap-3 my-3 px-2" style={{ zIndex: 10, overflow: 'visible' }}>
      {/* Toggle Switch */}
      <View className="flex-row bg-app-muted rounded-lg p-1 border border-app-border">
        <Pressable
          onPress={() => handleToggle('analyzer')}
          className={cn(
            'px-4 py-2 rounded-md',
            showAnalyzer ? 'bg-app-accent' : 'bg-transparent'
          )}
        >
          <Text
            className={cn(
              'font-semibold text-sm',
              showAnalyzer ? 'text-white' : 'text-app-text'
            )}
          >
            Analyzer
          </Text>
        </Pressable>
        <Pressable
          onPress={() => handleToggle('info')}
          className={cn(
            'px-4 py-2 rounded-md',
            showInfo ? 'bg-app-accent' : 'bg-transparent'
          )}
        >
          <Text
            className={cn(
              'font-semibold text-sm',
              showInfo ? 'text-white' : 'text-app-text'
            )}
          >
            Info
          </Text>
        </Pressable>
        
      </View>

      {/* Pokemon Search Input */}
      {onPokemonSelect && (
          <PokemonSearch 
            onPokemonSelect={onPokemonSelect}
            placeholder="Search Pokémon..."
          />
      )}

      {/* Type Search Input */}
      {onTypeSelect && (
        <TypeSearch 
          onTypeSelect={onTypeSelect}
          placeholder="Search type..."
        />
      )}
    </View>
  );
};
