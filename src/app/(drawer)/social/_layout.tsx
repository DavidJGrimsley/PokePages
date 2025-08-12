import { Stack } from 'expo-router';

import { useAuthStore } from '@/src/utils/authStore';




export default function SocialLayout() {
  const { isLoggedIn } = useAuthStore();
  return (
      <Stack>
        <Stack.Protected guard={!isLoggedIn}>
          <Stack.Screen name="index" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={isLoggedIn}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack.Protected>
          
      </Stack>
  );
}
