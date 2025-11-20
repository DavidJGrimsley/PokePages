import React, { useState, useMemo } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { HomeCard } from './HomeCard';
import { ShortcutsModal } from './ShortcutsModal';
import { useFavoriteFeaturesStore } from '@/src/store/favoriteFeaturesStore';
import { useAuthStore } from '@/src/store/authStore';
import { getFeatureMeta } from '@/src/utils/featureRegistry';

interface HomeCardsProps {
  newestFeaturePath?: string;
  newestFeatureTitle?: string;
}

export const HomeCards: React.FC<HomeCardsProps> = ({
  newestFeaturePath = '/(drawer)/guides/PLZA/strategies',
  newestFeatureTitle = 'Legends Z-A',
}) => {
  const { width } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);
  
  const user = useAuthStore((s) => s.user);
  const isSignedIn = !!user;
  
  const favoritesObj = useFavoriteFeaturesStore((s) => s.favorites);
  const favoriteKeys = useMemo(() => Object.keys(favoritesObj), [favoritesObj]);

  // Calculate responsive columns
  // Small screens (<640px): 2 columns
  // Medium screens (640-1024px): 2 columns
  // Large screens (>1024px): 3 columns
  const columns = width < 640 ? 2 : width < 1024 ? 2 : 3;
  const cardWidth = columns === 2 ? '48%' : '32%';

  // Build favorite feature cards
  const favoriteCards = useMemo(() => {
    return favoriteKeys
      .map(key => {
        const meta = getFeatureMeta(key);
        if (!meta || !meta.path) return null;
        
        return (
          <View key={key} style={{ width: cardWidth, marginBottom: 16 }}>
            <HomeCard
              title={meta.title || 'Feature'}
              icon={meta.icon as any}
              path={meta.path}
              variant="shortcut"
            />
          </View>
        );
      })
      .filter(Boolean);
  }, [favoriteKeys, cardWidth]);

  return (
    <>
      <View className="items-center mb-lg">
        <Text
          role="heading"
          aria-level={3}
          className="typography-subheader text-app-secondary mb-sm"
        >
          Quick Access
        </Text>
        
        <View className="flex-row flex-wrap justify-between">
          {/* System Cards - Messages with NEW badge */}
          <View style={{ width: cardWidth, marginBottom: 16 }}>
            <HomeCard
              title="Messages"
              icon="chatbubbles"
              path="/(drawer)/social/(tabs)/messages"
              variant="system"
              badge="NEW"
            />
          </View>

          {/* System Cards - Newest Feature */}
          <View style={{ width: cardWidth, marginBottom: 16 }}>
            <HomeCard
              title={newestFeatureTitle}
              icon="star"
              path={newestFeaturePath}
              variant="system"
              showNewFeatureLabel
            />
          </View>

          {/* Favorite Shortcuts */}
          {favoriteCards.length > 0 ? (
            favoriteCards
          ) : (
            // Empty state card
            <View style={{ width: cardWidth, marginBottom: 16 }}>
              <HomeCard
                title={isSignedIn ? 'Add Shortcut' : 'Sign in to add shortcuts'}
                icon={isSignedIn ? 'add-circle' : 'log-in'}
                path={isSignedIn ? '#' : '/(drawer)/profile/(tabs)/settings'}
                variant="shortcut"
                onPress={isSignedIn ? () => setModalVisible(true) : undefined}
              />
            </View>
          )}
        </View>
      </View>

      {/* Shortcuts Info Modal */}
      <ShortcutsModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </>
  );
};
