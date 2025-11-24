import { Link, Stack, router } from 'expo-router';
import { HeaderButton } from 'components/UI/HeaderComponents';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from 'constants/style/theme';

export default function NewsLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Pokémon News',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="[slug]" 
        options={{
          title: 'Article',
          headerLeft: () => (
            <Pressable
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.push('/(drawer)');
                }
              }}
              style={{ marginHorizontal: theme.spacing.md }}
            >
              <Ionicons name="arrow-back" size={24} color={theme.colors.light.background} />
            </Pressable>
          ),
          headerRight: () => (
            <Link href="/(profile)/account" asChild>
              <HeaderButton iconName="user-circle" />
            </Link>
          ),
          headerStyle: { backgroundColor: theme.colors.light.secondary, height: theme.spacing.xl },
        }}
      />
    </Stack>
  );
}
