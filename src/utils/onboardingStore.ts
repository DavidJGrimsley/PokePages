import * as SecureStore from "expo-secure-store";
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';

type OnboardingState = {
  hasCompletedOnboarding: boolean;
  hasAcceptedTerms: boolean;
  hasAcceptedPrivacy: boolean;
  _hasHydrated: boolean;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  acceptTerms: () => void;
  acceptPrivacy: () => void;
  setHasHydrated: (value: boolean) => void;
};

// Check if we're in a web environment
const isWeb = Platform.OS === 'web';

console.log('OnboardingStore - Platform:', Platform.OS, 'isWeb:', isWeb);

// Create storage adapter that works on both native and web (like authStore)
const secureStorage = {
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  getItem: (key: string) => SecureStore.getItemAsync(key),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

const webFallbackStorage = {
  setItem: (key: string, value: string) => {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  getItem: (key: string) => Promise.resolve(localStorage.getItem(key)),
  removeItem: (key: string) => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

export const useOnboardingStore = create(
  persist<OnboardingState>(
    (set, get) => ({
      hasCompletedOnboarding: false,
      hasAcceptedTerms: false,
      hasAcceptedPrivacy: false,
      _hasHydrated: false,
      completeOnboarding: () => {
        console.log('Completing onboarding...');
        set((state) => ({
          ...state,
          hasCompletedOnboarding: true,
        }));
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
      setHasHydrated: (value: boolean) => {
        console.log('Setting _hasHydrated to:', value);
        set((state) => ({
          ...state,
          _hasHydrated: value,
        }));
      },
    }),
    {
      name: 'onboarding-store',
      storage: createJSONStorage(() =>
        Platform.OS === "web" ? webFallbackStorage : secureStorage
      ),
      onRehydrateStorage: () => {
        console.log('OnRehydrateStorage callback called');
        return (state, error) => {
          console.log('Onboarding store rehydrated with state:', state, 'error:', error);
          const store = useOnboardingStore.getState();
          store.setHasHydrated(true);
        };
      },
    }
  )
);

// Set hydrated to true after store creation with a delay
setTimeout(() => {
  console.log('Fallback: Setting hydrated to true after timeout');
  useOnboardingStore.getState().setHasHydrated(true);
}, 500);
