import { Tabs } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

export default function ResourcesTabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
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
