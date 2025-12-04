import { Link, Stack, router } from 'expo-router';

import { HeaderButton } from 'components/UI/HeaderComponents';
import { Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { allEvents } from '~/constants/events/index';
import { isCounterEvent, isTeraRaidEvent, isMysteryGiftEvent, isPromoCodeEvent } from '~/constants/events/types';
import { theme } from 'constants/style/theme';

export default function EventsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Pokemon Events',
          headerShown: false,

          // headerStyle: { height: 56 * 0.9 },
        }} 
      />
      <Stack.Screen 
        name="[event]" 
        options={({ route }) => {
          const { event } = route.params as { event: string };
          const eventData = allEvents[event];
          
          let eventTypeLabel = 'Event';
          if (eventData) {
            if (isCounterEvent(eventData)) {
              eventTypeLabel = 'Participation Challenge';
            } else if (isTeraRaidEvent(eventData)) {
              eventTypeLabel = 'Tera Raid';
            } else if (isMysteryGiftEvent(eventData)) {
              eventTypeLabel = 'Mystery Gift';
            } else if (isPromoCodeEvent(eventData)) {
              eventTypeLabel = 'Promo Code';
            }
          }
          
          return {
            title: eventTypeLabel,
            headerLeft: () => (
              <Pressable
                onPress={() => {
                  router.push('/(drawer)/events');
                }}
                style={{ marginHorizontal: theme.spacing.md }}
              >
                <Ionicons name="arrow-back" size={24} color={theme.colors.light.background} />
              </Pressable>
            ),
            headerRight: () => (
              <Link 
                href={{
                  pathname: '/eventDisclaimer',
                  params: { 
                    eventData: JSON.stringify(eventData || {})
                  }
                }} 
                asChild
              >
                <HeaderButton />
              </Link>
            ),
            headerStyle: { backgroundColor: theme.colors.light.secondary, height: theme.spacing.xl }, // Lavender, shorter
          };
        }}
      />
    </Stack>
  );
}
