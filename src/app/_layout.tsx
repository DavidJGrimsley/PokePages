import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack, SplashScreen } from 'expo-router';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
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

import { useAuthStore } from '~/utils/authStore';
import { useOnboardingStore } from '~/utils/onboardingStore';
import { HeaderTitle, styles } from '~/components/HeaderComponents';

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

  const {
    isLoggedIn,
    shouldCreateAccount,
    _hasHydrated,
  } = useAuthStore();

  const { hasCompletedOnboarding, _hasHydratedOnboarding } = useOnboardingStore();

  // https://zustand.docs.pmnd.rs/integrations/persisting-store-data#how-can-i-check-if-my-store-has-been-hydrated
  // Hide the splash screen after both stores have been hydrated AND fonts are loaded
  useEffect(() => {
    if (_hasHydrated && _hasHydratedOnboarding && fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [_hasHydrated, _hasHydratedOnboarding, fontsLoaded]);

  if ((!_hasHydrated || !_hasHydratedOnboarding || !fontsLoaded) && !isWeb) {
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
          <Stack.Screen 
            name="eventDisclaimer" 
            options={{ 
              headerTitle: () => <HeaderTitle title="Event Disclaimer" />,
              presentation: 'modal',
              headerStyle: styles.headerStyle,
            }} 
          />
          <Stack.Screen 
            name="appInfo" 
            options={{ 
              headerTitle: () => <HeaderTitle title="App Information" />,
              presentation: 'modal',
              headerStyle: styles.headerStyle,
            }} 
          />
          <Stack.Screen 
            name="resourcesInfo" 
            options={{ 
              headerTitle: () => <HeaderTitle title="Resources Info" />,
              presentation: 'modal',
              headerStyle: styles.headerStyle,
            }} 
          />
          <Stack.Protected guard={!isLoggedIn}>
            <Stack.Screen name="sign-in" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={isLoggedIn}>
            <Stack.Screen 
              name="editProfile" 
              options={{ 
                headerTitle: () => <HeaderTitle title="Edit Profile" />,
                presentation: 'modal',
                headerStyle: styles.headerStyle,
              }} 
            />
          </Stack.Protected>
        </Stack.Protected>
      </Stack>
    </GestureHandlerRootView>
  );
}
