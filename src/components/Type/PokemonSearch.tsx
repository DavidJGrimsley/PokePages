import React, { useState, useMemo } from 'react';
import { View, TextInput, Pressable, Text, ScrollView, Platform, Keyboard } from 'react-native';
import { nationalDex, type Pokemon as NationalPokemon } from '@/data/Pokemon/NationalDex';
import { megaDex } from '@/data/Pokemon/MegaDex';
import { hyperspaceDex } from '@/data/Pokemon/LegendsZA/HyperspaceDex';
import type { Pokemon as LegendsPokemon } from '@/data/Pokemon/LegendsZA/LumioseDex';
import { cn } from '@/src/utils/cn';
import { type PokemonType } from '~/constants/typeUtils';

interface PokemonSearchProps {
  onPokemonSelect: (type1: PokemonType, type2?: PokemonType | null) => void;
  placeholder?: string;
}

const isWeb = Platform.OS === 'web';
type SearchPokemon = NationalPokemon | LegendsPokemon;

export function PokemonSearch({ onPokemonSelect, placeholder = "Search Pokémon..." }: PokemonSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // Filter Pokemon based on search query - includes mega evolutions for matching Pokemon
  const filteredPokemon = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
      type SearchPokemon = NationalPokemon | LegendsPokemon;
    const results: SearchPokemon[] = [];
    
    // Search through national dex
    const regularMatches = nationalDex.filter(pokemon => 
      pokemon.name.toLowerCase().includes(query)
    );
    
    // For each matching regular Pokemon, add it and its mega forms (if any)
    regularMatches.forEach(pokemon => {
      results.push(pokemon);
      
      // Find and add mega evolutions for this Pokemon
      const megaForms = megaDex.filter(mega => mega.id === pokemon.id);
      results.push(...megaForms);
    });
    
    // Also search for direct mega searches (e.g., "Mega Gyarados")
    const directMegaMatches = megaDex.filter(mega => 
      mega.name.toLowerCase().includes(query)
    );
    
    // Also search Hyperspace / DLC entries directly and add them
    const directHyperspaceMatches = hyperspaceDex.filter(pokemon => 
      pokemon.name.toLowerCase().includes(query) ||
      pokemon.type1.toLowerCase().includes(query) ||
      pokemon.type2?.toLowerCase().includes(query)
    );
    // Merge Hyperspace entries
    directHyperspaceMatches.forEach(h => {
      if (!results.some(r => r.id === h.id && r.name === h.name)) {
        results.push(h);
      }
    });

    // Add direct mega matches that aren't already in results
    directMegaMatches.forEach(mega => {
      if (!results.some(r => r.id === mega.id && r.name === mega.name)) {
        results.push(mega);
      }
    });
    
    return results.slice(0, 15); // Limit to 15 results for performance
  }, [searchQuery]);

  const handlePokemonSelect = (pokemon: SearchPokemon) => {
    // Set the search input to the selected Pokemon's name
    setSearchQuery(pokemon.name);
    setIsDropdownVisible(false);
    Keyboard.dismiss();
    
    // Pass the types to the parent component
    const type1 = pokemon.type1.toLowerCase() as PokemonType;
    const type2 = pokemon.type2 ? pokemon.type2.toLowerCase() as PokemonType : null;
    onPokemonSelect(type1, type2);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setIsDropdownVisible(text.trim().length > 0);
  };

  const handleFocus = () => {
    if (searchQuery.trim().length > 0) {
      setIsDropdownVisible(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding dropdown to allow click events to register
    setTimeout(() => {
      setIsDropdownVisible(false);
      Keyboard.dismiss();
    }, 300);
  };

  return (
    <View className="relative flex-1 max-w-[400px]" style={{ zIndex: 1000, overflow: 'visible' }}>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        value={searchQuery}
        onChangeText={handleSearchChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType={isWeb ? 'search' : 'done'}
        blurOnSubmit
        onSubmitEditing={() => Keyboard.dismiss()}
        className={cn(
          'bg-app-surface border border-app-border rounded-lg px-4 py-2',
          'text-app-text'
        )}
        style={{ zIndex: 1 }}
      />
      
      {/* Dropdown with filtered results */}
      {isDropdownVisible && filteredPokemon.length > 0 && (
        <View 
          className={cn(
            'absolute top-full left-0 right-0 mt-1',
            'bg-app-surface border border-app-border rounded-lg shadow-lg',
            'max-h-[300px] overflow-hidden'
          )}
          style={{ 
            elevation: 5,
            zIndex: 10000,
            ...(isWeb && {
              position: 'absolute' as const,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              backgroundColor: 'white',
              cursor: 'pointer'
            })
          }}
        >
          <ScrollView 
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled={true}
            style={{ maxHeight: 300 }}
          >
            {filteredPokemon.map((pokemon, index) => {
              const isMega = pokemon.name.toLowerCase().startsWith('mega ');
              return (
              <Pressable
                key={`${pokemon.id}-${pokemon.name}-${index}`}
                onPress={() => handlePokemonSelect(pokemon)}
                className={cn(
                  'px-4 py-3 border-b border-app-border',
                  'hover:bg-app-muted active:bg-app-muted'
                )}
                style={isWeb ? { cursor: 'pointer' } : undefined}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2 flex-1">
                    {isMega && (
                      <View className="bg-purple-500 px-1.5 py-0.5 rounded">
                        <Text className="text-xs text-white font-bold">M</Text>
                      </View>
                    )}
                    <Text className="text-app-text font-medium">
                      {pokemon.name}
                    </Text>
                  </View>
                  <View className="flex-row gap-1">
                    <View className="px-2 py-0.5 bg-app-accent/20 rounded">
                      <Text className="text-xs text-app-text capitalize">
                        {pokemon.type1}
                      </Text>
                    </View>
                    {pokemon.type2 && (
                      <View className="px-2 py-0.5 bg-app-accent/20 rounded">
                        <Text className="text-xs text-app-text capitalize">
                          {pokemon.type2}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            )}
            )}
          </ScrollView>
        </View>
      )}
      
      {/* No results message */}
      {isDropdownVisible && searchQuery.trim().length > 0 && filteredPokemon.length === 0 && (
        <View 
          className={cn(
            'absolute top-full left-0 right-0 mt-1',
            'bg-app-surface border border-app-border rounded-lg shadow-lg',
            'px-4 py-3'
          )}
          style={{ 
            elevation: 5,
            zIndex: 10000,
            ...(isWeb && {
              position: 'absolute' as const,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              backgroundColor: 'white'
            })
          }}
        >
          <Text className="text-app-text text-sm text-center">
            No Pokémon found
          </Text>
        </View>
      )}
    </View>
  );
}
