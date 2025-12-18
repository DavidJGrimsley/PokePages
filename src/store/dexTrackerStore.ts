import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import { universalStorage } from '@/src/utils/platformStorage';
import { buildApiUrl, API_BASE_URL } from '@/src/utils/apiConfig';
import { useAuthStore } from '@/src/store/authStore'; // already present
import { RegisteredStatus, FormType } from '@/src/types/tracker';

// (Deprecated) PokemonStatus was merged into RegisteredStatus

interface PokemonTrackerState {
  // Nested structure: pokemon data separated by pokedex
  pokemon: Record<string, Record<number, RegisteredStatus>>;
  
  // Sync state
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: string | null;
  pendingUpdates: { pokemonId: number; form: FormType; value: boolean; pokedex: string; timestamp: string }[];
  
  // Actions (pokedex required for API sync operations)
  toggleForm: (dex: number, form: FormType, pokedex: string) => Promise<void>;
  getFormStatus: (dex: number, form: FormType, pokedex: string) => boolean;
  getPokemonStatus: (dex: number, pokedex: string) => RegisteredStatus | undefined;
  setPokemonData: (data: Record<number, RegisteredStatus>, pokedex: string) => void;
  clearAllPokemon: () => void;
  
  // Sync actions (pokedex required to specify which dex to load/save)
  syncWithDatabase: (pokedex: string) => Promise<void>;
  loadFromDatabase: (pokedex: string) => Promise<void>;
  setOnlineStatus: (online: boolean) => void;
  processPendingUpdates: (pokedex: string) => Promise<void>;
  
  // Stats - Multiple progress trackers (work on whatever data is loaded)
  getPokedexProgress: (pokemonList: {id: number}[]) => {
    obtained: number;
    total: number;
    percentage: number;
  };
  getNormalDexProgress: (pokemonList: {id: number}[]) => {
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
let cachedTokenPromise: Promise<string | undefined> | null = null;
let lastTokenTime = 0;
const TOKEN_CACHE_MS = 5000; // Cache for 5 seconds
const TOKEN_TIMEOUT_MS = 5000; // 5 seconds timeout for better Android reliability

async function getValidAccessToken(): Promise<string | undefined> {
  console.log('[TRACKER] getValidAccessToken: STARTING');
  const now = Date.now();

  // If a request is already in flight and fresh, reuse it
  if (cachedTokenPromise && (now - lastTokenTime) < TOKEN_CACHE_MS) {
    console.log('[TRACKER] getValidAccessToken: returning cached promise');
    return cachedTokenPromise;
  }

  // Fast path: use token already in auth store (no network)
  try {
    const s: any = useAuthStore.getState();
    const storeToken = s.session?.access_token || s.accessToken || s.token || s.user?.accessToken;
    if (storeToken) {
      lastTokenTime = now;
      cachedTokenPromise = Promise.resolve(storeToken);
      console.log('[TRACKER] getValidAccessToken: using token from auth store');
      return cachedTokenPromise;
    }
  } catch (e) {
    console.warn('[TRACKER] getValidAccessToken: auth store read failed', e);
  }

  // Create a new request with timeout to avoid hanging on web
  cachedTokenPromise = (async () => {
    try {
      const { supabase } = await import('@/src/utils/supabaseClient');
      console.log('[TRACKER] getValidAccessToken: supabase imported');

      const sessionOrTimeout = await Promise.race([
        supabase.auth.getSession(),
        new Promise<{ data: { session: any }, error: any }>((resolve) =>
          setTimeout(() => resolve({ data: { session: undefined }, error: new Error('getSession-timeout') }), TOKEN_TIMEOUT_MS)
        ),
      ]);

      const session = sessionOrTimeout?.data?.session as any | undefined;
      const error = sessionOrTimeout?.error;
      console.log('[TRACKER] getValidAccessToken: getSession returned, session present?', !!session, 'error?', !!error);

      if (session?.access_token) {
        const authStore = useAuthStore.getState();
        if (authStore.session?.access_token !== session.access_token) {
          console.log('[TRACKER] Refreshed token detected, updating auth store');
          authStore.setSession(session);
        }
        console.log('[TRACKER] getValidAccessToken: returning token from session');
        return session.access_token as string;
      }

      // Fallback to any token in auth store
      const s2: any = useAuthStore.getState();
      const fallbackToken = s2.session?.access_token || s2.accessToken || s2.token || s2.user?.accessToken;
      console.log('[TRACKER] getValidAccessToken: no session token, using fallback?', !!fallbackToken);
      return fallbackToken as string | undefined;
    } catch (error) {
      console.error('[TRACKER] Error in getValidAccessToken:', error);
      return undefined;
    }
  })();

  lastTokenTime = now;
  return cachedTokenPromise;
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
      toggleForm: async (dex: number, form: FormType, pokedex: string) => {
        const currentStatus = get().getPokemonStatus(dex, pokedex) || {
          normal: false,
          shiny: false,
          alpha: false,
          alphaShiny: false,
        };
        const newValue = !currentStatus[form];
        console.log('[TRACKER] API_BASE_URL from apiConfig:', API_BASE_URL);

        // Debug
        console.log('[TRACKER] toggleForm called', { dex, form, newValue, pokedex });

        // Update local state immediately (optimistic update) with nested structure
        const updatedStatus: RegisteredStatus = { ...currentStatus };
        updatedStatus[form] = newValue;

        set((state) => ({
          pokemon: {
            ...state.pokemon,
            [pokedex]: {
              ...(state.pokemon[pokedex] || {}),
              [dex]: updatedStatus,
            },
          },
        }));

        // Try to sync with server (Drizzle) if online
        const { isOnline } = get();
        console.log('[TRACKER] Online status before sync attempt:', isOnline);
        if (isOnline) {
          const url = buildApiUrl(`dex-tracker/${dex}`);
          try {
            const userId = getUserId();
            console.log('[TRACKER] sync PUT -> ', url, { userIdPresent: !!userId, pokedex });
            
            if (!userId) {
              console.log('[TRACKER] No user ID available, cannot sync to server - queuing as pending');
              throw new Error('No user ID - user may not be logged in');
            }

            console.log('[TRACKER] About to get auth headers...');
            let headers: Record<string, string> = {};
            try {
              headers = await authHeaders(); // await the async function
              console.log('[TRACKER] Auth headers obtained:', Object.keys(headers), 'Authorization present?', !!headers.Authorization);
            } catch (headerError) {
              console.error('[TRACKER] EXCEPTION getting auth headers:', headerError);
              throw headerError;
            }
            
            console.log('[TRACKER] About to call fetch with URL:', url);
            console.log('[TRACKER] Fetch payload:', { pokedex, formType: form, value: newValue });
            
            const res = await fetch(url, {
              method: 'PUT',
              headers: headers, // include bearer
              body: JSON.stringify({ pokedex, formType: form, value: newValue }),
            });
            
            console.log('[TRACKER] Fetch returned, status:', res.status, res.statusText);
            
            if (!res.ok) {
              const text = await res.text().catch(() => 'no-body');
              throw new Error(`HTTP ${res.status} ${text}`);
            }
            console.log('[TRACKER] sync PUT success', { dex, form, newValue, pokedex });
            set({ lastSyncTime: new Date().toISOString() });
          } catch (error) {
            console.error('[TRACKER] Failed to sync to database:', error);
            console.error('[TRACKER] Error details:', {
              url: url,
              method: 'PUT',
              name: error instanceof Error ? error.name : 'unknown',
              message: error instanceof Error ? error.message : String(error),
              stack: error instanceof Error ? error.stack : undefined,
              pokedex: pokedex,
              dex: dex,
              form: form
            });
            // Add to pending updates for later sync
            set((state) => ({
              pendingUpdates: [
                ...state.pendingUpdates,
                { pokemonId: dex, form, value: newValue, pokedex, timestamp: new Date().toISOString() }
              ]
            }));
          }
        } else {
          // Add to pending updates when offline
          console.log('[TRACKER] offline - queueing update', { dex, form, newValue });
          set((state) => ({
            pendingUpdates: [
              ...state.pendingUpdates,
              { pokemonId: dex, form, value: newValue, pokedex, timestamp: new Date().toISOString() }
            ]
          }));
        }
      },

      // Load data from server (Drizzle)
      loadFromDatabase: async (pokedex: string) => {
        try {
          console.log('[TRACKER] loadFromDatabase: starting for pokedex:', pokedex);
          set({ isSyncing: true });
          const userId = getUserId();
          console.log('[TRACKER] loadFromDatabase: userId present?', !!userId);
          if (!userId) {
            console.log('[TRACKER] loadFromDatabase: no userId, aborting');
            set({ isSyncing: false });
            return;
          }

          const url = buildApiUrl(`dex-tracker?pokedex=${pokedex}`);
          console.log('[TRACKER] GET ->', url);
          
          // Add timeout to fetch request
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
          
          const headers = await authHeaders(); // await the async function
          console.log('[TRACKER] Headers prepared:', Object.keys(headers));
          
          console.log('[TRACKER] About to fetch...');
          const res = await fetch(url, {
            headers: headers, // include bearer
            signal: controller.signal,
          });
          console.log('[TRACKER] Fetch completed, status:', res.status, res.statusText);
          
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

          // Merge with existing data for this pokedex
          set((state) => ({
            pokemon: {
              ...state.pokemon,
              [pokedex]: {
                ...(state.pokemon[pokedex] || {}),
                ...pokemonData,
              },
            },
            lastSyncTime: new Date().toISOString(),
            isSyncing: false,
          }));

          console.log('[TRACKER] loadFromDatabase: merged pokemon data', get().pokemon);
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
      syncWithDatabase: async (pokedex: string) => {
        const { isOnline, isSyncing } = get();
        if (!isOnline || isSyncing) return;

        try {
          console.log('[TRACKER] Full syncWithDatabase: starting for pokedex:', pokedex);
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
          await get().processPendingUpdates(pokedex);

          // Full sync: compare local data with database
          const allPokemon = get().pokemon;
          const localPokemon = allPokemon[pokedex] || {};
          const headers = await authHeaders(); // await the async function
          const res = await fetch(buildApiUrl(`dex-tracker?pokedex=${pokedex}`), {
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
            const res2 = await fetch(buildApiUrl('dex-tracker/batch'), {
               method: 'POST',
               headers: headers2, // include bearer
               body: JSON.stringify({ pokedex, updates }),
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
      processPendingUpdates: async (pokedex: string) => {
        const { pendingUpdates } = get();
        if (pendingUpdates.length === 0) return;

        try {
          console.log('[TRACKER] processPendingUpdates: count=', pendingUpdates.length, 'pokedex:', pokedex);
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
          const res = await fetch(buildApiUrl('dex-tracker/batch'), {
             method: 'POST',
             headers: headers, // include bearer
             body: JSON.stringify({ pokedex, updates }),
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
        // Note: Don't auto-sync here - we don't know which pokedex to sync
        // The UI should call loadFromDatabase(pokedex) when needed
      },

      getFormStatus: (dex: number, form: FormType, pokedex: string) => {
        const pokemon = get().pokemon[pokedex]?.[dex];
        return pokemon ? pokemon[form] : false;
      },

      getPokemonStatus: (dex: number, pokedex: string) => {
        return get().pokemon[pokedex]?.[dex];
      },

      setPokemonData: (data: Record<number, RegisteredStatus>, pokedex: string) => {
        set((state) => ({
          pokemon: {
            ...state.pokemon,
            [pokedex]: data,
          },
        }));
      },

      clearAllPokemon: () => {
        set({ pokemon: {} });
      },

      // Progress calculation functions - these look across ALL pokedexes
      getPokedexProgress: (pokemonList) => {
        const allPokemon = get().pokemon;
        const obtained = pokemonList.filter(p => {
          // Check if Pokemon is obtained in ANY pokedex
          for (const pokedex in allPokemon) {
            const s = allPokemon[pokedex][p.id];
            if (s?.normal || s?.shiny || s?.alpha || s?.alphaShiny) {
              return true;
            }
          }
          return false;
        }).length;
        return {
          obtained,
          total: pokemonList.length,
          percentage: pokemonList.length > 0 ? Math.round((obtained / pokemonList.length) * 100) : 0,
        };
      },

      // Same behavior as the old getPokedexProgress: count normal only - check ALL pokedexes
      getNormalDexProgress: (pokemonList) => {
        const allPokemon = get().pokemon;
        const obtained = pokemonList.filter(p => {
          for (const pokedex in allPokemon) {
            if (allPokemon[pokedex][p.id]?.normal) return true;
          }
          return false;
        }).length;
        return {
          obtained,
          total: pokemonList.length,
          percentage: pokemonList.length > 0 ? Math.round((obtained / pokemonList.length) * 100) : 0,
        };
      },

      getShinyDexProgress: (pokemonList) => {
        const allPokemon = get().pokemon;
        const obtained = pokemonList.filter(p => {
          for (const pokedex in allPokemon) {
            if (allPokemon[pokedex][p.id]?.shiny) return true;
          }
          return false;
        }).length;
        return {
          obtained,
          total: pokemonList.length,
          percentage: pokemonList.length > 0 ? Math.round((obtained / pokemonList.length) * 100) : 0,
        };
      },

      getAlphaDexProgress: (pokemonList) => {
        const alphaCapable = pokemonList.filter(p => p.canBeAlpha);
        const allPokemon = get().pokemon;
        const obtained = alphaCapable.filter(p => {
          for (const pokedex in allPokemon) {
            if (allPokemon[pokedex][p.id]?.alpha) return true;
          }
          return false;
        }).length;
        return {
          obtained,
          total: alphaCapable.length,
          percentage: alphaCapable.length > 0 ? Math.round((obtained / alphaCapable.length) * 100) : 0,
        };
      },

      getShinyAlphaDexProgress: (pokemonList) => {
        const alphaCapable = pokemonList.filter(p => p.canBeAlpha);
        const allPokemon = get().pokemon;
        const obtained = alphaCapable.filter(p => {
          for (const pokedex in allPokemon) {
            if (allPokemon[pokedex][p.id]?.alphaShiny) return true;
          }
          return false;
        }).length;
        return {
          obtained,
          total: alphaCapable.length,
          percentage: alphaCapable.length > 0 ? Math.round((obtained / alphaCapable.length) * 100) : 0,
        };
      },

      getMegaDexProgress: (pokemonList) => {
        const megaCapable = pokemonList.filter(p => p.hasMega);
        const allPokemon = get().pokemon;
        const obtained = megaCapable.filter(p => {
          for (const pokedex in allPokemon) {
            if (allPokemon[pokedex][p.id]?.normal) return true;
          }
          return false;
        }).length;
        return {
          obtained,
          total: megaCapable.length,
          percentage: megaCapable.length > 0 ? Math.round((obtained / megaCapable.length) * 100) : 0,
        };
      },

      getMegaShinyDexProgress: (pokemonList) => {
        const megaCapable = pokemonList.filter(p => p.hasMega);
        const allPokemon = get().pokemon;
        const obtained = megaCapable.filter(p => {
          for (const pokedex in allPokemon) {
            if (allPokemon[pokedex][p.id]?.shiny) return true;
          }
          return false;
        }).length;
        return {
          obtained,
          total: megaCapable.length,
          percentage: megaCapable.length > 0 ? Math.round((obtained / megaCapable.length) * 100) : 0,
        };
      },

      getAlphaShinyMegaDexProgress: (pokemonList) => {
        const megaCapable = pokemonList.filter(p => p.hasMega);
        const allPokemon = get().pokemon;
        const obtained = megaCapable.filter(p => {
          for (const pokedex in allPokemon) {
            if (allPokemon[pokedex][p.id]?.alphaShiny) return true;
          }
          return false;
        }).length;
        return {
          obtained,
          total: megaCapable.length,
          percentage: megaCapable.length > 0 ? Math.round((obtained / megaCapable.length) * 100) : 0,
        };
      },

      getOverallProgress: (pokemonList) => {
        const allPokemon = get().pokemon;
        let obtainedForms = 0;
        let totalForms = 0;

        pokemonList.forEach(p => {
          // Check all pokedexes for this Pokemon
          let hasNormal = false;
          let hasShiny = false;
          let hasAlpha = false;
          let hasAlphaShiny = false;
          
          for (const pokedex in allPokemon) {
            const status = allPokemon[pokedex][p.id];
            if (status) {
              if (status.normal) hasNormal = true;
              if (status.shiny) hasShiny = true;
              if (status.alpha) hasAlpha = true;
              if (status.alphaShiny) hasAlphaShiny = true;
            }
          }
          
          if (hasNormal) obtainedForms++;
          if (hasShiny) obtainedForms++;
          if (p.canBeAlpha && hasAlpha) obtainedForms++;
          if (p.canBeAlpha && hasAlphaShiny) obtainedForms++;

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
        if (state) {
          state.setHasHydrated(true);
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