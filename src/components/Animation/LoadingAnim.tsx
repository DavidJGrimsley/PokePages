import React from 'react';
import { View, Text } from 'react-native';

export default function Loading() {
  return (
    <View className="flex-1 justify-center items-center bg-app-background">
      <View className="animate-pulse-scale">
        <Text className="text-6xl font-modak text-app-primary select-none drop-shadow-lg">
          PP
        </Text>
      </View>
    </View>
  );
}