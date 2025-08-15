import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { supabase } from "./supabaseClient";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";

// Cross-platform storage functions
const getStorageItem = async (key: string): Promise<string | null> => {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await AsyncStorage.getItem(key);
    }
  } catch (error) {
    console.error('Error getting storage item:', error);
    return null;
  }
};

const removeStorageItem = async (key: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await AsyncStorage.removeItem(key);
    }
  } catch (error) {
    console.error('Error removing storage item:', error);
  }
};

// Function to migrate anonymous data when user signs up/in
const migrateAnonymousData = async (userId: string) => {
  try {
    console.log('Starting anonymous data migration for user:', userId);
    
    // Get all anonymous IDs from storage for different events
    const eventKeys = ['wo-chien', 'chien-pao', 'ting-lu', 'chi-yu']; // Add your event keys
    const anonymousIds: string[] = [];
    
    for (const eventKey of eventKeys) {
      const storageKey = `anonymous_id_${eventKey}`;
      const anonId = await getStorageItem(storageKey);
      if (anonId && !anonymousIds.includes(anonId)) {
        anonymousIds.push(anonId);
      }
    }
    
    console.log('Found anonymous IDs:', anonymousIds);
    
    // Migrate each anonymous ID
    for (const anonId of anonymousIds) {
      try {
        const { error } = await supabase.rpc('migrate_anonymous_to_user', {
          p_user_id: userId,
          p_anonymous_id: anonId
        });
        
        if (error) {
          console.error('Migration error for', anonId, ':', error);
        } else {
          console.log('Successfully migrated anonymous ID:', anonId);
          
          // Clean up storage keys for this anonymous ID
          for (const eventKey of eventKeys) {
            const storageKey = `anonymous_id_${eventKey}`;
            const storedId = await getStorageItem(storageKey);
            if (storedId === anonId) {
              await removeStorageItem(storageKey);
            }
          }
        }
      } catch (migrationError) {
        console.error('Failed to migrate anonymous ID', anonId, ':', migrationError);
      }
    }
    
    console.log('Anonymous data migration completed');
  } catch (error) {
    console.error('Failed to migrate anonymous data:', error);
  }
};

// Your existing UserState interface...
type UserState = {
  user: User | null;
  session: Session | null;
  isLoggedIn: boolean;
  shouldCreateAccount: boolean;
  isVip: boolean;
  _hasHydrated: boolean;
  
  // Supabase authentication methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  logIn: () => void;
  logInAsVip: () => void;
  logOut: () => void;
  setHasHydrated: (value: boolean) => void;
};

const isWeb = Platform.OS === "web";

// Create storage adapter that works better on web
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
      setItem: (key: string, value: string) =>
        SecureStore.setItemAsync(key, value),
      getItem: (key: string) => SecureStore.getItemAsync(key),
      removeItem: (key: string) => SecureStore.deleteItemAsync(key),
    };
  }
};

export const useAuthStore = create(
  persist<UserState>(
    (set, get) => ({
      user: null,
      session: null,
      isLoggedIn: false,
      shouldCreateAccount: true,
      isVip: false,
      _hasHydrated: false,
      
      // Supabase authentication methods
      signIn: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) {
            throw error;
          }
          
          if (data.user && data.session) {
            set((state) => ({
              ...state,
              user: data.user,
              session: data.session,
              isLoggedIn: true,
              shouldCreateAccount: false,
            }));
            
            // Migrate anonymous data after successful sign in
            await migrateAnonymousData(data.user.id);
          }
        } catch (error) {
          console.error("Error signing in:", error);
          throw error;
        }
      },
      
      signUp: async (email: string, password: string) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (error) {
            throw error;
          }
          
          if (data.user && data.session) {
            set((state) => ({
              ...state,
              user: data.user,
              session: data.session,
              isLoggedIn: true,
              shouldCreateAccount: false,
            }));
            
            // Migrate anonymous data after successful sign up
            await migrateAnonymousData(data.user.id);
          }
        } catch (error) {
          console.error("Error signing up:", error);
          throw error;
        }
      },
      
      signOut: async () => {
        try {
          const { error } = await supabase.auth.signOut();
          if (error) {
            throw error;
          }
          
          set((state) => ({
            ...state,
            user: null,
            session: null,
            isLoggedIn: false,
            isVip: false,
          }));
        } catch (error) {
          console.error("Error signing out:", error);
          throw error;
        }
      },
      
      setUser: (user: User | null) => {
        set((state) => ({
          ...state,
          user,
          isLoggedIn: !!user,
        }));
      },
      
      setSession: (session: Session | null) => {
        set((state) => ({
          ...state,
          session,
        }));
      },
      
      setHasHydrated: (value: boolean) => {
        set((state) => ({ ...state, _hasHydrated: value }));
      },
      
      // DEPRECATED: Dev-only methods - use signIn/signUp/signOut for real auth
      logIn: () => {
        set((state) => ({ ...state, isLoggedIn: true }));
      },
      
      logInAsVip: () => {
        set((state) => ({ ...state, isLoggedIn: true, isVip: true }));
      },
      
      logOut: () => {
        set((state) => ({ ...state, isLoggedIn: false, isVip: false }));
      },
    }),
    {
      name: "auth-store",
      storage: createJSONStorage(() => createStorage()),
      onRehydrateStorage: () => {
        return (state, error) => {
          if (error) {
            console.error('Auth store rehydration error:', error);
          }
          state?.setHasHydrated(true);
        };
      },
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        shouldCreateAccount: state.shouldCreateAccount,
        isVip: state.isVip,
        _hasHydrated: state._hasHydrated,
        // Exclude session to avoid size limits - it will be restored from Supabase
      }) as UserState,
    },
  ),
);

// Set hydrated to true after timeout as fallback
setTimeout(() => {
  const state = useAuthStore.getState();
  if (!state._hasHydrated) {
    console.log('Auth store: Setting hydrated to true after timeout');
    state.setHasHydrated(true);
  }
}, 500);

// Set up auth state listener
supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
  console.log('Auth state changed:', event, session?.user?.email);
  const { setUser, setSession } = useAuthStore.getState();
  setSession(session);
  setUser(session?.user ?? null);
  
  // Handle migration for token refresh or other auth events
  if (event === 'SIGNED_IN' && session?.user) {
    await migrateAnonymousData(session.user.id);
  }
});