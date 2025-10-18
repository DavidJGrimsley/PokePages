import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import { universalStorage } from '@/src/utils/platformStorage';

export type FormType = 'normal' | 'shiny' | 'alpha' | 'alphaShiny';

export interface PokemonStatus {
  normal: boolean;    // Registered - caught regular version at least once
  shiny: boolean;     // Caught shiny version (non-alpha) at least once  
  alpha: boolean;     // Caught alpha version (non-shiny) at least once
  alphaShiny: boolean; // Caught shiny alpha version at least once
}

interface PokemonTrackerState {
  // Single tracker for ALL Pokemon - no separate tracker types needed
  pokemon: Record<number, PokemonStatus>;
  
  // Actions
  toggleForm: (dex: number, form: FormType) => void;
  getFormStatus: (dex: number, form: FormType) => boolean;
  getPokemonStatus: (dex: number) => PokemonStatus;
  setPokemonData: (data: Record<number, PokemonStatus>) => void;
  clearAllPokemon: () => void;
  
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
  _hasHydrated: false,
};

// Check if we're in a web environment
const isWeb = Platform.OS === 'web';

// Create storage adapter
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
  }

  // Native - use our universal storage with async support
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
};

export const usePokemonTrackerStore = create<PokemonTrackerState>()(
  persist(
    (set, get) => ({
      ...initialState,

      toggleForm: (dex, form) => {
        console.log(`[TRACKER_STORE] Toggling Dex: #${dex}, Form: ${form}`);
        
        set((state) => {
          const current = state.pokemon[dex] || { normal: false, shiny: false, alpha: false, alphaShiny: false };
          const newValue = !current[form];
          
          console.log(`[TRACKER_STORE] #${dex} ${form}: ${current[form]} -> ${newValue}`);
          
          // Calculate the new status object
          const newStatus = {
            ...current,
            [form]: newValue,
          };
          
          // Auto-set normal to true if any special form is true
          // (If you caught shiny, alpha, or alphaShiny, you've definitely registered it)
          if (newStatus.shiny || newStatus.alpha || newStatus.alphaShiny) {
            newStatus.normal = true;
          }
          
          return {
            pokemon: {
              ...state.pokemon,
              [dex]: newStatus,
            },
          };
        });
      },

      getFormStatus: (dex, form) => {
        return get().pokemon[dex]?.[form] || false;
      },

      getPokemonStatus: (dex) => {
        return get().pokemon[dex] || { normal: false, shiny: false, alpha: false, alphaShiny: false };
      },

      setPokemonData: (data) => {
        console.log(`[TRACKER_STORE] Setting pokemon data`);
        set({ pokemon: data });
      },

      clearAllPokemon: () => {
        console.log(`[TRACKER_STORE] Clearing all pokemon`);
        set({ pokemon: {} });
      },

      getPokedexProgress: (pokemonList) => {
        const pokemon = get().pokemon;
        let obtained = 0;
        const total = pokemonList.length;

        pokemonList.forEach(({ id }) => {
          const status = pokemon[id];
          // Count as obtained if normal is true OR if any special form is obtained
          if (status?.normal || status?.shiny || status?.alpha || status?.alphaShiny) {
            obtained++;
          }
        });

        const percentage = total > 0 ? Math.round((obtained / total) * 100) : 0;
        return { obtained, total, percentage };
      },

      getShinyDexProgress: (pokemonList) => {
        const pokemon = get().pokemon;
        let obtained = 0;
        const total = pokemonList.length;

        pokemonList.forEach(({ id }) => {
          const status = pokemon[id];
          if (status?.shiny) obtained++;
        });

        const percentage = total > 0 ? Math.round((obtained / total) * 100) : 0;
        return { obtained, total, percentage };
      },

      getAlphaDexProgress: (pokemonList) => {
        const pokemon = get().pokemon;
        let obtained = 0;
        const alphaCapable = pokemonList.filter(p => p.canBeAlpha);
        const total = alphaCapable.length;

        alphaCapable.forEach(({ id }) => {
          const status = pokemon[id];
          if (status?.alpha) obtained++;
        });

        const percentage = total > 0 ? Math.round((obtained / total) * 100) : 0;
        return { obtained, total, percentage };
      },

      getShinyAlphaDexProgress: (pokemonList) => {
        const pokemon = get().pokemon;
        let obtained = 0;
        const alphaCapable = pokemonList.filter(p => p.canBeAlpha);
        const total = alphaCapable.length;

        alphaCapable.forEach(({ id }) => {
          const status = pokemon[id];
          if (status?.alphaShiny) obtained++;
        });

        const percentage = total > 0 ? Math.round((obtained / total) * 100) : 0;
        return { obtained, total, percentage };
      },

      getMegaDexProgress: (pokemonList) => {
        const pokemon = get().pokemon;
        let obtained = 0;
        const megaCapable = pokemonList.filter(p => p.hasMega);
        const total = megaCapable.length;

        megaCapable.forEach(({ id }) => {
          const status = pokemon[id];
          if (status?.normal) obtained++;
        });

        const percentage = total > 0 ? Math.round((obtained / total) * 100) : 0;
        return { obtained, total, percentage };
      },

      getMegaShinyDexProgress: (pokemonList) => {
        const pokemon = get().pokemon;
        let obtained = 0;
        const megaCapable = pokemonList.filter(p => p.hasMega);
        const total = megaCapable.length;

        megaCapable.forEach(({ id }) => {
          const status = pokemon[id];
          if (status?.shiny) obtained++;
        });

        const percentage = total > 0 ? Math.round((obtained / total) * 100) : 0;
        return { obtained, total, percentage };
      },

      getAlphaShinyMegaDexProgress: (pokemonList) => {
        const pokemon = get().pokemon;
        let obtained = 0;
        const megaCapable = pokemonList.filter(p => p.hasMega);
        const total = megaCapable.length;

        megaCapable.forEach(({ id }) => {
          const status = pokemon[id];
          if (status?.alphaShiny) obtained++;
        });

        const percentage = total > 0 ? Math.round((obtained / total) * 100) : 0;
        return { obtained, total, percentage };
      },

      getOverallProgress: (pokemonList) => {
        const pokemon = get().pokemon;
        let obtainedForms = 0;
        let totalForms = 0;

        pokemonList.forEach(({ id, canBeAlpha }) => {
          const status = pokemon[id];
          
          // Count available forms for this Pokemon
          const availableForms = canBeAlpha ? 4 : 2; // normal, shiny, [alpha, alphaShiny if canBeAlpha]
          totalForms += availableForms;
          
          // Count obtained forms for this Pokemon
          if (status) {
            let pokemonObtained = 0;
            if (status.normal) pokemonObtained++;
            if (status.shiny) pokemonObtained++;
            if (canBeAlpha && status.alpha) pokemonObtained++;
            if (canBeAlpha && status.alphaShiny) pokemonObtained++;
            obtainedForms += pokemonObtained;
          }
        });

        const percentage = totalForms > 0 ? Math.round((obtainedForms / totalForms) * 100) : 0;
        return { obtainedForms, totalForms, percentage };
      },

      setHasHydrated: (value) => {
        set({ _hasHydrated: value });
      },
    }),
    {
      name: 'pokemon-tracker-storage',
      storage: createJSONStorage(() => createStorage()),
      onRehydrateStorage: () => (state) => {
        console.log('[TRACKER_STORE] Hydration started');
        if (state) {
          state.setHasHydrated(true);
          console.log('[TRACKER_STORE] Hydration complete', {
            totalPokemon: Object.keys(state.pokemon || {}).length,
          });
        }
      },
    }
  )
);
