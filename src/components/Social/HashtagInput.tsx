import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface HashtagInputProps {
  selectedHashtags: string[];
  onHashtagsChange: (hashtags: string[]) => void;
  maxHashtags?: number;
  suggestedHashtags?: string[];
}

const DEFAULT_SUGGESTIONS = [
  'PokemonGO',
  'ShinyHunting',
  'RaidBattle',
  'GymBattle',
  'TeamRocket',
  'CommunityDay',
  'LegendaryPokemon',
  'PokedexComplete',
  'NestHunting',
  'PvPBattle',
  'MegaEvolution',
  'EXRaid',
  'WalkingBuddy',
  'LuckyPokemon',
  'RegionalPokemon',
];

export function HashtagInput({
  selectedHashtags,
  onHashtagsChange,
  maxHashtags = 5,
  suggestedHashtags = DEFAULT_SUGGESTIONS,
}: HashtagInputProps) {
  const [customInput, setCustomInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);

  const handleAddCustom = () => {
    if (!customInput.trim()) return;

    // Clean the input (remove # if user added it, convert to lowercase for storage, remove spaces)
    let cleaned = customInput.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '');
    
    // Validate: only alphanumeric
    if (!/^[a-z0-9]+$/i.test(cleaned)) {
      return; // Invalid hashtag
    }

    if (selectedHashtags.length >= maxHashtags) return;
    if (selectedHashtags.includes(cleaned)) return; // Already added

    onHashtagsChange([...selectedHashtags, cleaned]);
    setCustomInput('');
  };

  const handleToggleHashtag = (hashtag: string) => {
    const normalized = hashtag.toLowerCase();
    if (selectedHashtags.includes(normalized)) {
      onHashtagsChange(selectedHashtags.filter((h) => h !== normalized));
    } else {
      if (selectedHashtags.length < maxHashtags) {
        onHashtagsChange([...selectedHashtags, normalized]);
      }
    }
  };

  const handleRemoveHashtag = (hashtag: string) => {
    onHashtagsChange(selectedHashtags.filter((h) => h !== hashtag));
  };

  const handleKeyPress = (e: any) => {
    if (Platform.OS === 'web' && e.nativeEvent.key === 'Enter') {
      e.preventDefault();
      handleAddCustom();
    }
  };

  const remainingSlots = maxHashtags - selectedHashtags.length;

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Ionicons name="pricetag" size={20} color="#F59E0B" />
          <Text className="typography-label text-gray-900 dark:text-white font-semibold ml-2">
            Hashtags
          </Text>
        </View>
        <Text className="typography-caption text-gray-500">
          {selectedHashtags.length} / {maxHashtags}
        </Text>
      </View>

      {/* Selected Hashtags */}
      {selectedHashtags.length > 0 && (
        <View className="flex-row flex-wrap mb-3 gap-2">
          {selectedHashtags.map((tag) => (
            <View
              key={tag}
              className="flex-row items-center bg-amber-100 dark:bg-amber-900 rounded-full px-3 py-1.5"
            >
              <Text className="typography-caption text-amber-800 dark:text-amber-200 font-medium">
                #{tag}
              </Text>
              <TouchableOpacity onPress={() => handleRemoveHashtag(tag)} className="ml-2">
                <Ionicons name="close-circle" size={16} color="#92400E" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Custom Input */}
      {selectedHashtags.length < maxHashtags && (
        <View className="mb-3">
          <View className="flex-row items-center bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
            <Text className="typography-copy text-gray-500 mr-1">#</Text>
            <TextInput
              value={customInput}
              onChangeText={setCustomInput}
              onKeyPress={handleKeyPress}
              placeholder={`Add custom hashtag (${remainingSlots} left)`}
              placeholderTextColor="#9CA3AF"
              className="flex-1 typography-copy text-gray-900 dark:text-white"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              onPress={handleAddCustom}
              disabled={!customInput.trim()}
              className={`ml-2 ${customInput.trim() ? 'opacity-100' : 'opacity-40'}`}
            >
              <Ionicons name="add-circle" size={24} color="#F59E0B" />
            </TouchableOpacity>
          </View>
          <Text className="typography-caption text-gray-500 mt-1 ml-1">
            Press Enter or tap + to add
          </Text>
        </View>
      )}

      {/* Suggested Hashtags */}
      <View>
        <TouchableOpacity
          onPress={() => setShowSuggestions(!showSuggestions)}
          className="flex-row items-center justify-between mb-2"
        >
          <Text className="typography-caption text-gray-600 dark:text-gray-400 font-medium">
            Popular Tags
          </Text>
          <Ionicons
            name={showSuggestions ? 'chevron-up' : 'chevron-down'}
            size={16}
            color="#9CA3AF"
          />
        </TouchableOpacity>

        {showSuggestions && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row gap-2"
          >
            {suggestedHashtags.map((tag) => {
              const normalized = tag.toLowerCase();
              const isSelected = selectedHashtags.includes(normalized);
              const isDisabled = !isSelected && selectedHashtags.length >= maxHashtags;

              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => handleToggleHashtag(tag)}
                  disabled={isDisabled}
                  className={`px-3 py-1.5 rounded-full border ${
                    isSelected
                      ? 'bg-amber-500 border-amber-500'
                      : isDisabled
                      ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-40'
                      : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  <Text
                    className={`typography-caption font-medium ${
                      isSelected
                        ? 'text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    #{tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}
