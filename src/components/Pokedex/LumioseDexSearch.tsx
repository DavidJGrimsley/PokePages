import React, { useMemo, useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Text,
  ScrollView,
  Platform,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lumioseDex, type Pokemon } from '@/data/Pokemon/LegendsZA/LumioseDex';
import { cn } from '@/src/utils/cn';

const isWeb = Platform.OS === 'web';

type Props = {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  onPokemonSelect?: (pokemon: Pokemon) => void;
};

export default function LumioseDexSearch({
  value,
  onChange,
  placeholder = 'Search by name or #dex',
  autoFocus = false,
  onPokemonSelect,
}: Props) {
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const filteredPokemon = useMemo(() => {
    const query = value.trim().toLowerCase();
    if (!query) {
      return [];
    }

    return lumioseDex
      .filter((pokemon) => {
        const nameMatch = pokemon.name.toLowerCase().includes(query);
        const idString = String(pokemon.id);
        const paddedId = idString.padStart(4, '0');
        const idMatch = idString.includes(query) || paddedId.includes(query);
        return nameMatch || idMatch;
      })
      .slice(0, 12);
  }, [value]);

  const handleTextChange = (text: string) => {
    onChange(text);
    setIsDropdownVisible(text.trim().length > 0);
  };

  const handleFocus = () => {
    if (value.trim().length > 0) {
      setIsDropdownVisible(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsDropdownVisible(false);
      Keyboard.dismiss();
    }, 200);
  };

  const handleClear = () => {
    onChange('');
    setIsDropdownVisible(false);
    Keyboard.dismiss();
  };

  const handlePokemonSelect = (pokemon: Pokemon) => {
    onChange(pokemon.name);
    setIsDropdownVisible(false);
    Keyboard.dismiss();
    onPokemonSelect?.(pokemon);
  };

  return (
    <View className="relative" style={{ zIndex: 1000, overflow: 'visible' }}>
      <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-3 border border-gray-300">
        <Ionicons name="search" size={18} color="#6b7280" style={{ marginRight: 8 }} />
        <TextInput
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          autoFocus={autoFocus}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType={isWeb ? 'search' : 'done'}
          blurOnSubmit
          onSubmitEditing={() => Keyboard.dismiss()}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="flex-1 text-base text-app-text"
          style={{ zIndex: 1 }}
        />
        {value?.length > 0 && (
          <Pressable
            accessibilityRole="button"
            onPress={handleClear}
            style={isWeb ? { cursor: 'pointer' } : undefined}
          >
            <Ionicons name="close-circle" size={18} color="#9ca3af" />
          </Pressable>
        )}
      </View>

      {isDropdownVisible && filteredPokemon.length > 0 && (
        <View
          className={cn(
            'absolute left-0 right-0 top-full mt-1',
            'bg-app-surface border border-app-border rounded-lg shadow-lg',
            'max-h-[300px] overflow-hidden'
          )}
          style={{
            elevation: 5,
            zIndex: 10000,
            ...(isWeb && {
              position: 'absolute' as const,
              boxShadow:
                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              backgroundColor: 'white',
              cursor: 'pointer',
            }),
          }}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            style={{ maxHeight: 300 }}
          >
            {filteredPokemon.map((pokemon) => (
              <Pressable
                key={pokemon.id}
                onPress={() => handlePokemonSelect(pokemon)}
                className={cn(
                  'px-4 py-3 border-b border-app-border',
                  'hover:bg-app-muted active:bg-app-muted'
                )}
                style={isWeb ? { cursor: 'pointer' } : undefined}
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <Text className="text-xs font-semibold text-gray-500">#{pokemon.id.toString().padStart(4, '0')}</Text>
                    <Text className="text-app-text font-medium">{pokemon.name}</Text>
                  </View>
                  <View className="flex-row gap-1">
                    <View className="px-2 py-0.5 bg-app-accent/20 rounded">
                      <Text className="text-xs text-app-text capitalize">{pokemon.type1}</Text>
                    </View>
                    {pokemon.type2 && (
                      <View className="px-2 py-0.5 bg-app-accent/20 rounded">
                        <Text className="text-xs text-app-text capitalize">{pokemon.type2}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}

      {isDropdownVisible && value.trim().length > 0 && filteredPokemon.length === 0 && (
        <View
          className={cn(
            'absolute left-0 right-0 top-full mt-1',
            'bg-app-surface border border-app-border rounded-lg shadow-lg',
            'px-4 py-3'
          )}
          style={{
            elevation: 5,
            zIndex: 10000,
            ...(isWeb && {
              position: 'absolute' as const,
              boxShadow:
                '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              backgroundColor: 'white',
            }),
          }}
        >
          <Text className="text-app-text text-sm text-center">No Pokémon found</Text>
        </View>
      )}
    </View>
  );
}
