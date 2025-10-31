import { Tabs, usePathname, useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from 'constants/style/theme';
import { useEffect } from 'react';

export default function ResourcesTabsLayout() {
  const pathname = usePathname();
  const router = useRouter();

  // Ensure the URL reflects the default child route when landing on /resources
  useEffect(() => {
    if (pathname === '/(drawer)/resources' || pathname === '/resources') {
      router.replace('/(drawer)/resources/type/analyzer');
    }
  }, [pathname, router]);

  return (
    <Tabs
      initialRouteName="type"
      screenOptions={{
        tabBarStyle: theme.tabBarStyles.tabBarStyle,
        tabBarLabelStyle: theme.tabBarStyles.tabBarLabelStyle,
        tabBarActiveTintColor: theme.tabBarStyles.tabBarActiveTintColor,
        tabBarInactiveTintColor: theme.tabBarStyles.tabBarInactiveTintColor,
        tabBarIconStyle: theme.tabBarStyles.tabBarIconStyle,
      }}
    >
      <Tabs.Screen
        name="type"
        options={{
          title: 'Types',
          headerShown: false,
          href: '/(drawer)/resources/type/analyzer',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calculate" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ask"
        options={{
          title: 'Ask AI',
          headerShown: false,
          href: '/(drawer)/resources/ask',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell-outline" size={size} color={color} />
          ),
        }}
      />
        
    </Tabs>
  );
}
