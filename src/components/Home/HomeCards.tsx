import React, { useState, useMemo, useEffect } from 'react';
import { View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { HomeCard } from './HomeCard';
import { ShortcutsModal } from './ShortcutsModal';
import { useFavoriteFeaturesStore } from '@/src/store/favoriteFeaturesStore';
import { useAuthStore } from '@/src/store/authStore';
import { getFeatureMeta } from '@/src/utils/featureRegistry';
import { useNavigateToSignIn, useShowSignInAlert } from '@/src/hooks/useNavigateToSignIn';
import { getActiveEvents, EventType } from '~/constants/events';
import { getLocalClaims, type EventClaimsCache } from '@/src/services/eventClaimsService';

interface HomeCardsProps {
  newestFeaturePath?: string;
  newestFeatureTitle?: string;
}

export const HomeCards: React.FC<HomeCardsProps> = ({
  newestFeaturePath = '/guides/PLZA/strategies',
  newestFeatureTitle = 'Legends Z-A',
}) => {
  const { width } = useWindowDimensions();
  const [modalVisible, setModalVisible] = useState(false);
  const navigateToSignIn = useNavigateToSignIn();
  const showSignInAlert = useShowSignInAlert();
  const router = useRouter();
  
  const user = useAuthStore((s) => s.user);
  const isSignedIn = !!user;
  
  const favoritesObj = useFavoriteFeaturesStore((s) => s.favorites);
  const getFavoriteTitle = useFavoriteFeaturesStore((s) => s.getFavoriteTitle);
  const initializeFavorites = useFavoriteFeaturesStore((s) => s.initialize);
  const favoriteKeys = useMemo(() => Object.keys(favoritesObj), [favoritesObj]);
  
  // Get event claims to filter out claimed events
  const [eventClaims, setEventClaims] = useState<EventClaimsCache>({});
  
  // Load claims on mount
  useEffect(() => {
    const loadClaims = async () => {
      const claims = await getLocalClaims();
      setEventClaims(claims);
    };
    loadClaims();
  }, []);
  
  // Reload favorites and claims when screen comes into focus (after sign-in or claiming an event)
  useFocusEffect(
    React.useCallback(() => {
      const refreshData = async () => {
        // Reload favorites if user is signed in
        if (isSignedIn) {
          await initializeFavorites();
        }
        // Reload event claims
        const claims = await getLocalClaims();
        setEventClaims(claims);
      };
      refreshData();
    }, [isSignedIn, initializeFavorites])
  );

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
        const storedTitle = getFavoriteTitle(key);
        
        // Use stored title as fallback if feature isn't registered
        const title = meta?.title || storedTitle || 'Feature';
        const icon = meta?.icon || 'book';
        
        // Construct path from feature key if meta not available
        // Feature keys follow format: "feature:path.to.page"
        let path = meta?.path;
        if (!path && key.startsWith('feature:')) {
          // Extract path from key: "feature:guides.PLZA.strategies.competitive-training" -> "/guides/PLZA/strategies/competitive-training"
          path = '/' + key.replace('feature:', '').replace(/\./g, '/');
        }
        
        // Skip if we still don't have a valid path
        if (!path || path === '#') return null;
        
        return (
          <View key={key} style={{ width: cardWidth, marginBottom: 16 }}>
            <HomeCard
              title={title}
              icon={icon as any}
              path={path}
              variant="favorite"
            />
          </View>
        );
      })
      .filter(Boolean);
  }, [favoriteKeys, cardWidth, getFavoriteTitle]);

  // Build event cards - only show unclaimed active events, one per type
  const eventCards = useMemo(() => {
    // Get first unclaimed event from each type
    const seenTypes = new Set<EventType>();
    const uniqueEvents: any[] = [];

    const allActiveEvents = [
      ...getActiveEvents(EventType.MYSTERY_GIFT),
      ...getActiveEvents(EventType.PROMO_CODE),
      ...getActiveEvents(EventType.TERA_RAID),
      ...getActiveEvents(EventType.COUNTER),
    ];

    for (const event of allActiveEvents) {
      if (!seenTypes.has(event.eventType) && !eventClaims[event.eventKey]?.claimed) {
        seenTypes.add(event.eventType);
        uniqueEvents.push(event);
      }
    }

    const cards = uniqueEvents.map(event => {
      // Determine icon based on event type
      let icon: keyof typeof import('@expo/vector-icons').Ionicons.glyphMap = 'calendar';
      if (event.eventType === EventType.MYSTERY_GIFT) icon = 'gift';
      else if (event.eventType === EventType.PROMO_CODE) icon = 'key';
      else if (event.eventType === EventType.TERA_RAID) icon = 'trophy';
      else if (event.eventType === EventType.COUNTER) icon = 'flash';

      return (
        <View key={event.eventKey} style={{ width: cardWidth, marginBottom: 16 }}>
          <HomeCard
            title={event.title}
            icon={icon}
            path={`/(drawer)/events/${event.eventKey}` as any}
            variant="event"
          />
        </View>
      );
    });

    // Add "More Events" card at the end
    cards.push(
      <View key="more-events" style={{ width: cardWidth, marginBottom: 16 }}>
        <HomeCard
          title="More Events"
          icon="trophy"
          path="/(drawer)/events"
          variant="event"
        />
      </View>
    );

    return cards;
  }, [eventClaims, cardWidth]);

  return (
    <>
      <View className="items-center mb-lg">
        
        <View className="flex-row flex-wrap justify-between w-full sm:max-w-[80%]">
          {/* System Cards - Messages with NEW badge */}
          <View style={{ width: cardWidth, marginBottom: 16 }}>
            <HomeCard
              title="Messages"
              icon="chatbubbles"
              path="#"
              variant="system"
              badge="NEW"
              onPress={() => {
                if (isSignedIn) {
                  router.push('/(drawer)/social/(tabs)/messages');
                } else {
                  showSignInAlert();
                }
              }}
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

          {/* Events Cards (if active events) - Only title and icon, and only show if claimed status is not true */}
          {eventCards}

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
