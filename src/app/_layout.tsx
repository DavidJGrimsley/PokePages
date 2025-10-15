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
import { HeaderTitle } from 'components/UI/HeaderComponents';
import Loading from 'components/Animation/LoadingAnim';

// Add mobile debugging console ONLY in development
if (__DEV__ && Platform.OS === 'web' && typeof window !== 'undefined') {
  // Detect mobile devices
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  
  if (isMobileDevice) {
    // Load Eruda for mobile debugging
  const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/eruda@3.0.1/eruda.js';
    script.onload = () => {
      // @ts-ignore
      if (window.eruda) {
        // @ts-ignore
        window.eruda.init();
      }
    };
    document.head.appendChild(script);
  }
}

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
        console.log('📱 Font loading timed out, proceeding without fonts');
        setFontLoadingTimedOut(true);
      }
    }, 5000);

    return () => clearTimeout(fontTimeout);
  }, [fontsLoaded]);

  const {
    isLoggedIn,
    _hasHydrated,
  } = useAuthStore();

  const { hasCompletedOnboarding, _hasHydratedOnboarding } = useOnboardingStore();

  // https://zustand.docs.pmnd.rs/integrations/persisting-store-data#how-can-i-check-if-my-store-has-been-hydrated
  // Hide the splash screen after both stores have been hydrated AND fonts are loaded (or timed out)
  useEffect(() => {
    console.log('📱 Mobile Debug - Hydration Check:', {
      _hasHydrated,
      _hasHydratedOnboarding,
      fontsLoaded,
      fontLoadingTimedOut,
      platform: Platform.OS,
      userAgent: Platform.OS === 'web' ? navigator.userAgent : 'native'
    });
    
    if (_hasHydrated && _hasHydratedOnboarding && (fontsLoaded || fontLoadingTimedOut)) {
      console.log('✅ All conditions met, hiding splash screen');
      SplashScreen.hideAsync();
    }
  }, [_hasHydrated, _hasHydratedOnboarding, fontsLoaded, fontLoadingTimedOut]);

  // You'll need to update your root layout to handle hydration properly
  // Add this to prevent infinite re-renders:
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Set a timeout to ensure hydration completes
    console.log('📱 Starting hydration timer...');
    const timer = setTimeout(() => {
      console.log('📱 Hydration timer completed, setting isHydrated to true');
      setIsHydrated(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  if (!isHydrated) {
    console.log('📱 Showing loading screen - isHydrated is false');
    const overlayStyleWeb = {
      position: 'absolute' as const,
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: '#E6e6fa',
    };
    const overlayStyleNative = {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      backgroundColor: '#E6e6fa',
    };
    return (
  <View style={Platform.OS === 'web' ? (overlayStyleWeb as any) : overlayStyleNative}>
        {/* <LottieView
          autoPlay={true}
          loop={true}
          style={{ width: 200, height: 200 }}
          source={require('@/assets/lottie/stars.json')}
        /> */}
        <Loading />
      </View>
    );
  }

  if ((!_hasHydrated || !_hasHydratedOnboarding || (!fontsLoaded && !fontLoadingTimedOut)) && !isWeb) {
    return null;
  }

  // Skip onboarding on web platform
  const shouldShowOnboarding = (Platform.OS !== 'web' && !hasCompletedOnboarding) || (isLoggedIn && !hasCompletedOnboarding);
  console.log('📱 Onboarding check:', {
    hasCompletedOnboarding,
    isLoggedIn,
    shouldShowOnboarding,
    platform: Platform.OS,
    isDev: __DEV__
  });
  console.log('Hydration states:', { 
    _hasHydrated, 
    _hasHydratedOnboarding, 
    fontsLoaded, 
    isHydrated 
  });
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
                name="editProfile" 
                options={{ 
                presentation: 'modal',
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
