# State Management with Zustand

## Overview
PokePages uses **Zustand** for client-side state management. Zustand provides a lightweight, atomic state management solution that's perfect for React Native applications requiring minimal boilerplate and maximum performance.

## Why Zustand?

### Advantages
✅ **Minimal boilerplate** - No providers, no context, no reducers
✅ **Atomic updates** - Granular subscriptions prevent unnecessary re-renders
✅ **TypeScript-first** - Full type inference and safety
✅ **Persistence built-in** - Easy integration with AsyncStorage
✅ **DevTools support** - Debug state changes
✅ **Selector hooks** - Optimize component rendering
✅ **Small bundle size** - < 1KB gzipped
✅ **React Native optimized** - Works seamlessly cross-platform

### Comparison to Alternatives
| Feature | Zustand | Redux | Context API | Jotai |
|---------|---------|-------|-------------|-------|
| Boilerplate | Minimal | High | Medium | Minimal |
| Performance | Excellent | Good | Poor (re-renders) | Excellent |
| Learning Curve | Easy | Steep | Easy | Easy |
| Persistence | Built-in | Middleware | Manual | Manual |
| TypeScript | Excellent | Good | Good | Excellent |
| Bundle Size | ~1KB | ~15KB | 0KB | ~3KB |

## Store Structure

### Current Stores
```
src/store/
├── authStore.ts              # Authentication & user state
├── dexTrackerStore.ts        # Pokémon collection tracking
├── favoriteFeaturesStore.ts  # User's favorite pages
└── onboardingStore.ts        # Onboarding flow state
```

## Implementation Patterns

### 1. Basic Store Setup
```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StoreState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useCountStore = create<StoreState>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
      decrement: () => set((state) => ({ count: state.count - 1 })),
    }),
    {
      name: 'count-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### 2. Complex Store (Auth Example)
```typescript
interface AuthState {
  // State
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isLoggedIn: boolean;
  loading: boolean;
  
  // Computed properties (derived state)
  isAdult: boolean;
  canUseSocialFeatures: boolean;
  isVip: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setSession: (session: Session | null) => void;
  signOut: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      session: null,
      isLoggedIn: false,
      loading: true,
      
      // Computed properties
      get isAdult() {
        const profile = get().profile;
        if (!profile?.dateOfBirth) return false;
        const age = calculateAge(profile.dateOfBirth);
        return age >= 18;
      },
      
      get canUseSocialFeatures() {
        return get().isLoggedIn && get().isAdult;
      },
      
      get isVip() {
        return get().profile?.vipStatus === true;
      },
      
      // Actions
      setUser: (user) => set({ user, isLoggedIn: !!user }),
      setProfile: (profile) => set({ profile }),
      setSession: (session) => set({ session }),
      
      signOut: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          profile: null,
          session: null,
          isLoggedIn: false,
        });
      },
      
      initializeAuth: async () => {
        // Complex initialization logic
        set({ loading: true });
        try {
          const { data } = await supabase.auth.getSession();
          // ... load user and profile
          set({ loading: false });
        } catch (error) {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Partial persistence - don't persist loading states
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        session: state.session,
      }),
    }
  )
);
```

### 3. Selector Hooks for Performance
```typescript
// ❌ Bad - Component re-renders on ANY state change
function Component() {
  const store = useAuthStore();
  return <Text>{store.user?.email}</Text>;
}

// ✅ Good - Only re-renders when email changes
function Component() {
  const email = useAuthStore((state) => state.user?.email);
  return <Text>{email}</Text>;
}

// ✅ Even Better - Custom selector hook
export const useUserEmail = () => {
  return useAuthStore((state) => state.user?.email);
};

function Component() {
  const email = useUserEmail();
  return <Text>{email}</Text>;
}

// ✅ Best - Multiple selectors in one hook
export const useUserWithProfile = () => {
  return useAuthStore((state) => ({
    user: state.user,
    profile: state.profile,
    isLoggedIn: state.isLoggedIn,
    isAdult: state.isAdult,
  }));
};
```

## Cross-Platform Storage

### Platform-Specific Implementations
```typescript
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const setStorageItem = async (key: string, value: string): Promise<void> => {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await AsyncStorage.setItem(key, value);
    }
  } catch (error) {
    console.error('Error setting storage item:', error);
  }
};

// Use in Zustand store
export const useStore = create<State>()(
  persist(
    (set) => ({ /* state */ }),
    {
      name: 'storage-key',
      storage: {
        getItem: getStorageItem,
        setItem: setStorageItem,
        removeItem: async (key) => {
          if (Platform.OS === 'web') {
            localStorage.removeItem(key);
          } else {
            await AsyncStorage.removeItem(key);
          }
        },
      },
    }
  )
);
```

## Best Practices

### 1. Store Organization
✅ **DO:** One store per feature/domain
```typescript
useAuthStore      // Authentication
useDexStore       // Pokédex tracking
useFavoritesStore // Favorites
```

❌ **DON'T:** One giant store
```typescript
useAppStore // Everything (bad!)
```

### 2. Computed Properties
✅ **DO:** Use getters for derived state
```typescript
get isAdult() {
  const profile = get().profile;
  return calculateAge(profile?.dateOfBirth) >= 18;
}
```

❌ **DON'T:** Store derived values
```typescript
isAdult: false, // Will get out of sync!
```

### 3. Actions Should Be Pure
✅ **DO:** Keep actions focused and predictable
```typescript
increment: () => set((state) => ({ count: state.count + 1 })),
```

❌ **DON'T:** Mix concerns
```typescript
increment: async () => {
  await api.logIncrement(); // Side effect!
  set((state) => ({ count: state.count + 1 }));
  analytics.track('incremented'); // Another side effect!
}
```

### 4. Use Selectors
✅ **DO:** Optimize with selectors
```typescript
const user = useAuthStore((state) => state.user);
```

❌ **DON'T:** Access entire store
```typescript
const { user, profile, session, loading, ... } = useAuthStore();
// Component re-renders when ANY property changes!
```

### 5. Persistence Strategy
✅ **DO:** Partial persistence
```typescript
persist(
  (set) => ({ /* store */ }),
  {
    name: 'storage',
    partialize: (state) => ({
      user: state.user,
      settings: state.settings,
      // Don't persist loading, error states
    }),
  }
)
```

## Real-World Examples

### Example 1: Dex Tracker Store
```typescript
interface DexTrackerState {
  trackedPokemon: Record<number, boolean>;
  shinyPokemon: Record<number, boolean>;
  addPokemon: (dexNumber: number) => void;
  removePokemon: (dexNumber: number) => void;
  toggleShiny: (dexNumber: number) => void;
  getTotalCaught: () => number;
}

export const useDexTrackerStore = create<DexTrackerState>()(
  persist(
    (set, get) => ({
      trackedPokemon: {},
      shinyPokemon: {},
      
      addPokemon: (dexNumber) =>
        set((state) => ({
          trackedPokemon: { ...state.trackedPokemon, [dexNumber]: true },
        })),
      
      removePokemon: (dexNumber) =>
        set((state) => {
          const { [dexNumber]: _, ...rest } = state.trackedPokemon;
          return { trackedPokemon: rest };
        }),
      
      toggleShiny: (dexNumber) =>
        set((state) => ({
          shinyPokemon: {
            ...state.shinyPokemon,
            [dexNumber]: !state.shinyPokemon[dexNumber],
          },
        })),
      
      getTotalCaught: () => Object.keys(get().trackedPokemon).length,
    }),
    {
      name: 'dex-tracker-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Example 2: Favorites Store
```typescript
interface FavoritesState {
  favorites: Record<string, boolean>;
  toggleFavorite: (key: string) => void;
  isFavorite: (key: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: {},
      
      toggleFavorite: (key) =>
        set((state) => ({
          favorites: {
            ...state.favorites,
            [key]: !state.favorites[key],
          },
        })),
      
      isFavorite: (key) => !!get().favorites[key],
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Usage in component
function FavoriteButton({ pageKey }: { pageKey: string }) {
  const isFavorite = useFavoritesStore((state) => state.isFavorite(pageKey));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);
  
  return (
    <Pressable onPress={() => toggleFavorite(pageKey)}>
      <Text>{isFavorite ? '⭐' : '☆'}</Text>
    </Pressable>
  );
}
```

## Debugging

### DevTools Integration
```typescript
import { devtools } from 'zustand/middleware';

export const useStore = create<State>()(
  devtools(
    persist(
      (set) => ({ /* store */ }),
      { name: 'storage' }
    ),
    { name: 'MyStore' }
  )
);
```

### Logging Middleware
```typescript
const log = (config) => (set, get, api) =>
  config(
    (...args) => {
      console.log('  applying', args);
      set(...args);
      console.log('  new state', get());
    },
    get,
    api
  );

export const useStore = create(log((set) => ({ /* store */ })));
```

## Performance Tips

### 1. Use Shallow Equality for Objects
```typescript
import { shallow } from 'zustand/shallow';

const { user, profile } = useAuthStore(
  (state) => ({ user: state.user, profile: state.profile }),
  shallow
);
```

### 2. Split Large Stores
Instead of one large store, split into multiple:
```typescript
useUserStore()      // User data
useSettingsStore()  // App settings
useUIStore()        // UI state (modals, etc.)
```

### 3. Avoid Nesting
```typescript
// ❌ Bad - Nested objects cause re-renders
const state = {
  user: {
    profile: {
      name: 'John'
    }
  }
}

// ✅ Good - Flat structure
const state = {
  userName: 'John',
  userId: '123',
}
```

## Migration from Context

### Before (Context)
```typescript
const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  // Every consumer re-renders when user changes!
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}
```

### After (Zustand)
```typescript
export const useUserStore = create<UserState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));

// No provider needed!
// Components only re-render when their selected state changes
```

## Common Patterns

### 1. Loading States
```typescript
interface State {
  data: Data | null;
  loading: boolean;
  error: string | null;
  fetch: () => Promise<void>;
}

export const useDataStore = create<State>((set) => ({
  data: null,
  loading: false,
  error: null,
  
  fetch: async () => {
    set({ loading: true, error: null });
    try {
      const data = await api.getData();
      set({ data, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));
```

### 2. Optimistic Updates
```typescript
addItem: async (item) => {
  // Optimistically update UI
  set((state) => ({ items: [...state.items, item] }));
  
  try {
    await api.addItem(item);
  } catch (error) {
    // Revert on error
    set((state) => ({
      items: state.items.filter((i) => i.id !== item.id),
    }));
  }
},
```

### 3. Reset Pattern
```typescript
const initialState = {
  user: null,
  profile: null,
  // ...
};

export const useAuthStore = create<State>((set) => ({
  ...initialState,
  
  reset: () => set(initialState),
  
  signOut: async () => {
    await api.signOut();
    set(initialState);
  },
}));
```

## Resources
- [Zustand Documentation](https://docs.pmnd.rs/zustand/getting-started/introduction)
- [Zustand GitHub](https://github.com/pmndrs/zustand)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
