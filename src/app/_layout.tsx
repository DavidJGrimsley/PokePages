import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, SplashScreen } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

import { useAuthStore } from '~/utils/authStore';
import { useOnboardingStore } from '~/utils/onboardingStore';

const isWeb = Platform.OS === 'web';

if (!isWeb) {
  SplashScreen.preventAutoHideAsync();
}

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(drawer)',
};

export default function RootLayout() {
  const {
    isLoggedIn,
    shouldCreateAccount,
    _hasHydrated,
  } = useAuthStore();

  const { hasCompletedOnboarding, _hasHydratedOnboarding } = useOnboardingStore();

  // https://zustand.docs.pmnd.rs/integrations/persisting-store-data#how-can-i-check-if-my-store-has-been-hydrated
  // Hide the splash screen after both stores have been hydrated
  useEffect(() => {
    if (_hasHydrated && _hasHydratedOnboarding) {
      SplashScreen.hideAsync();
    }
  }, [_hasHydrated, _hasHydratedOnboarding]);

  if ((!_hasHydrated || !_hasHydratedOnboarding) && !isWeb) {
    return null;
  }

  // Skip onboarding on web platform
  const shouldShowOnboarding = (Platform.OS !== 'web' && !hasCompletedOnboarding) || (isLoggedIn && !hasCompletedOnboarding);

  console.log('Made it to RootLayout. hasCompletedOnboarding:', hasCompletedOnboarding);
  console.log('Platform:', Platform.OS, 'shouldShowOnboarding:', shouldShowOnboarding);
  console.log('_hasHydrated (auth):', _hasHydrated, '_hasHydratedOnboarding:', _hasHydratedOnboarding);
  
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <Stack>
        <Stack.Protected guard={shouldShowOnboarding}>
          <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        </Stack.Protected>
        <Stack.Protected guard={!shouldShowOnboarding}>
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="eventDisclaimer" options={{ title: 'Modal', presentation: 'modal' }} />
          <Stack.Screen name="appInfo" options={{ title: 'Modal', presentation: 'modal' }} />
          <Stack.Protected guard={!isLoggedIn}>
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
            
          </Stack.Protected>
          <Stack.Protected guard={isLoggedIn}>
            <Stack.Screen name="editProfile" options={{ title: 'Modal', presentation: 'modal' }} />
          </Stack.Protected>
        </Stack.Protected>
      </Stack>
    </GestureHandlerRootView>
  );
}
