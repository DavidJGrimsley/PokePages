import { Tabs } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from 'constants/style/theme';

export default function Gen9Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: theme.tabBarStyles.tabBarStyle,
        tabBarLabelStyle: theme.tabBarStyles.tabBarLabelStyle,
        tabBarActiveTintColor: theme.tabBarStyles.tabBarActiveTintColor,
        tabBarInactiveTintColor: theme.tabBarStyles.tabBarInactiveTintColor,
        tabBarIconStyle: theme.tabBarStyles.tabBarIconStyle,
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="strategies"
        options={{
          title: 'Strategies',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="top-50"
        options={{
          title: 'Top 50 Builds',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="raid-counter"
        options={{
          title: 'Raid Counters',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="shield-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
