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
    console.log('🔄 Fetching profile for user:', userId);
    console.log('📡 Calling supabase.from("profiles").select()...');
    
    const { data, error } = await supabase
      .from('profiles')
      .select('username, birthdate, bio, avatar_url, social_link')
      .eq('id', userId)
      .single();
    
    console.log('🔎 Supabase response:', {
      hasData: !!data,
      hasError: !!error,
      data: data || null,
      error: error ? { 
        message: error.message, 
        code: error.code,
        details: (error as any).details,
      } : null,
    });
    
    // Convert snake_case from database to camelCase for app
    if (data) {
      console.log('📊 Raw profile data from database:', data);
      const profileData = {
        username: data.username,
        birthdate: data.birthdate,
        bio: data.bio,
        avatarUrl: data.avatar_url, // Convert snake_case to camelCase
        socialLink: data.social_link,
      };
      console.log('📊 Processed profile data:', profileData);
      return profileData;
    }
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Failed to fetch user profile:', error);
      return null;
    }
    
    console.log('⚠️ No profile data found for user:', userId);
    return null;
  } catch (error) {
    console.error('❌ Exception in fetchUserProfile:', error);
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
  _authInitialized: boolean; // Track if auth startup is complete
  
  // Profile data (fetched from database)
  profile: {
    username: string | null;
    birthdate: string | null;
    bio: string | null;
    avatarUrl: string | null;  // camelCase for consistency with app
    socialLink: string | null;
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
      _authInitialized: false,
      
      // Profile data
      profile: null,
      
      // Computed properties (calculated dynamically)
      isAdult: false,
      canUseSocialFeatures: false,
      
      // Helper to update computed properties
      updateComputedProperties: () => {
        const state = get();
        const birthdate = state.profile?.birthdate || null;
        const newIsAdult = calculateIsAdult(birthdate);
        const newCanUseSocial = canAccessSocial(birthdate);
        set((state) => ({
          ...state,
          isAdult: newIsAdult,
          canUseSocialFeatures: newCanUseSocial,
        }));
      },
      
      // Refresh profile data from database
      refreshProfile: async () => {
        const state = get();
        if (!state.user?.id) return;
        
        console.log('Refreshing profile for user:', state.user.id);
        const profileData = await fetchUserProfile(state.user.id);
        console.log('Refreshed profile data:', profileData);
        get().setProfile(profileData);
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
        console.log('🏪 AuthStore: signOut function called')
        
        // Step 1: Try to invalidate server-side session with timeout
        try {
          const signOutWithTimeout = async (timeout = 3000) => {
            return Promise.race([
              supabase.auth.signOut(),
              new Promise((_, reject) =>
                setTimeout(() => reject(new Error('SignOut timeout')), timeout)
              )
            ]);
          };
          
          console.log('📡 Attempting to invalidate server session...');
          await signOutWithTimeout(3000); // 3 second max wait
          console.log('✅ Server session invalidated');
        } catch (error) {
          // Log but don't block - we'll clear local state anyway
          console.warn('⚠️ Supabase signOut issue (timeout or network):', error instanceof Error ? error.message : error);
        }
        
        // Step 2: Clear local storage (Supabase keys + app stores)
        try {
          console.log('🧹 Clearing local storage...');
          if (Platform.OS === 'web') {
            // Clear all Supabase auth keys from localStorage
            const keysToRemove = Object.keys(localStorage).filter(key => 
              key.startsWith('sb-') || key.includes('supabase')
            );
            keysToRemove.forEach(key => localStorage.removeItem(key));
            
            // Clear app stores
            localStorage.removeItem('favorite-features');
            localStorage.removeItem('pokemon-tracker-enhanced');
          } else {
            // Clear from AsyncStorage
            const keys = await AsyncStorage.getAllKeys();
            const supabaseKeys = keys.filter(key => 
              key.startsWith('sb-') || key.includes('supabase')
            );
            await AsyncStorage.multiRemove([
              ...supabaseKeys,
              'favorite-features',
              'pokemon-tracker-enhanced'
            ]);
          }
          console.log('✅ Cleared all persisted data');
        } catch (e) {
          console.warn('⚠️ Failed to clear storage:', e);
        }
        
        // Step 3: Reset app state
        console.log('🔄 Resetting app state...');
        set((state) => ({
          ...state,
          user: null,
          session: null,
          isLoggedIn: false,
          isVip: false,
          profile: null,
        }));
        get().updateComputedProperties();
        console.log('✅ AuthStore: Sign out complete');
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
        console.log('📝 setProfile called with:', profile);
        const emptyProfile = {
          username: null,
          birthdate: null,
          bio: null,
          avatarUrl: null,
          socialLink: null,
        } as const;
        set((state) => {
          const nextProfile = profile
            ? {
                ...(state.profile ?? emptyProfile),
                ...profile,
              }
            : null;
          return {
            ...state,
            profile: nextProfile,
          };
        });
        console.log('📝 Profile set, calling updateComputedProperties');
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
          
          // CRITICAL: Recalculate age-based permissions after rehydration
          if (state?.profile?.birthdate) {
            state?.updateComputedProperties();
          }
        };
      },
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
        shouldCreateAccount: state.shouldCreateAccount,
        isVip: state.isVip,
        _hasHydrated: state._hasHydrated,
        // DO NOT persist _authInitialized - it must always start false
        // and be set to true only after startup initialization completes
        profile: state.profile, // Include profile data in persistence
        // Exclude session to avoid size limits - it will be restored from Supabase
      }) as UserState,
    },
  ),
);

const syncProfileForUser = async (userId: string, reason: string) => {
  console.log(`� SYNC START: Syncing profile for user ${userId} [${reason}]`);
  try {
    const profileData = await fetchUserProfile(userId);
    console.log(`✅ SYNC SUCCESS (${reason}):`, profileData);
    useAuthStore.getState().setProfile(profileData);
    console.log(`✅ SYNC COMPLETE: setProfile called with data`);
  } catch (error: any) {
    console.error(`❌ SYNC FAILED for ${reason}:`, {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
    });
  }
};

/* DISABLED: getSession() hangs on web platform, using onAuthStateChange listener instead
const initializeAuth = async () => {
  console.log('🔁 Starting auth initialization...');
  try {
    console.log('📡 Calling supabase.auth.getSession()...');
    
    // Add timeout to detect hanging calls
    const sessionPromise = supabase.auth.getSession();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('getSession timeout after 5 seconds')), 5000)
    );
    
    const result = await Promise.race([sessionPromise, timeoutPromise]) as any;
    const { data, error } = result;
    
    console.log('📋 getSession result:', {
      hasData: !!data,
      hasSession: !!data?.session,
      sessionUser: data?.session?.user ? {
        id: data.session.user.id,
        email: data.session.user.email,
        phone: data.session.user.phone,
      } : null,
      error: error ? { message: error.message, code: error.code } : null,
    });

    if (error) {
      console.error('❌ Failed to retrieve Supabase session:', error);
      useAuthStore.getState().setProfile(null);
      useAuthStore.setState({ _authInitialized: true });
      return;
    }

    const session = data?.session ?? null;
    console.log('✅ Session extracted:', {
      hasSession: !!session,
      userId: session?.user?.id,
      expiresAt: session?.expires_at,
    });

    const { setUser, setSession } = useAuthStore.getState();

    setSession(session);
    setUser(session?.user ?? null);

    if (session?.user) {
      console.log('✅ Found existing session for:', session.user.email);
      console.log('🔄 About to sync profile for user:', session.user.id);
      try {
        await syncProfileForUser(session.user.id, 'startup getSession');
        console.log('✅ Profile sync completed');
      } catch (syncError: any) {
        console.error('💥 CRITICAL: syncProfileForUser failed:', {
          name: syncError?.name,
          message: syncError?.message,
          stack: syncError?.stack,
        });
      }
    } else {
      console.log('⚠️ No existing Supabase session found (session is null)');
      useAuthStore.getState().setProfile(null);
    }
    
    // Mark initialization complete
    useAuthStore.setState({ _authInitialized: true });
    console.log('✅ Auth initialization complete');
  } catch (err) {
    console.error('💥 Exception during initializeAuth:', err);
    console.error('Error details:', {
      name: (err as Error).name,
      message: (err as Error).message,
      stack: (err as Error).stack,
    });
    useAuthStore.setState({ _authInitialized: true });
  }
};
*/

// Start initialization immediately (don't wait)
// DISABLED: getSession() hangs on web, use onAuthStateChange instead
// initializeAuth().catch(err => {
//   console.error('Auth initialization unhandled error:', err);
//   useAuthStore.setState({ _authInitialized: true });
// });

// Mark as initialized immediately - the listener will handle auth state
useAuthStore.setState({ _authInitialized: true });

// Set up auth state listener
supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
  const { setUser, setSession, setProfile } = useAuthStore.getState();

  setSession(session);
  setUser(session?.user ?? null);

  if (session?.user && (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED')) {
    console.log(`📡 Syncing profile for event: ${event}`);
    await syncProfileForUser(session.user.id, `authStateChange:${event}`);

    if (event === 'SIGNED_IN') {
      await migrateAnonymousData(session.user.id);
    }

    // Dex tracker data is now loaded lazily when user visits the page
    // This improves login performance and only fetches data that's actually needed
  } else if (event === 'SIGNED_OUT') {
    console.log('🏪 Signed out event detected, clearing profile');
    setProfile(null);
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