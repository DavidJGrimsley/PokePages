import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';

interface NewestFeatureProps {
  title: string;
  description: string;
  path: string;
}

export const NewestFeature: React.FC<NewestFeatureProps> = ({
  title,
  description,
  path,
}) => {
  return (
    <Link href={path as any} asChild>
      <Pressable className="bg-white p-3 rounded-md mb-4 shadow-lg border border-purple-300 flex-row items-center">
        <View className="flex-1 mr-4">
          <Text className="text-lg font-medium text-black mb-3">{title}</Text>
          <Text className="text-base text-amber-700">{description}</Text>
        </View>
        <View className="bg-red-500 px-3 py-1 rounded-md">
          <Text 
            className="text-white text-xs font-mono p-3" 
            style={{ letterSpacing: 0.5 }}
          >
            NEW
          </Text>
        </View>
        <Text 
          className="text-green-600 text-6xl" 
          style={{ fontFamily: 'Modak' }}
        >
          →
        </Text>
      </Pressable>
    </Link>
  );
};
