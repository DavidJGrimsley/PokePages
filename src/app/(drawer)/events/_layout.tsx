import { Link, Stack, router } from 'expo-router';

import { HeaderButton } from '@/src/components/HeaderComponents';
import { Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { eventConfig } from '@/constants/eventConfig';
import { theme } from '@/constants/style/theme';

export default function EventsLayout() {
  const navigation = useNavigation();

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
        name="[counterEvent]" 
        options={({ route }) => {
          const { counterEvent } = route.params as { counterEvent: string };
          const config = eventConfig[counterEvent as keyof typeof eventConfig];
          return {
            title: config?.pokemonName ? `${config.eventTitle}` : 'Defeat Counter',
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
                    eventData: JSON.stringify(config || {})
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
