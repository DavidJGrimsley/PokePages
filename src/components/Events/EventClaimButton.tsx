import React from 'react';
import { View, Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '~/utils/cn';

interface EventClaimButtonProps {
  claimed: boolean;
  onToggle: () => void;
  iconName: keyof typeof Ionicons.glyphMap;
  claimedLabel?: string;
  unclaimedLabel?: string;
}

export const EventClaimButton: React.FC<EventClaimButtonProps> = ({
  claimed,
  onToggle,
  iconName,
  claimedLabel = '✓ Claimed',
  unclaimedLabel = 'Mark as Claimed',
}) => {
  const baseIconName = iconName.replace('-outline', '') as keyof typeof Ionicons.glyphMap;
  const outlineIconName = iconName.includes('-outline') ? iconName : `${iconName}-outline` as keyof typeof Ionicons.glyphMap;

  return (
    <View className="flex-row items-center gap-x-md bg-app-white dark:bg-dark-app-background rounded-lg p-md border border-app-secondary dark:border-app-accent">
      <Ionicons 
        name={claimed ? baseIconName : outlineIconName} 
        size={32} 
        color={claimed ? '#22c55e' : '#2563eb'}
      />
      <Pressable
        onPress={onToggle}
        className={cn(
          'flex-1 py-sm px-md rounded-md items-center border-2',
          claimed
            ? 'bg-green-500 border-green-600'
            : 'bg-blue-600 border-blue-700'
        )}
      >
        <Text className="typography-cta text-app-white text-center">
          {claimed ? claimedLabel : unclaimedLabel}
        </Text>
      </Pressable>
    </View>
  );
};
