import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';

import { useAuthStore } from '~/utils/authStore';
import { useOnboardingStore } from '../utils/onboardingStore';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(drawer)',
};


// const shouldCreateAccount = true; // Placeholder for actual condition from supabase

export default function RootLayout() {
  const { isLoggedIn, shouldCreateAccount } = useAuthStore();
  const { hasCompletedOnboarding } = useOnboardingStore();
  console.log('Made it to RootLayout. hasCompletedOnboarding:', hasCompletedOnboarding);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack>
        <Stack.Protected guard={!hasCompletedOnboarding}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={hasCompletedOnboarding}>
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="eventDisclaimer" options={{ title: 'Modal', presentation: 'modal' }} />
          <Stack.Screen name="editProfile" options={{ title: 'Modal', presentation: 'modal' }} />
          <Stack.Screen name="appInfo" options={{ title: 'Modal', presentation: 'modal' }} />
          <Stack.Protected guard={!isLoggedIn}>
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            <Stack.Protected guard={shouldCreateAccount}>
              <Stack.Screen name="createAccount" options={{ headerShown: false }} />
            </Stack.Protected>
          </Stack.Protected>
        </Stack.Protected>
      </Stack>
    </GestureHandlerRootView>
  );
}
