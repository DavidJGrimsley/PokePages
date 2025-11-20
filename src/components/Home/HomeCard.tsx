import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type HomeCardVariant = 'system' | 'shortcut' | 'event';

interface HomeCardProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  path: string;
  variant?: HomeCardVariant;
  badge?: string; // Optional badge text (e.g., "NEW" for Messages)
  onPress?: () => void; // For modal triggers instead of navigation
  showNewFeatureLabel?: boolean; // Show "New Feature" label for newest feature card
}

const variantStyles = {
  system: {
    borderColor: 'border-l-app-primary',
    iconColor: '#A33EA1', // Primary purple from theme
    bgColor: 'bg-app-background dark:bg-dark-app-background',
  },
  shortcut: {
    borderColor: 'border-l-orange-500',
    iconColor: '#F95587', // Psychic pink from theme
    bgColor: 'bg-app-background dark:bg-dark-app-background',
  },
  event: {
    borderColor: 'border-l-red-500',
    iconColor: '#EE8130', // Fire orange from theme
    bgColor: 'bg-app-background dark:bg-dark-app-background',
  },
};

export const HomeCard: React.FC<HomeCardProps> = ({
  title,
  icon,
  path,
  variant = 'system',
  badge,
  onPress,
  showNewFeatureLabel = false,
}) => {
  const styles = variantStyles[variant];
  
  const CardContent = (
    <Pressable 
      className={`${styles.bgColor} ${styles.borderColor} border-l-4 rounded-lg shadow-app-small active:opacity-80 aspect-square`}
      onPress={onPress}
      style={{ width: '100%' }}
    >
      <View className="flex-1 p-md justify-center items-center">
        {/* Icon with optional "New Feature" label */}
        {icon && (
          <View className="mb-sm flex-row items-center">
            <Ionicons name={icon} size={40} color={styles.iconColor} />
            {showNewFeatureLabel && (
              <Text className="text-xs font-medium text-app-brown dark:text-dark-app-brown ml-xs">
                New Feature
              </Text>
            )}
          </View>
        )}
        
        {/* Title without background */}
        <View className="w-full">
          <Text className={`typography-cta text-app-accent dark:text-dark-app-accent text-center`} numberOfLines={2}>
            {title}
          </Text>
        </View>
        
        {/* Optional Badge (e.g., "NEW" for Messages) */}
        {badge && (
          <View className="bg-red-500 px-sm py-xs rounded-md mt-sm absolute top-2 right-2">
            <Text className="text-app-white text-xs font-bold">{badge}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );

  // If onPress is provided, render without Link wrapper (for modals)
  if (onPress) {
    return CardContent;
  }

  // Otherwise wrap in Link for navigation
  return (
    <Link href={path as any} asChild>
      {CardContent}
    </Link>
  );
};
