import { useRouter, usePathname, useSegments } from 'expo-router';
import { useCallback } from 'react';
import { Platform, Alert } from 'react-native';
import { useOnboardingStore } from '~/store/onboardingStore';

/**
 * Hook to navigate to sign-in while preserving the current location
 * for return after onboarding is completed.
 */
export function useNavigateToSignIn() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();
  const { setReturnUrl } = useOnboardingStore();

  const navigateToSignIn = useCallback(() => {
    // Store the current path so we can return after onboarding
    // Don't store if we're already on sign-in, sign-up, or onboarding pages
    const currentPath = pathname || `/${segments.join('/')}`;
    const shouldStoreReturn = 
      !currentPath.includes('/sign-in') && 
      !currentPath.includes('/sign-up') &&
      !currentPath.includes('(onboarding)') &&
      currentPath !== '/';
    
    if (shouldStoreReturn) {
      setReturnUrl(currentPath);
    }
    
    router.push('/sign-in' as any);
  }, [pathname, segments, setReturnUrl, router]);

  return navigateToSignIn;
}

/**
 * Hook that provides a function to show a sign-in alert and navigate to sign-in
 * Use this when a user tries to access a feature that requires authentication
 */
export function useShowSignInAlert() {
  const navigateToSignIn = useNavigateToSignIn();

  const showAlertAndNavigateToSignIn = useCallback(() => {
    if (Platform.OS === 'web') {
      // Web fallback since Alert.alert doesn't work on web
      const shouldSignIn = window.confirm('You must sign in to use this feature.\n\nWould you like to sign in now?');
      if (shouldSignIn) {
        navigateToSignIn();
      }
    } else {
      Alert.alert(
        'Sign In Required',
        'You must sign in to use this feature.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign In',
            style: 'default',
            onPress: () => navigateToSignIn(),
          },
        ]
      );
    }
  }, [navigateToSignIn]);

  return showAlertAndNavigateToSignIn;
}
