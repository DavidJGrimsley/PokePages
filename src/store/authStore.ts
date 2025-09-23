import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { supabase } from "../utils/supabaseClient";
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

// Function to fetch user profile data
const fetchUserProfile = async (userId: string) => {
  try {
    console.log('fetchUserProfile: Starting fetch for userId:', userId);
    console.log('fetchUserProfile: Supabase client exists:', !!supabase);
    
    // First, let's test if Supabase is working at all
    console.log('fetchUserProfile: Testing basic Supabase connection...');
    try {
      const { data: testData, error: testError } = await supabase.from('profiles').select('id').limit(1);
      console.log('fetchUserProfile: Basic connection test - data:', testData, 'error:', testError);
    } catch (testErr) {
      console.error('fetchUserProfile: Basic connection failed:', testErr);
    }
    
    console.log('fetchUserProfile: About to execute main query...');
    const { data, error } = await supabase
      .from('profiles')
      .select('username, birthdate, bio, avatar_url')
      .eq('id', userId)
      .single();
    
    console.log('fetchUserProfile: Supabase response - data:', data, 'error:', error);
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('fetchUserProfile: Non-404 error occurred:', error);
      return null;
    }
    
    if (error && error.code === 'PGRST116') {
      console.log('fetchUserProfile: No profile found (404), returning null');
      return null;
    }
    
    console.log('fetchUserProfile: Successfully fetched profile:', data);
    return data;
  } catch (error) {
    console.error('fetchUserProfile: Failed to fetch user profile:', error);
    return null;
  }
};

// Helper function to calculate if user is adult (18+) based on birthdate
const calculateIsAdult = (birthdate: string | null): boolean => {
  if (!birthdate) return false; // If no birthdate provided, assume not adult for safety
  
  try {
    const birth = new Date(birthdate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Check if birthday has passed this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 18;
    }
    return age >= 18;
  } catch (error) {
    console.error('Error calculating age from birthdate:', error);
    return false; // Default to not adult if there's an error
  }
};

// Helper function to check if user can access social features (13+)
const canAccessSocial = (birthdate: string | null): boolean => {
  if (!birthdate) return false; // If no birthdate, assume cannot access social for safety
  
  try {
    const birth = new Date(birthdate);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    // Check if birthday has passed this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1 >= 13;
    }
    return age >= 13;
  } catch (error) {
    console.error('Error calculating age for social access:', error);
    return false; // Default to no social access if there's an error
  }
};

// Your existing UserState interface...
type UserState = {
  user: User | null;
  session: Session | null;
  isLoggedIn: boolean;
  shouldShowSocial: boolean;
  shouldCreateAccount: boolean;
  isVip: boolean;
  _hasHydrated: boolean;
  
  // Profile data (fetched from database)
  profile: {
    username: string | null;
    birthdate: string | null;
    bio: string | null;
    avatar_url: string | null;
  } | null;
  
  // Computed properties based on profile data
  isAdult: boolean;
  canUseSocialFeatures: boolean;
  
  // Helper functions
  updateComputedProperties: () => void;
  refreshProfile: () => Promise<void>;
  
  // Supabase authentication methods
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserState['profile']) => void;
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
      shouldShowSocial: false,
      shouldCreateAccount: true,
      isVip: false,
      _hasHydrated: false,
      
      // Profile data
      profile: null,
      
      // Computed properties (calculated dynamically)
      isAdult: false,
      canUseSocialFeatures: false,
      
      // Helper to update computed properties
      updateComputedProperties: () => {
        const state = get();
        const birthdate = state.profile?.birthdate || null;
        set((state) => ({
          ...state,
          isAdult: calculateIsAdult(birthdate),
          canUseSocialFeatures: canAccessSocial(birthdate),
        }));
      },
      
      // Refresh profile data from database
      refreshProfile: async () => {
        const state = get();
        if (!state.user?.id) return;
        
        console.log('Refreshing profile for user:', state.user.id);
        const profileData = await fetchUserProfile(state.user.id);
        console.log('Refreshed profile data:', profileData);
        set((state) => ({
          ...state,
          profile: profileData,
        }));
        get().updateComputedProperties();
      },
      
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
            
            // Fetch and set profile data
            const profileData = await fetchUserProfile(data.user.id);
            set((state) => ({
              ...state,
              profile: profileData,
            }));
            
            // Update computed properties
            get().updateComputedProperties();
            
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
            
            // Fetch and set profile data
            const profileData = await fetchUserProfile(data.user.id);
            set((state) => ({
              ...state,
              profile: profileData,
            }));
            
            // Update computed properties
            get().updateComputedProperties();
            
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
            profile: null, // Clear profile data on sign out
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
      
      setProfile: (profile: UserState['profile']) => {
        set((state) => ({
          ...state,
          profile,
        }));
        get().updateComputedProperties();
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
        profile: state.profile, // Include profile data in persistence
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

// Check for existing session on app start
setTimeout(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    console.log('Found existing session on startup for:', session.user.email);
    const { setUser, setSession, setProfile } = useAuthStore.getState();
    setSession(session);
    setUser(session.user);
    
    // Fetch profile data for existing session
    const profileData = await fetchUserProfile(session.user.id);
    console.log('Startup profile data:', profileData);
    setProfile(profileData);
  }
}, 100);

// Set up auth state listener
supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
  console.log('Auth state changed:', event, session?.user?.email);
  const { setUser, setSession, setProfile } = useAuthStore.getState();
  setSession(session);
  setUser(session?.user ?? null);
  
  // Handle profile fetching for sign-in events and session restoration
  if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
    console.log('Auth state handler: Fetching profile for user:', session.user.id);
    const profileData = await fetchUserProfile(session.user.id);
    console.log('Auth state handler: Profile data fetched:', profileData);
    setProfile(profileData);
    
    // Only migrate on actual sign-in, not token refresh
    if (event === 'SIGNED_IN') {
      await migrateAnonymousData(session.user.id);
    }
  } else if (event === 'SIGNED_OUT') {
    console.log('Auth state handler: Clearing profile on sign out');
    setProfile(null); // Clear profile on sign out
  }
});

// Selector hooks for easier access to computed properties
export const useUserWithProfile = () => {
  return useAuthStore((state) => ({
    user: state.user,
    profile: state.profile,
    isLoggedIn: state.isLoggedIn,
    isAdult: state.isAdult,
    canUseSocialFeatures: state.canUseSocialFeatures,
    isVip: state.isVip,
  }));
};

export const useCanUseSocial = () => {
  return useAuthStore((state) => state.canUseSocialFeatures);
};

export const useIsAdult = () => {
  return useAuthStore((state) => state.isAdult);
};

export const useUserProfile = () => {
  return useAuthStore((state) => ({
    profile: state.profile,
    isAdult: state.isAdult,
    canUseSocialFeatures: state.canUseSocialFeatures,
  }));
};