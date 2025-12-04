import React, { useEffect } from 'react';
import { Pressable, View, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import useFavoriteFeaturesStore from '@/src/store/favoriteFeaturesStore';
import { useAuthStore } from '@/src/store/authStore';
import { useNavigateToSignIn } from '@/src/hooks/useNavigateToSignIn';

type FavoriteToggleProps = {
  featureKey: string;
  featureTitle?: string;
  size?: number;
  style?: any;
};

export default function FavoriteToggle({ featureKey, featureTitle, size = 22, style }: FavoriteToggleProps) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const isFavorite = useFavoriteFeaturesStore((s) => s.isFavorite(featureKey));
  const toggleFavorite = useFavoriteFeaturesStore((s) => s.toggleFavorite);
  const isSyncing = useFavoriteFeaturesStore((s) => s.isSyncing);
  const navigateToSignIn = useNavigateToSignIn();

  const progress = useSharedValue(isFavorite ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(isFavorite ? 1 : 0, { duration: 300 });
  }, [isFavorite, progress]);

  const filledStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [{ scale: 0.9 + progress.value * 0.1 }],
    };
  });

  const outlineStyle = useAnimatedStyle(() => {
    return {
      opacity: 1 - progress.value,
      transform: [{ scale: 1 - progress.value * 0.1 }],
    };
  });

  const handleToggle = async () => {
    try {
      if (!isLoggedIn) {
        navigateToSignIn();
        return;
      }
      await toggleFavorite(featureKey, featureTitle);
    } catch (err: any) {
      if (err?.message === 'AUTH_REQUIRED') {
        navigateToSignIn();
      } else {
        console.error('[FavoriteToggle] toggle error', err);
      }
    }
  };

  return (
    <Pressable
      onPress={handleToggle}
      accessibilityLabel="toggle favorite"
      accessibilityRole="button"
      accessibilityState={{ selected: isFavorite }}
      hitSlop={{ top: 8, left: 8, bottom: 8, right: 8 }}
      disabled={isSyncing}
    >
      <View style={{ position: 'relative', width: size, height: size }}>
        <Animated.View style={[{ position: 'absolute' }, outlineStyle]}>
          <Ionicons name="heart-outline" size={size} color="#6B7280" />
        </Animated.View>
        <Animated.View style={[{ position: 'absolute' }, filledStyle]}>
          <Ionicons name="heart" size={size} color="#F44336" />
        </Animated.View>
      </View>
    </Pressable>
  );
}
