import { Tabs } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { theme } from 'constants/style/theme';

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
        name="type"
        options={{
          title: 'Types',
          headerShown: false,
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
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="barbell-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="colorChips"
          options={{
            title: 'Color Chips',
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="barbell-outline" size={size} color={color} />
            ),
          }}
        />
    </Tabs>
  );
}
