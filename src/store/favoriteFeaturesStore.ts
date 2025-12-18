import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import { universalStorage } from '@/src/utils/platformStorage';
import { useAuthStore } from './authStore';
import { buildApiUrl, buildApiUrlNoTrailingSlash, API_BASE_URL } from '@/src/utils/apiConfig';

interface FavoriteFeaturesState {
  favorites: Record<string, true>;
  favoriteTitles: Record<string, string>;
  pendingAdds: string[];
  pendingRemoves: string[];
  isSyncing: boolean;
  _hasHydrated: boolean;
  initialize: () => Promise<void>;
  allFavorites: () => string[];
  isFavorite: (key: string) => boolean;
  getFavoriteTitle: (key: string) => string | undefined;
  toggleFavorite: (key: string, title?: string) => Promise<void>;
  syncPending: () => Promise<void>;
  resetSyncing: () => void;
}

const createStorage = () => {
  // For web, always use localStorage directly (handles SSR/static export)
  if (Platform.OS === 'web') {
    return {
      getItem: (name: string) => {
        try { 
          if (typeof window === 'undefined') return null;
          return localStorage.getItem(name); 
        } catch { 
          return null; 
        }
      },
      setItem: (name: string, value: string) => { 
        try { 
          if (typeof window === 'undefined') return;
          localStorage.setItem(name, value); 
        } catch {} 
      },
      removeItem: (name: string) => { 
        try { 
          if (typeof window === 'undefined') return;
          localStorage.removeItem(name); 
        } catch {} 
      },
    };
  }
  // For native, use AsyncStorage directly (not through universalStorage)
  return {
    getItem: async (name: string) => {
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        return await AsyncStorage.default.getItem(name);
      } catch {
        return null;
      }
    },
    setItem: async (name: string, value: string) => {
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.setItem(name, value);
      } catch {}
    },
    removeItem: async (name: string) => {
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage');
        await AsyncStorage.default.removeItem(name);
      } catch {}
    },
  };
};

// Storage key prefix constants are reserved for future per-user persist strategies

async function getValidAccessToken() {
  try {
    // Try to get session from auth store first (faster)
    const authSession = useAuthStore.getState().session;
    if (authSession?.access_token) {
      return authSession.access_token;
    }
    
    // Fallback to Supabase if auth store doesn't have it
    const { supabase } = await import('@/src/utils/supabaseClient');
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) { console.error('[favoritesStore] supabase.getSession error', error); }
    return session?.access_token;
  } catch (err) {
    console.error('[favoritesStore] getValidAccessToken error', err);
    return undefined;
  }
}

export const useFavoriteFeaturesStore = create<FavoriteFeaturesState>()(
  persist(
    (set, get) => ({
      favorites: {},
      favoriteTitles: {},
      pendingAdds: [],
      pendingRemoves: [],
      isSyncing: false,
      _hasHydrated: false,

      initialize: async () => {
        console.log('[FAVORITES DEBUG] initialize called, current favorites:', Object.keys(get().favorites));
        const user = useAuthStore.getState().user;
        const uid = user?.id;
        try {
          set({ isSyncing: true });
          if (uid) {
            const token = await getValidAccessToken();
            if (token) {
              const url = buildApiUrl('favorites');
              console.log('[favoritesStore] fetching favorites from', url);
              const res = await fetch(url, {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });
              if (res.ok) {
                const json = await res.json();
                if (json?.data && Array.isArray(json.data)) {
                  const favMap: Record<string, true> = {};
                  const titleMap: Record<string, string> = {};
                  json.data.forEach((r: any) => {
                    // Handle both camelCase (featureKey) and snake_case (feature_key)
                    const key = r.featureKey || r.feature_key;
                    const title = r.featureTitle || r.feature_title;
                    if (key) {
                      favMap[key] = true;
                      if (title) {
                        titleMap[key] = title;
                      }
                    }
                  });
                  set({ favorites: favMap, favoriteTitles: titleMap });
                }
              }
            }
          }
        } catch (err) {
          console.error('[favoritesStore] initialize error:', err);
        } finally {
          set({ isSyncing: false, _hasHydrated: true });
        }
      },

      allFavorites: () => Object.keys(get().favorites),

      isFavorite: (key: string) => !!get().favorites[key],

      getFavoriteTitle: (key: string) => get().favoriteTitles[key],

      toggleFavorite: async (key: string, title?: string) => {
        const isFav = get().isFavorite(key);
        const user = useAuthStore.getState().user;
        const token = await getValidAccessToken();
        if (!user || !token) {
          throw new Error('AUTH_REQUIRED');
        }

        // Optimistically update local state IMMEDIATELY for both add and remove
        if (isFav) {
          // Removing - delete immediately
          set((state) => {
            const favCopy = { ...state.favorites };
            const titleCopy = { ...state.favoriteTitles };
            delete favCopy[key];
            delete titleCopy[key];
            return { favorites: favCopy, favoriteTitles: titleCopy };
          });
        } else {
          // Adding - add immediately
          set((state) => ({
            favorites: { ...state.favorites, [key]: true },
            favoriteTitles: title ? { ...state.favoriteTitles, [key]: title } : state.favoriteTitles,
          }));
        }
        
        set({ isSyncing: true });

        try {
            const url = buildApiUrl('favorites');
          if (!isFav) {
            const res = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ featureKey: key, featureTitle: title }),
            });
            if (!res.ok) {
              // revert on failure
              set((state) => {
                const favCopy = { ...state.favorites };
                const titleCopy = { ...state.favoriteTitles };
                delete favCopy[key];
                delete titleCopy[key];
                return { favorites: favCopy, favoriteTitles: titleCopy };
              });
            } else {
              try {
                const json = await res.json();
                const addedKey = json?.data?.feature_key;
                const addedTitle = json?.data?.feature_title;
                if (addedKey) {
                  set((state) => ({
                    favorites: { ...state.favorites, [addedKey]: true },
                    favoriteTitles: addedTitle ? { ...state.favoriteTitles, [addedKey]: addedTitle } : state.favoriteTitles,
                  }));
                }
              } catch {
                // no-op; keep optimistic
              }
            }
          } else {
            const delUrl = buildApiUrlNoTrailingSlash(`favorites/${encodeURIComponent(key)}`);
            const res = await fetch(delUrl, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
              // If the server returned 404 (not found), treat as success - already deleted
              if (res.status === 404) {
                // optimistic delete already done, no-op
              } else {
                // revert on other failures
                set((state) => ({
                  favorites: { ...state.favorites, [key]: true },
                  favoriteTitles: title ? { ...state.favoriteTitles, [key]: title } : state.favoriteTitles,
                }));
              }
            }
            // On success, optimistic delete already applied, no-op
          }
        } catch (err) {
          console.error('[favoritesStore] toggleFavorite error:', err);
          // revert optimistic update
          set((state) => {
            const favCopy = { ...state.favorites };
            const titleCopy = { ...state.favoriteTitles };
            if (isFav) {
              favCopy[key] = true;
              if (title) titleCopy[key] = title;
            } else {
              delete favCopy[key];
              delete titleCopy[key];
            }
            return { favorites: favCopy, favoriteTitles: titleCopy };
          });
        } finally {
          set({ isSyncing: false });
        }
      },

      syncPending: async () => { /* Basic implementation omitted for now */ },

      resetSyncing: () => {
        set({ isSyncing: false });
      },
    }),
    {
      name: 'favorite-features',
      storage: createJSONStorage(() => createStorage() as any),
    }
  )
);

export default useFavoriteFeaturesStore;
