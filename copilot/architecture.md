# Application Architecture

## Overview
PokePages follows a modular, scalable architecture built on modern React Native and web technologies. This document outlines the core architectural decisions and patterns used throughout the application.

## Tech Stack

### Core Framework
- **Expo SDK** - Universal React Native platform
- **Expo Router** - File-based routing system
- **TypeScript** - Type-safe development
- **React Native** - Cross-platform mobile & web

### Styling & UI
- **NativeWind 4.x** - Tailwind CSS for React Native
- **Custom Theme System** - Centralized color and typography
- **Expo Google Fonts** - Typography stack (Modak, Roboto, RobotoSlab, etc.)
- **Platform-specific extensions** - `.ios.tsx`, `.android.tsx`, `.web.tsx`

### State Management
- **Zustand** - Lightweight state management
  - Persistent stores with AsyncStorage
  - Atomic state updates
  - Selector hooks for optimal re-renders
- **React Context** - Used selectively for scoped state (e.g., Map filters)

### Backend & Database
- **Supabase** - Backend as a Service (BaaS)
- **Drizzle ORM** - Type-safe SQL query builder
- **PostgreSQL** - Primary database
- **Express API Server** - Custom API endpoints for complex operations

### Data Layer Architecture
```
┌─────────────────────────────────────────┐
│         Client Application              │
│  (React Native + Expo Router)          │
└──────────────┬──────────────────────────┘
               │
               ├─── Zustand Stores (Client State)
               │    ├─── authStore.ts
               │    ├─── dexTrackerStore.ts
               │    └─── onboardingStore.ts
               │
               ├─── Direct Supabase Client
               │    └─── Real-time subscriptions
               │    └─── Authentication
               │
               └─── Custom API Server (Express)
                    └─── Drizzle ORM Queries
                         └─── PostgreSQL Database
```

## File Structure

### Source Organization (`src/`)
```
src/
├── app/                    # Expo Router pages (file-based routing)
│   ├── (drawer)/          # Main app with drawer navigation
│   ├── (onboarding)/      # Onboarding flow
│   ├── auth/              # Authentication screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   ├── Animation/         # Animated components
│   ├── Events/           # Event-related components
│   ├── Guides/           # Strategy guide components
│   ├── Meta/             # SEO & metadata components
│   ├── Pokedex/          # Pokémon data components
│   ├── Social/           # Social feature components
│   ├── TextTheme/        # Themed text components
│   └── UI/               # Generic UI components
├── constants/            # App constants & configuration
│   ├── style/           # Theme, colors, typography
│   └── *.json           # Configuration files
├── context/              # React Context providers
│   └── Map/             # Map-related context
├── db/                   # Database layer
│   ├── *Schema.ts       # Drizzle schemas
│   ├── *Queries.ts      # Database query functions
│   └── index.ts         # Database connection
├── hooks/                # Custom React hooks
├── middlewares/          # API middlewares
├── routes/              # API route handlers
├── services/            # Business logic services
├── store/               # Zustand stores
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

## Key Architectural Patterns

### 1. File-Based Routing (Expo Router)
- Routes automatically generated from file structure
- Dynamic routes with `[param]` syntax
- Nested layouts with `_layout.tsx`
- Route groups with `(group)` syntax

**Example:**
```
app/
  (drawer)/
    guides/
      PLZA/
        strategies/
          [id].tsx        → /guides/PLZA/strategies/:id
```

### 2. Platform-Specific Code
Use file extensions instead of runtime checks:
```typescript
// ❌ Avoid runtime checks
if (Platform.OS === 'ios') { ... }

// ✅ Use platform extensions
ProfileScreen.ios.tsx    // iOS-specific
ProfileScreen.android.tsx // Android-specific
ProfileScreen.tsx        // Default/shared
```

### 3. Schema-First Database Design
**Drizzle Schemas define the data model:**
```typescript
// eventsSchema.ts
export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  pokemon: text('pokemon').notNull(),
  totalClaims: integer('total_claims').default(0),
  // ...
});

// Infer types from schema
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
```

### 4. Separation of Concerns

**Database Layer (`db/`):**
- Schema definitions
- Query functions
- No business logic

**Services Layer (`services/`):**
- Business logic
- Data transformation
- Complex operations

**Store Layer (`store/`):**
- Client state management
- Persistence
- Computed values

**Components:**
- Presentation only
- Use hooks for data
- Minimal logic

### 5. Type Safety Throughout
```typescript
// Types generated from database schemas
import type { Profile, Post, Event } from '@/src/db/*Schema';

// Zustand stores are fully typed
interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoggedIn: boolean;
  // ...
}

// Props are strictly typed
interface ComponentProps {
  title: string;
  onPress: () => void;
}
```

## Cross-Platform Considerations

### 1. Conditional Rendering
```typescript
import { Platform } from 'react-native';

// Platform-specific components
{Platform.select({
  ios: <IOSComponent />,
  android: <AndroidComponent />,
  web: <WebComponent />,
  default: <DefaultComponent />
})}
```

### 2. Storage Strategy
```typescript
// Cross-platform storage abstraction
const storage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  // ...
};
```

### 3. Navigation Differences
- Mobile: Drawer + Stack navigation
- Web: Supports browser back/forward
- Deep linking across all platforms

## Performance Optimizations

### 1. Code Splitting
- Expo Router lazy loads routes
- Async route loading for web builds
- Bundle optimization with Metro

### 2. Database Connection Pooling
```typescript
// Optimized for Supabase pooler
client = postgres(connectionString, {
  prepare: false,    // Required for pgbouncer
  max: 3,           // Minimal pool size
  idle_timeout: 20, // Timeout idle connections
  max_lifetime: 60 * 30, // Recycle connections
});
```

### 3. Selective State Management
- Use Zustand for global state
- Use Context for scoped/feature state
- Avoid prop drilling with selector hooks

### 4. Optimistic Updates
```typescript
// Update UI immediately, sync later
const { mutate } = useStore();
mutate((state) => {
  state.items.push(newItem);
}, false); // Don't revalidate immediately
```

## Security Patterns

### 1. Environment Variables
```typescript
// Access sensitive data securely
const API_URL = process.env.EXPO_PUBLIC_API_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
```

### 2. Authentication Flow
```
1. User signs in/up → Supabase Auth
2. Session stored → AsyncStorage (mobile) / localStorage (web)
3. Profile loaded → authStore
4. Protected routes → Check isLoggedIn
```

### 3. Row Level Security (RLS)
- Database-level permissions via Supabase
- Users can only access their own data
- Admin functions protected by roles

## API Architecture

### Client → API Flow
```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     ├─── Simple CRUD → Direct Supabase
     │
     └─── Complex Operations → Express API
          ├── Event counters
          ├── Batch operations
          └── Real-time updates
```

### API Server Structure
```
api-server/
├── src/
│   ├── routes/           # Route handlers
│   ├── middlewares/      # CORS, auth, logging
│   └── db/              # Database connection
└── data/                # Static data backup
```

## Deployment Strategy

### Mobile Apps
- **iOS & Android:** Expo EAS Build
- **OTA Updates:** Expo Updates for instant patches
- **App Store Distribution:** Standard app stores

### Web App
- **Static Export:** `expo export -p web`
- **Hosting:** Static site hosting (Vercel, Netlify, etc.)
- **SSG:** Pre-rendered routes for SEO

### API Server
- **Hosting:** Cloud platform (Railway, Render, etc.)
- **Database:** Supabase managed PostgreSQL
- **Environment:** Node.js + Express

## Scalability Considerations

### 1. Database Indexing
- Primary keys on all tables
- Indexes on frequently queried columns
- Composite indexes for complex queries

### 2. Caching Strategy
- Client-side caching with Zustand persist
- API response caching
- Static asset CDN

### 3. Rate Limiting
- API rate limits per user/IP
- Supabase connection pooling
- Throttled real-time subscriptions

## Development Workflow

### 1. Local Development
```bash
npm start          # Start Expo dev server
npm run api-server # Start Express API
npm run db:pull    # Pull schema from Supabase
npm run db:generate # Generate migrations
```

### 2. Type Generation
```bash
npm run db:pull    # Updates Drizzle schemas
# Types are automatically inferred
```

### 3. Testing Strategy
- Component testing (planned)
- E2E testing (planned)
- Manual testing across platforms

## Future Architecture Plans

### Planned Improvements
- [ ] Implement React Query for server state
- [ ] Add service workers for web PWA
- [ ] Implement background sync for offline support
- [ ] Add comprehensive error boundary system
- [ ] Implement analytics tracking
- [ ] Add performance monitoring (Sentry)
- [ ] Implement automated testing suite

### Scalability Roadmap
- [ ] Add Redis caching layer
- [ ] Implement CDN for media assets
- [ ] Add database read replicas
- [ ] Implement WebSocket for real-time features
- [ ] Add queue system for async operations
