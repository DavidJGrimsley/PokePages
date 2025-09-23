import React from 'react';
import { View, Text } from 'react-native';

interface ComingSoonProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  colorScheme?: 'light' | 'dark';
}

export const ComingSoon: React.FC<ComingSoonProps> = ({
  title = "Coming Soon",
  subtitle = "We're working hard to bring you something amazing! Stay tuned for updates.",
  icon = "🚧",
  colorScheme = 'light'
}) => {
  const isDark = colorScheme === 'dark';

  return (
    <View className={`flex-1 justify-center items-center p-6 ${
      isDark ? 'bg-gray-900' : 'bg-purple-100'
    }`}>
      <View className="items-center max-w-sm w-full">
        <Text className="text-6xl mb-6">{icon}</Text>
        <Text className={`text-2xl font-medium mb-4 text-center ${
          isDark ? 'text-white' : 'text-black'
        }`}>{title}</Text>
        <Text className={`text-base text-center mb-8 ${
          isDark ? 'text-gray-300' : 'text-amber-700'
        }`}>{subtitle}</Text>
        
        <View className="w-full mb-8">
          <View className="h-2 bg-purple-300 rounded-sm overflow-hidden mb-3">
            <View className="h-full w-9/12 bg-green-600 rounded-sm" />
          </View>
          <Text className={`text-base text-center ${
            isDark ? 'text-gray-300' : 'text-amber-700'
          }`}>
            Development in progress...
          </Text>
        </View>
        
        <View className="w-full bg-white p-6 rounded-md border border-purple-300 shadow-sm">
          <Text className={`text-lg font-medium mb-4 text-center ${
            isDark ? 'text-white' : 'text-black'
          }`}>
            What&apos;s Coming:
          </Text>
          <Text className={`text-base mb-3 ${
            isDark ? 'text-gray-300' : 'text-amber-700'
          }`}>
            • Enhanced user experience
          </Text>
          <Text className={`text-base mb-3 ${
            isDark ? 'text-gray-300' : 'text-amber-700'
          }`}>
            • New features and functionality
          </Text>
          <Text className={`text-base mb-3 ${
            isDark ? 'text-gray-300' : 'text-amber-700'
          }`}>
            • Improved performance
          </Text>
        </View>
      </View>
    </View>
  );
};
