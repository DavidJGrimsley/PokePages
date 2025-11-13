import React from 'react';
import { View, Linking, Pressable } from 'react-native';
import { ThemedText } from '../TextTheme/ThemedText';

export function Footer() {
  const handleDeveloperPress = () => {
    Linking.openURL('https://davidjgrimsley.com'); // Replace with your actual website URL
  };

  return (
    <View className="p-4 mt-8 border-t border-gray-300 dark:border-gray-700">
      {/* Developer Link */}
      <View className="mb-4 flex-row justify-center">
        <Pressable onPress={handleDeveloperPress}>
          <ThemedText className="text-blue-600 dark:text-blue-400 underline">
            Developer
          </ThemedText>
        </Pressable>
      </View>

      {/* Copyright Information */}
      <View className="space-y-2">
        <ThemedText className="text-xs text-gray-600 dark:text-gray-400 text-center">
          All content & design © PokePages.app, 2025.
        </ThemedText>
        <ThemedText className="text-xs text-gray-600 dark:text-gray-400 text-center">
          Pokémon and all respective names are trademark & © of Nintendo/Game Freak.
        </ThemedText>
      </View>
    </View>
  );
}
