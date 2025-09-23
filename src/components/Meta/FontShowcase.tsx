import React from 'react';
import { View, Text, ScrollView } from 'react-native';

export const FontShowcase: React.FC = () => {
  return (
    <ScrollView className="flex-1 bg-purple-100" showsVerticalScrollIndicator={false}>
      <View className="p-6">
        <Text className="text-xl font-medium text-black text-center mb-8">Font Showcase</Text>
        
        {/* Display Font */}
        <View className="mb-8 p-4 bg-white rounded-lg shadow-sm">
          <Text className="text-sm font-semibold text-amber-700 mb-3 uppercase tracking-wide">Display Font (Modak)</Text>
          <Text className="text-4xl text-purple-900 text-center" style={{ fontFamily: 'Modak' }}>TemplateApp</Text>
        </View>

        {/* Call to Action Font */}
        <View className="mb-8 p-4 bg-white rounded-lg shadow-sm">
          <Text className="text-sm font-semibold text-amber-700 mb-3 uppercase tracking-wide">Call to Action (Press Start 2P)</Text>
          <Text className="text-red-500 text-center bg-purple-100 p-4 rounded-md" style={{ fontFamily: 'PressStart2P' }}>LEVEL UP!</Text>
        </View>

        {/* Header Font */}
        <View className="mb-8 p-4 bg-white rounded-lg shadow-sm">
          <Text className="text-sm font-semibold text-amber-700 mb-3 uppercase tracking-wide">Header Font (Roboto Slab)</Text>
          <Text className="text-xl font-medium text-black" style={{ fontFamily: 'RobotoSlab' }}>Latest App Events</Text>
        </View>

        {/* Subheader Font */}
        <View className="mb-8 p-4 bg-white rounded-lg shadow-sm">
          <Text className="text-sm font-semibold text-amber-700 mb-3 uppercase tracking-wide">Subheader (Roboto Condensed)</Text>
          <Text className="text-lg font-medium text-purple-300" style={{ fontFamily: 'RobotoCondensed' }}>Community Challenge Progress</Text>
        </View>

        {/* Copy Font */}
        <View className="mb-8 p-4 bg-white rounded-lg shadow-sm">
          <Text className="text-sm font-semibold text-amber-700 mb-3 uppercase tracking-wide">Body Copy (Roboto)</Text>
          <Text className="text-base text-black" style={{ fontFamily: 'Roboto' }}>
            Join users worldwide in community challenges to unlock special rewards. 
            Track your progress and contribute to the global counter!
          </Text>
        </View>

        {/* Copy Bold */}
        <View className="mb-8 p-4 bg-white rounded-lg shadow-sm">
          <Text className="text-sm font-semibold text-amber-700 mb-3 uppercase tracking-wide">Body Copy Bold (Roboto Bold)</Text>
          <Text className="text-base text-black font-bold" style={{ fontFamily: 'Roboto-Bold' }}>
            Important announcements and highlighted information use this bold variant for emphasis.
          </Text>
        </View>

        {/* Mono Font */}
        <View className="mb-8 p-4 bg-white rounded-lg shadow-sm">
          <Text className="text-sm font-semibold text-amber-700 mb-3 uppercase tracking-wide">Monospace (Roboto Mono)</Text>
          <Text className="font-mono text-amber-700 bg-purple-100 p-4 rounded border border-purple-300">
            user_id_12345{'\n'}
            event_counter: 421{'\n'}
            last_updated: 2025-08-13T05:30:38.290Z
          </Text>
        </View>

        {/* Typography Combinations */}
        <View className="mb-8 p-4 bg-white rounded-lg shadow-sm">
          <Text className="text-sm font-semibold text-amber-700 mb-3 uppercase tracking-wide">Typography in Action</Text>
          <View className="bg-white p-6 rounded-lg border-l-4 border-red-500 shadow-md">
            <Text className="text-xl font-medium text-black mb-3" style={{ fontFamily: 'RobotoSlab' }}>Sample Event</Text>
            <Text className="text-lg font-medium text-purple-300 mb-4" style={{ fontFamily: 'RobotoCondensed' }}>Global Community Challenge</Text>
            <Text className="text-base text-amber-700 mb-6" style={{ fontFamily: 'Roboto' }}>
              Join the community challenge to help everyone reach 
              the goal of 100,000 participants and unlock rewards for everyone!
            </Text>
            <View className="bg-red-500 py-4 px-6 rounded-md items-center shadow-sm">
              <Text className="text-white" style={{ fontFamily: 'PressStart2P' }}>CONTRIBUTE NOW</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
