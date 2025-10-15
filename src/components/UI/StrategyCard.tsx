import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useRouter } from 'expo-router';

interface StrategyCardProps {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
}

export function StrategyCard({ id, title, subtitle, icon }: StrategyCardProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/(drawer)/guides/PLZA/strategies/${id}` as any);
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.8}
      className="mb-4"
    >
      <View className="bg-gradient-to-r from-purple-700 to-purple-500 dark:from-purple-800 dark:to-purple-600 rounded-2xl p-6 shadow-app-large">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-4xl mb-2">{icon}</Text>
            <Text className="text-xl font-bold text-white mb-1">{title}</Text>
            <Text className="text-sm text-gray-200">{subtitle}</Text>
          </View>
          <View className="bg-white/20 rounded-full p-3">
            <Text className="text-white text-2xl">›</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
