import { Tabs } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from '../../../../constants/style/theme';

export default function ResourcesTabsLayout() {
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
        name="top50"
        options={{
          title: 'Raid Counters',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="type-calculator"
        options={{
          title: 'Type Calculator',
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calculate" size={size} color={color} />
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
