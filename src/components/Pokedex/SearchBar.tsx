import React from 'react';
import { View, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type Props = {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
};

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search by name or #dex',
  autoFocus = false,
}: Props) {
  return (
    <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-4 border border-gray-300">
      <Ionicons name="search" size={18} color="#6b7280" style={{ marginRight: 8 }} />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        autoFocus={autoFocus}
        autoCorrect={false}
        autoCapitalize="none"
        className="flex-1 text-base text-app-text"
      />
      {value?.length > 0 && (
        <Pressable accessibilityRole="button" onPress={() => onChange('')}>
          <Ionicons name="close-circle" size={18} color="#9ca3af" />
        </Pressable>
      )}
    </View>
  );
}
