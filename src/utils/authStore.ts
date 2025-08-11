import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

type UserState = {
  isLoggedIn: boolean;
  shouldCreateAccount: boolean;
  hasCompletedOnboarding: boolean;
  isVip: boolean;
  _hasHydrated: boolean;
  logIn: () => void;
  logOut: () => void;
  logInAsVip: () => void;
  setHasCompletedOnboarding: (value: boolean) => void;
  setHasHydrated: (value: boolean) => void;
};

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


export const useAuthStore = create(
  persist<UserState>(
    (set) => ({
      isLoggedIn: false,
      shouldCreateAccount: true,
      isVip: false,
      hasCompletedOnboarding: false,
      _hasHydrated: false,
      logIn: () => {
        set((state) => {
          console.log("Logging in user");
          console.log(`User logged in successfully. Logged in state: ${JSON.stringify(state)}`);
          return {
            ...state,
            isLoggedIn: true,
          };
        });
      },
      logInAsVip: () => {
        set((state) => {
          return {
            ...state,
            isVip: true,
            isLoggedIn: true,
          };
        });
      },
      logOut: () => {
        set((state) => {
          return {
            ...state,
            isVip: false,
            isLoggedIn: false,
          };
        });
      },
      setHasCompletedOnboarding: (value: boolean) => {
        set((state) => {
          return {
            ...state,
            hasCompletedOnboarding: value,
          };
        });
      },
      setHasHydrated: (value: boolean) => {
        set((state) => {
          return {
            ...state,
            _hasHydrated: value,
          };
        });
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() =>
        Platform.OS === "web" ? webFallbackStorage : secureStorage,
      ),
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    },
  ),
);