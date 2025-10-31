import React, { useState, useMemo } from 'react';
import { View, TextInput, Pressable, Text, ScrollView, Platform, Keyboard } from 'react-native';
import { cn } from '@/src/utils/cn';
import { type PokemonType, ALL_STANDARD_TYPES } from '~/constants/typeUtils';
import { getTypeColor } from '~/utils/typeColors';

interface TypeSearchProps {
  onTypeSelect: (type1: PokemonType, type2?: PokemonType | null) => void;
  placeholder?: string;
}

const isWeb = Platform.OS === 'web';

export function TypeSearch({ onTypeSelect, placeholder = "Search type..." }: TypeSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  // Filter types based on search query
  const filteredTypes = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const query = searchQuery.toLowerCase();
    return ALL_STANDARD_TYPES
      .filter(type => type.toLowerCase().includes(query))
      .slice(0, 10); // Limit to 10 results for performance
  }, [searchQuery]);

  const handleTypeSelect = (type: PokemonType) => {
    // Set the search input to the selected type
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);
    setSearchQuery(typeName);
    setIsDropdownVisible(false);
    Keyboard.dismiss();
    
    // Pass the type to the parent component
    onTypeSelect(type);
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
    <View className="relative flex-1 max-w-[300px]" style={{ zIndex: 10, overflow: 'visible' }}>
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
      {isDropdownVisible && filteredTypes.length > 0 && (
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
            {filteredTypes.map((type) => {
              const typeColor = getTypeColor(type);
              const typeName = type.charAt(0).toUpperCase() + type.slice(1);
              
              return (
                <Pressable
                  key={type}
                  onPress={() => handleTypeSelect(type)}
                  className={cn(
                    'px-4 py-3 border-b border-app-border',
                    'hover:bg-gray-50 active:bg-gray-100'
                  )}
                >
                  <View className="flex-row items-center gap-3">
                    {/* Type color indicator */}
                    <View
                      style={{
                        backgroundColor: typeColor,
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                      }}
                    />
                    <Text className="text-app-text font-medium">
                      {typeName}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
