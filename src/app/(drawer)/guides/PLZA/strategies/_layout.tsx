import { Link, Stack, router } from 'expo-router';
import { HeaderButton } from 'components/UI/HeaderComponents';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import strategiesConfig from '@/src/constants/PLZAStrategiesConfig.json';
import { theme } from 'constants/style/theme';

export default function StrategiesLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Strategies',
          headerShown: false,
        }} 
      />
      <Stack.Screen 
        name="[id]" 
        options={({ route }) => {
          const { id } = route.params as { id: string };
          const config = strategiesConfig[id as keyof typeof strategiesConfig];
          return {
            title: config?.title ? `${config.title}` : 'Strategy Guide',
            headerLeft: () => (
              <Pressable
                onPress={() => {
                  router.push('/(drawer)/guides/PLZA/strategies');
                }}
                style={{ marginHorizontal: theme.spacing.md }}
              >
                <Ionicons name="arrow-back" size={24} color={theme.colors.light.background} />
              </Pressable>
            ),
            headerShown: false,
            headerRight: () => (
              <Link href="/editProfile" asChild>
                <HeaderButton iconName="user-circle" />
              </Link>
            ),
            headerTitleAlign: 'center',
            headerStyle: {
              backgroundColor: theme.colors.light.primary,
            },
            headerTintColor: theme.colors.light.background,
            headerTitleStyle: {
              fontFamily: theme.fontFamilies.header,
              fontSize: theme.fontSizes.xl,
              fontWeight: theme.fontWeights.bold,
              color: theme.colors.light.background,
            },
          };
        }}
      />
    </Stack>
  );
}
