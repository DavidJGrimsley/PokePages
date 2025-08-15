import * as SecureStore from "expo-secure-store";
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';

type OnboardingState = {
  hasCompletedOnboarding: boolean;
  hasAcceptedTerms: boolean;
  hasAcceptedPrivacy: boolean;
  _hasHydratedOnboarding: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  acceptTerms: () => void;
  acceptPrivacy: () => void;
  setHasHydratedOnboarding: (value: boolean) => void;
};

// Check if we're in a web environment
const isWeb = Platform.OS === 'web';

console.log('OnboardingStore - Platform:', Platform.OS, 'isWeb:', isWeb);

// Create storage adapter that works on both native and web
const createStorage = () => {
  if (isWeb) {
    return {
      getItem: (name: string) => {
        try {
          return localStorage.getItem(name);
        } catch {
          return null;
        }
      },
      setItem: (name: string, value: string) => {
        try {
          localStorage.setItem(name, value);
        } catch {
          // Silently fail
        }
      },
      removeItem: (name: string) => {
        try {
          localStorage.removeItem(name);
        } catch {
          // Silently fail
        }
      },
    };
  } else {
    return {
      setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
      getItem: (key: string) => SecureStore.getItemAsync(key),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    };
  }
};

export const useOnboardingStore = create(
  persist<OnboardingState>(
    (set, get) => ({
      hasCompletedOnboarding: false,
      hasAcceptedTerms: false,
      hasAcceptedPrivacy: false,
      _hasHydratedOnboarding: false,
      completeOnboarding: () => {
        console.log('Completing onboarding...');
        set((state) => ({
          ...state,
          hasCompletedOnboarding: true,
        }));
        console.log('hasCompletedOnboarding:', get().hasCompletedOnboarding);
      },
      resetOnboarding: () => {
        console.log('Resetting onboarding...');
        set((state) => ({
          ...state,
          hasCompletedOnboarding: false,
          hasAcceptedTerms: false,
          hasAcceptedPrivacy: false,
        }));
      },
      acceptTerms: () => {
        console.log('Accepting terms...');
        set((state) => ({
          ...state,
          hasAcceptedTerms: true,
        }));
      },
      acceptPrivacy: () => {
        console.log('Accepting privacy...');
        set((state) => ({
          ...state,
          hasAcceptedPrivacy: true,
        }));
      },
      setHasHydratedOnboarding: (value: boolean) => {
        console.log('Setting _hasHydratedOnboarding to:', value);
        set((state) => ({
          ...state,
          _hasHydratedOnboarding: value,
        }));
      },
    }),
    {
      name: 'onboarding-store',
      storage: createJSONStorage(() => createStorage()),
      onRehydrateStorage: () => {
        console.log('OnRehydrateStorage callback called');
        return (state, error) => {
          console.log('Onboarding store rehydrated with state:', state, 'error:', error);
          if (error) {
            console.error('Onboarding store rehydration error:', error);
          }
          // Only call setHasHydratedOnboarding if state exists and the method is available
          if (state && typeof state.setHasHydratedOnboarding === 'function') {
            state.setHasHydratedOnboarding(true);
          }
        };
      },
    }
  )
);

// Only run the fallback timeout on client-side (not during static rendering)
if (typeof window !== 'undefined') {
  setTimeout(() => {
    try {
      console.log('Fallback: Setting hydrated to true after timeout');
      useOnboardingStore.getState().setHasHydratedOnboarding(true);
    } catch (error) {
      console.warn('Failed to set fallback hydration:', error);
    }
  }, 500);
}
