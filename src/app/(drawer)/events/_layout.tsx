import { Stack, Link, router } from 'expo-router';
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
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
              style={{ marginHorizontal: 12 }}
            >
              <Image
                source={require('@/assets/PP_Icon.png')}
                style={{ width: 32, height: 32,  }}
              />
            </Pressable>
          ),
          headerRight: () => (
            <Link href="/appInfo" asChild>
              <HeaderButton />
            </Link>
          ),
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
                style={{ marginHorizontal: 16 }}
              >
                <Ionicons name="arrow-back" size={24} color="#599a82ff" />
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
            headerStyle: { backgroundColor: theme.colors.light.secondary, height: 56 * 0.9 }, // Lavender, shorter
          };
        }}
      />
    </Stack>
  );
}
