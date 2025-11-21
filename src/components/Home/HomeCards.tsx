import React, { useState, useMemo } from 'react';
import { View, Text, useWindowDimensions } from 'react-native';
import { HomeCard } from './HomeCard';
import { ShortcutsModal } from './ShortcutsModal';
import { useFavoriteFeaturesStore } from '@/src/store/favoriteFeaturesStore';
import { useAuthStore } from '@/src/store/authStore';
import { getFeatureMeta } from '@/src/utils/featureRegistry';
import { useNavigateToSignIn } from '@/src/hooks/useNavigateToSignIn';

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
  const navigateToSignIn = useNavigateToSignIn();
  
  const user = useAuthStore((s) => s.user);
  const isSignedIn = !!user;
  
  const favoritesObj = useFavoriteFeaturesStore((s) => s.favorites);
  const favoriteKeys = useMemo(() => Object.keys(favoritesObj), [favoritesObj]);

  // Calculate responsive columns
  // Small screens (<640px): 2 columns
  // Tablet (640-1024px): 3 columns
  // Desktop (>1024px): 4 columns
  const columns = width < 640 ? 2 : width < 1024 ? 3 : 4;
  const cardWidth = columns === 2 ? '48%' : columns === 3 ? '31%' : '23%';

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
              variant="favorite"
            />
          </View>
        );
      })
      .filter(Boolean);
  }, [favoriteKeys, cardWidth]);

  return (
    <>
      <View className="items-center mb-lg">
        
        <View className="flex-row flex-wrap justify-between w-full sm:max-w-[80%]">
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
                path="#"
                variant="favorite"
                onPress={isSignedIn ? () => setModalVisible(true) : navigateToSignIn}
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
