import React from 'react';
import { Pressable } from 'react-native';
import Animated, { Layout, FadeIn, FadeOut } from 'react-native-reanimated';
import { Platform } from 'react-native';
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

  console.log('[FavoriteToggle] RENDER', { featureKey, isLoggedIn, isFavorite, isSyncing });

  // Use Reanimated Layout and Fade transitions for a simpler dissolve effect

  const handleToggle = async () => {
    console.log('[FavoriteToggle] handleToggle CALLED', { featureKey, isLoggedIn, isFavorite, isSyncing });
    try {
      if (!isLoggedIn) {
        console.log('[FavoriteToggle] not logged in, navigating to sign-in');
        navigateToSignIn();
        return;
      }
      console.log('[FavoriteToggle] calling toggleFavorite...');
      await toggleFavorite(featureKey, featureTitle);
      console.log('[FavoriteToggle] toggleFavorite completed');
    } catch (err: any) {
      if (err?.message === 'AUTH_REQUIRED') {
        console.log('[FavoriteToggle] auth required error');
        navigateToSignIn();
      } else {
        console.error('[FavoriteToggle] toggle error', err);
      }
    }
  };

  return (
    <Pressable
      onPress={handleToggle}
      onPressIn={() => console.log('[FavoriteToggle] onPressIn')}
      onPressOut={() => console.log('[FavoriteToggle] onPressOut')}
      accessibilityLabel="toggle favorite"
      accessibilityRole="button"
      accessibilityState={{ selected: isFavorite }}
      style={[{ padding: 8, minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', zIndex: 999, ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}) }, style]}
      hitSlop={{ top: 8, left: 8, bottom: 8, right: 8 }}
      disabled={isSyncing}
    >
      <Animated.View layout={Layout} entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)}>
        <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={size} color={isFavorite ? '#F44336' : '#6B7280'} />
      </Animated.View>
    </Pressable>
  );
}
