import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import { universalStorage } from '@/src/utils/platformStorage';
import { useAuthStore } from './authStore';
import { buildApiUrl, buildApiUrlNoTrailingSlash, API_BASE_URL } from '@/src/utils/apiConfig';

interface FavoriteFeaturesState {
  favorites: Record<string, true>;
  pendingAdds: string[];
  pendingRemoves: string[];
  isSyncing: boolean;
  _hasHydrated: boolean;
  initialize: () => Promise<void>;
  allFavorites: () => string[];
  isFavorite: (key: string) => boolean;
  toggleFavorite: (key: string, title?: string) => Promise<void>;
  syncPending: () => Promise<void>;
  resetSyncing: () => void;
}

const createStorage = () => {
  const isWeb = Platform.OS === 'web' && typeof window !== 'undefined';
  if (isWeb) {
    return {
      getItem: (name: string) => {
        try { return localStorage.getItem(name); } catch { return null; }
      },
      setItem: (name: string, value: string) => { try { localStorage.setItem(name, value); } catch {} },
      removeItem: (name: string) => { try { localStorage.removeItem(name); } catch {} },
    };
  }
  return {
    getItem: async (name: string) => await universalStorage.getItem(name),
    setItem: async (name: string, value: string) => await universalStorage.setItem(name, value),
    removeItem: async (name: string) => await universalStorage.removeItem(name),
  };
};

// Storage key prefix constants are reserved for future per-user persist strategies

async function getValidAccessToken() {
  try {
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
      pendingAdds: [],
      pendingRemoves: [],
      isSyncing: false,
      _hasHydrated: false,

      initialize: async () => {
        const user = useAuthStore.getState().user;
        const uid = user?.id;
        console.log('[favoritesStore] initialize START', { uid, hasUser: !!user });
        try {
          set({ isSyncing: true });
          console.log('[favoritesStore] set isSyncing=true');
          // Already persisted by zustand middleware - but fetch from server if logged in
          if (uid) {
            const token = await getValidAccessToken();
            console.log('[favoritesStore] got token:', !!token);
            if (token) {
              const url = buildApiUrl('favorites');
              console.log('[favoritesStore] fetching from:', url);
              const res = await fetch(url, {
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              });
              console.log('[favoritesStore] fetch response status:', res.status);
              if (res.ok) {
                const json = await res.json();
                console.log('[favoritesStore] fetch response data:', json);
                if (json?.data && Array.isArray(json.data)) {
                  const favMap: Record<string, true> = {};
                  json.data.forEach((r: any) => favMap[r.feature_key] = true);
                  set({ favorites: favMap });
                }
              }
            }
          }
        } catch (err) {
          console.error('[favoritesStore] initialize error:', err);
        } finally {
          console.log('[favoritesStore] initialize FINALLY - setting isSyncing=false');
          set({ isSyncing: false, _hasHydrated: true });
        }
      },

      allFavorites: () => Object.keys(get().favorites),

      isFavorite: (key: string) => !!get().favorites[key],

      toggleFavorite: async (key: string, title?: string) => {
        console.log('[favoritesStore] toggleFavorite START', { key, title });
        const isFav = get().isFavorite(key);
        const user = useAuthStore.getState().user;
        const token = await getValidAccessToken();
        console.log('[favoritesStore] toggleFavorite auth check', { hasUser: !!user, hasToken: !!token, isFav });
        if (!user || !token) {
          // Caller (UI) should handle prompting login
          throw new Error('AUTH_REQUIRED');
        }

        // Optimistically update local state
        set((state) => ({
          favorites: {
            ...state.favorites,
            ...(isFav ? {} : { [key]: true }),
          },
        }));
        console.log('[favoritesStore] setting isSyncing=true');
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
                const copy = { ...state.favorites };
                delete copy[key];
                return { favorites: copy };
              });
            } else {
              try {
                const json = await res.json();
                const addedKey = json?.data?.feature_key;
                if (!addedKey) {
                  // fallback: ensure our optimistic state still applies
                  set((state) => ({ favorites: { ...state.favorites, [key]: true } }));
                } else {
                  set((state) => ({ favorites: { ...state.favorites, [addedKey]: true } }));
                }
              } catch (err) {
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
              // If the server returned 404 (not found), treat as success
              if (res.status === 404) {
                set((state) => {
                  const copy = { ...state.favorites };
                  delete copy[key];
                  return { favorites: copy };
                });
              } else {
                // revert on other failures
                set((state) => ({ favorites: { ...state.favorites, [key]: true } }));
              }
            } else {
              set((state) => {
                const copy = { ...state.favorites };
                delete copy[key];
                return { favorites: copy };
              });
            }
          }
        } catch (err) {
          console.error('[favoritesStore] toggleFavorite error:', err);
          // revert optimistic update
          set((state) => {
            const copy = { ...state.favorites };
            if (isFav) copy[key] = true; else delete copy[key];
            return { favorites: copy };
          });
        } finally {
          console.log('[favoritesStore] toggleFavorite FINALLY - setting isSyncing=false');
          set({ isSyncing: false });
        }
      },

      syncPending: async () => { /* Basic implementation omitted for now */ },

      resetSyncing: () => {
        console.log('[favoritesStore] MANUAL resetSyncing called');
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
