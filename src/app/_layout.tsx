import '@/global.css';  // Import global CSS

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, SplashScreen } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, View } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { 
  PressStart2P_400Regular,
} from '@expo-google-fonts/press-start-2p';
import {
  Modak_400Regular,
} from '@expo-google-fonts/modak';
import {
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';
import {
  RobotoSlab_400Regular,
  RobotoSlab_600SemiBold,
} from '@expo-google-fonts/roboto-slab';
import {
  RobotoCondensed_400Regular,
  RobotoCondensed_500Medium,
} from '@expo-google-fonts/roboto-condensed';
import {
  RobotoMono_400Regular,
  RobotoMono_700Bold,
} from '@expo-google-fonts/roboto-mono';

import { useAuthStore } from '~/store/authStore';
import { useOnboardingStore } from '~/store/onboardingStore';
// HeaderTitle removed from root layout (not used here)
import Loading from '@/src/components/Animation/LoadingFull';

// Add mobile debugging console ONLY in development
// In development we previously added a mobile in-browser console (eruda).
// Removed noisy dev-only script injection to avoid interfering with automated tests
// and user debugging sessions. Keep hydration and splash-screen logic below intact.

const isWeb = Platform.OS === 'web';

if (!isWeb) {
  SplashScreen.preventAutoHideAsync();
}

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(drawer)',
};

export default function RootLayout() {
  // Load Google Fonts
  const [fontsLoaded] = useFonts({
    'PressStart2P': PressStart2P_400Regular,
    'Press Start 2P': PressStart2P_400Regular,
    'Modak': Modak_400Regular,
    'Roboto': Roboto_400Regular,
    'Roboto-Medium': Roboto_500Medium,
    'Roboto-Bold': Roboto_700Bold,
    'Roboto Slab': RobotoSlab_400Regular,
    'Roboto Slab-SemiBold': RobotoSlab_600SemiBold,
    'Roboto Condensed': RobotoCondensed_400Regular,
    'Roboto Condensed-Medium': RobotoCondensed_500Medium,
    'Roboto Mono': RobotoMono_400Regular,
    'Roboto Mono-Bold': RobotoMono_700Bold,
  });

  // Add fallback for slow font loading on mobile
  const [fontLoadingTimedOut, setFontLoadingTimedOut] = useState(false);
  
  useEffect(() => {
    // Set a timeout for font loading (5 seconds)
    const fontTimeout = setTimeout(() => {
      if (!fontsLoaded) {
        setFontLoadingTimedOut(true);
      }
    }, 5000);

    return () => clearTimeout(fontTimeout);
  }, [fontsLoaded]);

  // Global error diagnostics for web to surface silent failures in production
  useEffect(() => {
    if (Platform.OS === 'web') {
      const onError = (event: ErrorEvent) => {
        console.error('[GLOBAL onerror]', event.message, {
          error: event.error,
          file: event.filename,
          line: event.lineno,
          column: event.colno,
        });
      };
      const onUnhandledRejection = (event: PromiseRejectionEvent) => {
        console.error('[GLOBAL unhandledrejection]', event.reason);
      };
      window.addEventListener('error', onError);
      window.addEventListener('unhandledrejection', onUnhandledRejection);
      return () => {
        window.removeEventListener('error', onError);
        window.removeEventListener('unhandledrejection', onUnhandledRejection);
      };
    }
    return;
  }, []);

  const {
    isLoggedIn,
    _hasHydrated,
  } = useAuthStore();

  const { hasCompletedOnboarding, _hasHydratedOnboarding } = useOnboardingStore();
  // https://zustand.docs.pmnd.rs/integrations/persisting-store-data#how-can-i-check-if-my-store-has-been-hydrated
  // Hide the splash screen after both stores have been hydrated AND fonts are loaded (or timed out)
  useEffect(() => {
    // Hide the splash screen once stores and fonts are ready (or timed out)
    if (_hasHydrated && _hasHydratedOnboarding && (fontsLoaded || fontLoadingTimedOut)) {
      SplashScreen.hideAsync();
    }
  }, [_hasHydrated, _hasHydratedOnboarding, fontsLoaded, fontLoadingTimedOut]);

  // You'll need to update your root layout to handle hydration properly
  // Add this to prevent infinite re-renders:
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Set a timeout to ensure hydration completes
    const timer = setTimeout(() => setIsHydrated(true), 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!isHydrated) {
    // Showing loading screen while hydration completes
    return <Loading />;
  }

  if ((!_hasHydrated || !_hasHydratedOnboarding || (!fontsLoaded && !fontLoadingTimedOut)) && !isWeb) {
    return null;
  }

  // Skip onboarding on web platform
  const shouldShowOnboarding = (Platform.OS !== 'web' && !hasCompletedOnboarding) || (isLoggedIn && !hasCompletedOnboarding);
  // Minimal checks logged only in dev (noisy logs removed)
  return (
    <SafeAreaProvider
      // Make sure provider has full height and avoids SSR mismatch
      style={{ flex: 1 }}
      initialMetrics={Platform.OS === 'web' ? initialWindowMetrics ?? undefined : undefined}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Protected guard={shouldShowOnboarding}>
            <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={!shouldShowOnboarding}>
            <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
            <Stack.Screen 
              name="eventDisclaimer" 
              options={{ 
                presentation: 'modal',
                headerTitle: '',
                headerTransparent: true,
                headerStyle: { backgroundColor: 'transparent' },
              }} 
            />
            <Stack.Screen 
              name="appInfo" 
              options={{ 
                presentation: 'modal',
                headerTitle: '',
                headerTransparent: true,
                headerStyle: { backgroundColor: 'transparent' },
              }} 
            />
            
            <Stack.Protected guard={!isLoggedIn}>
              <Stack.Screen name="sign-in" options={{ headerShown: false }} />
              <Stack.Screen name="sign-up" options={{ headerShown: false }} />
            </Stack.Protected>
              <Stack.Screen 
                name="(profile)" 
                options={{ 
                // presentation: 'modal',
                headerTitle: '',
                headerTransparent: true,
                headerStyle: { backgroundColor: 'transparent' },
              }} 
              />
          </Stack.Protected>
        </Stack>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}
