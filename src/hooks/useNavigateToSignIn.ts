import { useRouter, usePathname, useSegments } from 'expo-router';
import { useCallback } from 'react';
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
      console.log('📍 Storing return URL:', currentPath);
      setReturnUrl(currentPath);
    } else {
      console.log('📍 Not storing return URL for:', currentPath);
    }
    
    router.push('/sign-in' as any);
  }, [pathname, segments, setReturnUrl, router]);

  return navigateToSignIn;
}
