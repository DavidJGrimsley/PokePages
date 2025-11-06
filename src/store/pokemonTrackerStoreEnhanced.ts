import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import { universalStorage } from '@/src/utils/platformStorage';
import { buildApiUrl, API_BASE_URL } from '@/src/utils/apiConfig';
import { useAuthStore } from '@/src/store/authStore'; // already present
import { RegisteredStatus, FormType } from '@/src/types/tracker';

// (Deprecated) PokemonStatus was merged into RegisteredStatus

interface PokemonTrackerState {
  // Single tracker for ALL Pokemon - no separate tracker types needed
  pokemon: Record<number, RegisteredStatus>;
  
  // Sync state
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  pendingUpdates: { pokemonId: number; form: FormType; value: boolean; timestamp: string }[];
  
  // Actions
  toggleForm: (dex: number, form: FormType) => Promise<void>;
  getFormStatus: (dex: number, form: FormType) => boolean;
  getPokemonStatus: (dex: number) => RegisteredStatus;
  setPokemonData: (data: Record<number, RegisteredStatus>) => void;
  clearAllPokemon: () => void;
  
  // Sync actions
  syncWithDatabase: () => Promise<void>;
  loadFromDatabase: () => Promise<void>;
  setOnlineStatus: (online: boolean) => void;
  processPendingUpdates: () => Promise<void>;
  
  // Stats - Multiple progress trackers
  getPokedexProgress: (pokemonList: {id: number}[]) => {
    obtained: number;
    total: number;
    percentage: number;
  };
  getShinyDexProgress: (pokemonList: {id: number}[]) => {
    obtained: number;
    total: number;
    percentage: number;
  };
  getAlphaDexProgress: (pokemonList: {id: number, canBeAlpha: boolean}[]) => {
    obtained: number;
    total: number;
    percentage: number;
  };
  getShinyAlphaDexProgress: (pokemonList: {id: number, canBeAlpha: boolean}[]) => {
    obtained: number;
    total: number;
    percentage: number;
  };
  getMegaDexProgress: (pokemonList: {id: number, hasMega: boolean}[]) => {
    obtained: number;
    total: number;
    percentage: number;
  };
  getMegaShinyDexProgress: (pokemonList: {id: number, hasMega: boolean}[]) => {
    obtained: number;
    total: number;
    percentage: number;
  };
  getAlphaShinyMegaDexProgress: (pokemonList: {id: number, hasMega: boolean}[]) => {
    obtained: number;
    total: number;
    percentage: number;
  };
  getOverallProgress: (pokemonList: {id: number, canBeAlpha: boolean}[]) => {
    obtainedForms: number;
    totalForms: number;
    percentage: number;
  };
  
  // Hydration
  _hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;
}

const initialState = {
  pokemon: {},
  isOnline: true,
  isSyncing: false,
  lastSyncTime: null,
  pendingUpdates: [],
  _hasHydrated: false,
};

// Check if we're in a web environment and localStorage is available
const isWebWithStorage = () => Platform.OS === 'web' && typeof window !== 'undefined' && typeof localStorage !== 'undefined';

// Create storage adapter that's SSR-safe
const createStorage = () => {
  if (isWebWithStorage()) {
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
  }

  // Native or SSR - use our universal storage with async support or no-op
  if (Platform.OS !== 'web') {
    return {
      getItem: async (name: string) => {
        try {
          return await universalStorage.getItem(name);
        } catch {
          return null;
        }
      },
      setItem: async (name: string, value: string) => {
        try {
          await universalStorage.setItem(name, value);
        } catch {
          // Silently fail
        }
      },
      removeItem: async (name: string) => {
        try {
          await universalStorage.removeItem(name);
        } catch {
          // Silently fail
        }
      },
    };
  }

  // SSR fallback - return no-op storage
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
};

// Helper function to get userId from authStore - NO SUPABASE CALLS!
function getUserId(): string | undefined {
  try {
    const user = useAuthStore.getState().user;
    return user?.id;
  } catch (error) {
    console.error('[DEX TRACKER STORE] Error getting user ID:', error);
    return undefined;
  }
}

// Add: access token + header helpers with session refresh
async function getValidAccessToken(): Promise<string | undefined> {
  try {
    // First try to get the current session which will auto-refresh if needed
    const { supabase } = await import('@/src/utils/supabaseClient');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[TRACKER] Error getting session:', error);
      return undefined;
    }
    
    if (session?.access_token) {
      // Update auth store with fresh session
      const authStore = useAuthStore.getState();
      if (authStore.session?.access_token !== session.access_token) {
        console.log('[TRACKER] Refreshed token detected, updating auth store');
        authStore.setSession(session);
      }
      return session.access_token;
    }
    
    // Fallback to auth store if getSession fails
    const s: any = useAuthStore.getState();
    return (
      s.session?.access_token ||
      s.accessToken ||
      s.token ||
      s.user?.accessToken
    );
  } catch (error) {
    console.error('[TRACKER] Error in getValidAccessToken:', error);
    return undefined;
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const t = await getValidAccessToken();
  if (t) h.Authorization = `Bearer ${t}`;
  return h;
}

export const usePokemonTrackerStore = create<PokemonTrackerState>()(
  
  persist(
    (set, get) => ({
      ...initialState,
      
      // Toggle form with database sync
      toggleForm: async (dex: number, form: FormType) => {
        const currentStatus = get().getPokemonStatus(dex);
        const newValue = !currentStatus[form];
        console.log('[TRACKER] API_BASE_URL from apiConfig:', API_BASE_URL);

        // Debug
        console.log('[TRACKER] toggleForm called', { dex, form, newValue });

        // Update local state immediately (optimistic update)
        const updatedStatus: RegisteredStatus = { ...currentStatus };
        updatedStatus[form] = newValue;

        set((state) => ({
          pokemon: {
            ...state.pokemon,
            [dex]: updatedStatus,
          },
        }));

        // Try to sync with server (Drizzle) if online
        const { isOnline } = get();
        console.log('[TRACKER] Online status before sync attempt:', isOnline);
        if (isOnline) {
          try {
            const userId = getUserId();
            console.log('[TRACKER] sync PUT -> ', buildApiUrl(`legends-za/${dex}`), { userIdPresent: !!userId });
            
            if (!userId) {
              console.log('[TRACKER] No user ID available, cannot sync to server - queuing as pending');
              throw new Error('No user ID - user may not be logged in');
            }

            const headers = await authHeaders(); // await the async function
            const res = await fetch(buildApiUrl(`legends-za/${dex}`), {
              method: 'PUT',
              headers: headers, // include bearer
              body: JSON.stringify({ userId, formType: form, value: newValue }),
            });
            if (!res.ok) {
              const text = await res.text().catch(() => 'no-body');
              throw new Error(`HTTP ${res.status} ${text}`);
            }
            console.log('[TRACKER] sync PUT success', { dex, form, newValue });
            set({ lastSyncTime: new Date().toISOString() });
          } catch (error) {
            console.error('[TRACKER] Failed to sync to database:', error);
            // Add to pending updates for later sync
            set((state) => ({
              pendingUpdates: [
                ...state.pendingUpdates,
                { pokemonId: dex, form, value: newValue, timestamp: new Date().toISOString() }
              ]
            }));
          }
        } else {
          // Add to pending updates when offline
          console.log('[TRACKER] offline - queueing update', { dex, form, newValue });
          set((state) => ({
            pendingUpdates: [
              ...state.pendingUpdates,
              { pokemonId: dex, form, value: newValue, timestamp: new Date().toISOString() }
            ]
          }));
        }
      },

      // Load data from server (Drizzle)
      loadFromDatabase: async () => {
        try {
          console.log('[TRACKER] loadFromDatabase: starting');
          set({ isSyncing: true });
          const userId = getUserId();
          console.log('[TRACKER] loadFromDatabase: userId present?', !!userId);
          if (!userId) {
            console.log('[TRACKER] loadFromDatabase: no userId, aborting');
            set({ isSyncing: false });
            return;
          }

          const url = buildApiUrl(`legends-za?userId=${userId}`);
          console.log('[TRACKER] GET ->', url);
          
          // Add timeout to fetch request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const headers = await authHeaders(); // await the async function
          const res = await fetch(url, {
            headers: headers, // include bearer
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          if (!res.ok) {
            const text = await res.text().catch(() => 'no-body');
            throw new Error(`HTTP ${res.status} ${text}`);
          }
          const json = await res.json();
          console.log('[TRACKER] loadFromDatabase: raw response', json);
          
          // Add validation for the response structure
          if (!json || typeof json !== 'object') {
            throw new Error('Invalid response format: not an object');
          }
          
          if (!json.hasOwnProperty('data')) {
            throw new Error('Invalid response format: missing data property');
          }
          
          const records = json.data;
          console.log('[TRACKER] loadFromDatabase: records type:', typeof records, 'isArray:', Array.isArray(records));
          
          if (!Array.isArray(records)) {
            throw new Error('Invalid response format: data is not an array');
          }
          
          const pokemonData: Record<number, RegisteredStatus> = {};
          
          records.forEach((record: any, index: number) => {
            console.log(`[TRACKER] loadFromDatabase: processing record ${index}:`, record);
            
            // Validate record structure
            if (!record || typeof record !== 'object') {
              console.warn(`[TRACKER] loadFromDatabase: skipping invalid record at index ${index}:`, record);
              return;
            }
            
            // Check for required fields - handle both camelCase and snake_case
            const pokemonId = record.pokemonId ?? record.pokemon_id;
            if (typeof pokemonId !== 'number') {
              console.warn(`[TRACKER] loadFromDatabase: skipping record with invalid pokemonId at index ${index}:`, record);
              return;
            }
            
            // Server should return camelCase via Drizzle, but handle both formats
            pokemonData[pokemonId] = {
              normal: Boolean(record.normal),
              shiny: Boolean(record.shiny),
              alpha: Boolean(record.alpha),
              alphaShiny: Boolean(record.alphaShiny ?? record.alpha_shiny),
            };
          });

          console.log('[TRACKER] loadFromDatabase: loaded records', records.length);
          console.log('[TRACKER] loadFromDatabase: final pokemon data', pokemonData);

          // SAFETY: Merge with local data instead of overwriting
          // Keep any Pokemon that exist locally but not in DB
          const currentPokemon = get().pokemon;
          const mergedPokemon = { ...currentPokemon };
          
          // Only overwrite with DB data if DB has any data for that Pokemon
          Object.entries(pokemonData).forEach(([dexId, status]) => {
            const id = Number(dexId);
            // If DB has ANY true values for this Pokemon, use DB data
            // Otherwise keep local data
            if (status.normal || status.shiny || status.alpha || status.alphaShiny) {
              mergedPokemon[id] = status;
              console.log(`[TRACKER] loadFromDatabase: using DB data for #${id}:`, status);
            } else if (currentPokemon[id]) {
              console.log(`[TRACKER] loadFromDatabase: keeping local data for #${id}:`, currentPokemon[id]);
              // Keep existing local data
            }
          });

          console.log('[TRACKER] loadFromDatabase: merged pokemon data', mergedPokemon);

          set({ 
            pokemon: mergedPokemon,
            lastSyncTime: new Date().toISOString(),
            isSyncing: false 
          });
        } catch (error) {
          console.error('[TRACKER] Failed to load from database:', error);
          if (error instanceof TypeError && error.message === 'Network request failed') {
            console.error('[TRACKER] Network error details:', {
              message: error.message,
              stack: error.stack,
      

               url: buildApiUrl('legends-za'),
              // url: buildApiUrl('legends-za'),
              userAgent: navigator?.userAgent || 'unknown'
            });
          }
          set({ isSyncing: false });
        }
      },

      // Sync local changes to server (Drizzle)
      syncWithDatabase: async () => {
        const { isOnline, isSyncing } = get();
        if (!isOnline || isSyncing) return;

        try {
          console.log('[TRACKER] Full syncWithDatabase: starting');
          set({ isSyncing: true });
          const userId = getUserId();
          console.log('[TRACKER] syncWithDatabase: userId present?', !!userId);
          if (!userId) {
            console.log('[TRACKER] syncWithDatabase: no userId, aborting');
            set({ isSyncing: false });
            return;
          }

          // Process pending updates first
          console.log('[TRACKER] syncWithDatabase: processing pending updates (count=', get().pendingUpdates.length, ')');
          await get().processPendingUpdates();

          // Full sync: compare local data with database
          const localPokemon = get().pokemon;
          const headers = await authHeaders(); // await the async function
          const res = await fetch(buildApiUrl(`legends-za?userId=${userId}`), {
            headers: headers, // include bearer
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          const dbRecords: any[] = json?.data ?? [];
          
          const updates: { pokemonId: number; formData: RegisteredStatus }[] = [];
          
          // Check for local changes that need to be synced
          Object.entries(localPokemon).forEach(([pokemonId, status]) => {
            const id = parseInt(pokemonId);
            const dbRecord = dbRecords.find(r => r.pokemonId === id);
            
            if (!dbRecord || 
                dbRecord.normal !== status.normal ||
                dbRecord.shiny !== status.shiny ||
                dbRecord.alpha !== status.alpha ||
                dbRecord.alphaShiny !== status.alphaShiny) {
              updates.push({
                pokemonId: id,
                formData: {
                  normal: status.normal,
                  shiny: status.shiny,
                  alpha: status.alpha,
                  alphaShiny: status.alphaShiny,
                }
              });
            }
          });

          // Batch update if there are changes
          if (updates.length > 0) {
            console.log('[TRACKER] syncWithDatabase: sending batch updates', updates.length);
            const headers2 = await authHeaders(); // await the async function
            const res2 = await fetch(buildApiUrl('legends-za/batch'), {
               method: 'POST',
               headers: headers2, // include bearer
               body: JSON.stringify({ userId, updates }),
             });
            if (!res2.ok) {
              const text = await res2.text().catch(() => 'no-body');
              throw new Error(`HTTP ${res2.status} ${text}`);
            }
          }

          console.log('[TRACKER] syncWithDatabase: finished');
          set({ 
            lastSyncTime: new Date().toISOString(),
            isSyncing: false 
          });
        } catch (error) {
          console.error('[TRACKER] Failed to sync with database:', error);
          set({ isSyncing: false });
        }
      },

      // Process pending updates via server batch endpoint
      processPendingUpdates: async () => {
        const { pendingUpdates } = get();
        if (pendingUpdates.length === 0) return;

        try {
          console.log('[TRACKER] processPendingUpdates: count=', pendingUpdates.length);
          const userId = getUserId();
          console.log('[TRACKER] processPendingUpdates: userId present?', !!userId);
          if (!userId) return;

          // Consolidate pending updates into final form state per Pokemon
          const map = new Map<number, RegisteredStatus>();
          for (const u of pendingUpdates) {
            const current = map.get(u.pokemonId) ?? { normal: false, shiny: false, alpha: false, alphaShiny: false };
            (current as any)[u.form] = u.value;
            map.set(u.pokemonId, current);
          }

          const updates = Array.from(map.entries()).map(([pokemonId, formData]) => ({ pokemonId, formData }));
          if (updates.length === 0) return;

          console.log('[TRACKER] processPendingUpdates: sending batch of', updates.length);
          const headers = await authHeaders(); // await the async function
          const res = await fetch(buildApiUrl(`legends-za/batch?userId=${userId}`), {
             method: 'POST',
             headers: headers, // include bearer
             body: JSON.stringify({ userId, updates }),
           });
          if (!res.ok) {
            const text = await res.text().catch(() => 'no-body');
            throw new Error(`HTTP ${res.status} ${text}`);
          }

          // Clear pending updates on success
          console.log('[TRACKER] processPendingUpdates: success, clearing pendingUpdates');
          set({ pendingUpdates: [] });
        } catch (error) {
          console.error('[TRACKER] Failed to process pending updates:', error);
        }
      },

      setOnlineStatus: (online: boolean) => {
        set({ isOnline: online });
        if (online) {
          // Auto-sync when coming online
          setTimeout(() => get().syncWithDatabase(), 1000);
        }
      },

      getFormStatus: (dex: number, form: FormType) => {
        const pokemon = get().pokemon[dex];
        return pokemon ? pokemon[form] : false;
      },

      getPokemonStatus: (dex: number) => {
        return get().pokemon[dex] || {
          normal: false,
          shiny: false,
          alpha: false,
          alphaShiny: false,
        };
      },

      setPokemonData: (data: Record<number, RegisteredStatus>) => {
        set({ pokemon: data });
      },

      clearAllPokemon: () => {
        set({ pokemon: {} });
      },

      // Progress calculation functions (unchanged from original)
      getPokedexProgress: (pokemonList) => {
        const pokemon = get().pokemon;
        const obtained = pokemonList.filter(p => {
          const s = pokemon[p.id];
          return !!(s?.normal || s?.shiny || s?.alpha || s?.alphaShiny);
        }).length;
        return {
          obtained,
          total: pokemonList.length,
          percentage: pokemonList.length > 0 ? Math.round((obtained / pokemonList.length) * 100) : 0,
        };
      },

      // Same behavior as the old getPokedexProgress: count normal only
      getNormalDexProgress: (pokemonList) => {
        const pokemon = get().pokemon;
        const obtained = pokemonList.filter(p => pokemon[p.id]?.normal).length;
        return {
          obtained,
          total: pokemonList.length,
          percentage: pokemonList.length > 0 ? Math.round((obtained / pokemonList.length) * 100) : 0,
        };
      },

      getShinyDexProgress: (pokemonList) => {
        const pokemon = get().pokemon;
        const obtained = pokemonList.filter(p => pokemon[p.id]?.shiny).length;
        return {
          obtained,
          total: pokemonList.length,
          percentage: pokemonList.length > 0 ? Math.round((obtained / pokemonList.length) * 100) : 0,
        };
      },

      getAlphaDexProgress: (pokemonList) => {
        const alphaCapable = pokemonList.filter(p => p.canBeAlpha);
        const pokemon = get().pokemon;
        const obtained = alphaCapable.filter(p => pokemon[p.id]?.alpha).length;
        return {
          obtained,
          total: alphaCapable.length,
          percentage: alphaCapable.length > 0 ? Math.round((obtained / alphaCapable.length) * 100) : 0,
        };
      },

      getShinyAlphaDexProgress: (pokemonList) => {
        const alphaCapable = pokemonList.filter(p => p.canBeAlpha);
        const pokemon = get().pokemon;
        const obtained = alphaCapable.filter(p => pokemon[p.id]?.alphaShiny).length;
        return {
          obtained,
          total: alphaCapable.length,
          percentage: alphaCapable.length > 0 ? Math.round((obtained / alphaCapable.length) * 100) : 0,
        };
      },

      getMegaDexProgress: (pokemonList) => {
        const megaCapable = pokemonList.filter(p => p.hasMega);
        const pokemon = get().pokemon;
        const obtained = megaCapable.filter(p => pokemon[p.id]?.normal).length;
        return {
          obtained,
          total: megaCapable.length,
          percentage: megaCapable.length > 0 ? Math.round((obtained / megaCapable.length) * 100) : 0,
        };
      },

      getMegaShinyDexProgress: (pokemonList) => {
        const megaCapable = pokemonList.filter(p => p.hasMega);
        const pokemon = get().pokemon;
        const obtained = megaCapable.filter(p => pokemon[p.id]?.shiny).length;
        return {
          obtained,
          total: megaCapable.length,
          percentage: megaCapable.length > 0 ? Math.round((obtained / megaCapable.length) * 100) : 0,
        };
      },

      getAlphaShinyMegaDexProgress: (pokemonList) => {
        const megaCapable = pokemonList.filter(p => p.hasMega);
        const pokemon = get().pokemon;
        const obtained = megaCapable.filter(p => pokemon[p.id]?.alphaShiny).length;
        return {
          obtained,
          total: megaCapable.length,
          percentage: megaCapable.length > 0 ? Math.round((obtained / megaCapable.length) * 100) : 0,
        };
      },

      getOverallProgress: (pokemonList) => {
        const pokemon = get().pokemon;
        let obtainedForms = 0;
        let totalForms = 0;

        pokemonList.forEach(p => {
          const status = pokemon[p.id];
          if (status) {
            if (status.normal) obtainedForms++;
            if (status.shiny) obtainedForms++;
            if (p.canBeAlpha && status.alpha) obtainedForms++;
            if (p.canBeAlpha && status.alphaShiny) obtainedForms++;
          }

          totalForms += 2; // normal + shiny
          if (p.canBeAlpha) totalForms += 2; // alpha + alphaShiny
        });

        return {
          obtainedForms,
          totalForms,
          percentage: totalForms > 0 ? Math.round((obtainedForms / totalForms) * 100) : 0,
        };
      },

      setHasHydrated: (value: boolean) => {
        set({ _hasHydrated: value });
      },
    }),
    {
      name: 'pokemon-tracker-enhanced',
      storage: createJSONStorage(() => createStorage()),
      onRehydrateStorage: () => (state) => {
        console.log('[TRACKER_STORE] onRehydrateStorage triggered');
        if (state) {
          state.setHasHydrated(true);
          console.log('[TRACKER_STORE] Hydration complete, hasHydrated set to true.');
        }
      },
    }
  )
);

// Setup network status monitoring
if (Platform.OS !== 'web') {
  // For React Native, we'd use @react-native-netinfo/netinfo
  // This is a placeholder for now
} else if (isWebWithStorage()) {
  // Web network status monitoring (only if window is available)
  window.addEventListener('online', () => {
    usePokemonTrackerStore.getState().setOnlineStatus(true);
  });
  window.addEventListener('offline', () => {
    usePokemonTrackerStore.getState().setOnlineStatus(false);
  });
}