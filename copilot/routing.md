# Routing with Expo Router

## Overview
PokePages uses **Expo Router** - a file-based routing system for React Native and web. Routes are automatically generated from your file structure, providing a powerful and intuitive navigation system.

## Why Expo Router?

### Advantages
✅ **File-based routing** - Familiar to Next.js developers
✅ **Type-safe navigation** - TypeScript knows your routes
✅ **Deep linking** - Automatic URL support across platforms
✅ **Code splitting** - Lazy load routes for better performance
✅ **Shared routes** - Same routing code for mobile & web
✅ **Nested navigation** - Layouts and groups
✅ **Dynamic routes** - `/post/[id]` syntax
✅ **SEO friendly** - Web routes are actual URLs
✅ **Back navigation** - Built-in browser/device back button support

## File Structure = Route Structure

### Basic Routing
```
app/
├── index.tsx              → /
├── about.tsx              → /about
├── profile.tsx            → /profile
└── settings.tsx           → /settings
```

### Nested Routes
```
app/
├── index.tsx              → /
├── guides/
│   ├── index.tsx          → /guides
│   ├── beginner.tsx       → /guides/beginner
│   └── advanced.tsx       → /guides/advanced
```

### Dynamic Routes
```
app/
├── post/
│   └── [id].tsx           → /post/:id
├── user/
│   └── [username].tsx     → /user/:username
└── events/
    └── [event].tsx        → /events/:event
```

### Route Groups (No URL Segment)
```
app/
├── (drawer)/              → Navigation group, no URL
│   ├── home.tsx           → /home
│   ├── profile.tsx        → /profile
│   └── _layout.tsx        → Drawer layout
├── (onboarding)/          → Onboarding group, no URL
│   ├── index.tsx          → /onboarding
│   ├── step1.tsx          → /onboarding/step1
│   └── _layout.tsx        → Onboarding layout
```

## Real-World Example (PokePages Structure)

```
src/app/
├── _layout.tsx                      → Root layout (providers, fonts)
├── index.tsx                        → Redirect to main app
│
├── (drawer)/                        → Main app with drawer navigation
│   ├── _layout.tsx                  → Drawer navigator
│   ├── (tabs)/                      → Tab navigation
│   │   ├── _layout.tsx              → Tab bar layout
│   │   ├── index.tsx                → / (Home tab)
│   │   ├── pokedex.tsx              → /pokedex
│   │   └── social.tsx               → /social
│   │
│   ├── events/
│   │   ├── index.tsx                → /events
│   │   └── [event].tsx              → /events/:event
│   │
│   ├── guides/
│   │   ├── _layout.tsx              → Guides layout
│   │   ├── PLZA/
│   │   │   ├── index.tsx            → /guides/PLZA
│   │   │   └── strategies/
│   │   │       └── [id].tsx         → /guides/PLZA/strategies/:id
│   │
│   └── profile/
│       ├── index.tsx                → /profile
│       └── [username].tsx           → /profile/:username
│
├── (onboarding)/                    → Onboarding flow
│   ├── _layout.tsx
│   ├── index.tsx                    → /onboarding
│   ├── agreements.tsx               → /onboarding/agreements
│   └── final.tsx                    → /onboarding/final
│
├── auth/
│   ├── sign-in.tsx                  → /auth/sign-in
│   └── sign-up.tsx                  → /auth/sign-up
│
├── +not-found.tsx                   → 404 page
└── +html.tsx                        → Custom HTML root (web only)
```

## Layouts

### Root Layout (`_layout.tsx`)
```typescript
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(drawer)" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="auth" />
      </Stack>
    </GestureHandlerRootView>
  );
}
```

### Drawer Layout
```typescript
import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerShown: true,
        drawerType: 'slide',
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          title: 'Home',
          drawerIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Drawer.Screen
        name="events"
        options={{
          title: 'Events',
          drawerIcon: ({ color }) => <EventIcon color={color} />,
        }}
      />
    </Drawer>
  );
}
```

### Tab Layout
```typescript
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="pokedex"
        options={{
          title: 'Pokédex',
          tabBarIcon: ({ color }) => <PokedexIcon color={color} />,
        }}
      />
    </Tabs>
  );
}
```

## Navigation

### Basic Navigation
```typescript
import { router, Link } from 'expo-router';

// Programmatic navigation
function Component() {
  const handlePress = () => {
    router.push('/profile');
    // or
    router.navigate('/events');
    // or
    router.replace('/login'); // No back button
  };
  
  return <Button onPress={handlePress}>Go to Profile</Button>;
}

// Link component (better for web SEO)
function Component() {
  return (
    <Link href="/profile" asChild>
      <Pressable>
        <Text>Go to Profile</Text>
      </Pressable>
    </Link>
  );
}
```

### Navigate with Params
```typescript
// Navigate to dynamic route
router.push(`/post/${postId}`);
router.push({
  pathname: '/post/[id]',
  params: { id: postId },
});

// With query params
router.push({
  pathname: '/search',
  params: { q: 'pikachu', filter: 'electric' },
});
// → /search?q=pikachu&filter=electric
```

### Access Route Params
```typescript
import { useLocalSearchParams } from 'expo-router';

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  return <Text>Post ID: {id}</Text>;
}
```

### Navigation Methods
```typescript
// Push - Add to stack
router.push('/page');

// Navigate - Go to route (smart routing)
router.navigate('/page');

// Replace - Replace current route
router.replace('/page');

// Back - Go back
router.back();

// Can go back?
const canGoBack = router.canGoBack();

// Dismiss modal/sheet
router.dismiss();
```

## Dynamic Routes

### Single Dynamic Segment
```typescript
// app/events/[event].tsx
import { useLocalSearchParams } from 'expo-router';

export default function EventDetail() {
  const { event } = useLocalSearchParams<{ event: string }>();
  
  return <Text>Event: {event}</Text>;
}

// Navigate: router.push('/events/pikachu')
// URL: /events/pikachu
```

### Multiple Dynamic Segments
```typescript
// app/guides/[region]/[guide].tsx
import { useLocalSearchParams } from 'expo-router';

export default function GuideDetail() {
  const { region, guide } = useLocalSearchParams<{
    region: string;
    guide: string;
  }>();
  
  return <Text>{region} - {guide}</Text>;
}

// Navigate: router.push('/guides/kanto/gym-leaders')
// URL: /guides/kanto/gym-leaders
```

### Catch-All Routes
```typescript
// app/docs/[...slug].tsx
import { useLocalSearchParams } from 'expo-router';

export default function Docs() {
  const { slug } = useLocalSearchParams<{ slug: string[] }>();
  // slug will be an array of path segments
  
  return <Text>Docs: {slug.join('/')}</Text>;
}

// Navigate: router.push('/docs/api/reference/functions')
// slug: ['api', 'reference', 'functions']
```

## Modals & Sheets

### Modal Presentation
```typescript
// app/_layout.tsx
<Stack>
  <Stack.Screen name="(tabs)" />
  <Stack.Screen
    name="settings"
    options={{
      presentation: 'modal',
      title: 'Settings',
    }}
  />
</Stack>
```

### Full-Screen Modal
```typescript
<Stack.Screen
  name="create-post"
  options={{
    presentation: 'modal',
    headerShown: true,
    title: 'Create Post',
    headerLeft: () => (
      <Pressable onPress={() => router.back()}>
        <Text>Cancel</Text>
      </Pressable>
    ),
  }}
/>
```

### Form Sheet (iOS)
```typescript
<Stack.Screen
  name="filter"
  options={{
    presentation: 'formSheet',
    sheetAllowedDetents: [0.5, 1], // Half and full height
  }}
/>
```

## Route Guards & Protection

### Redirect Based on Auth
```typescript
// app/_layout.tsx
import { useAuthStore } from '~/store/authStore';
import { Redirect } from 'expo-router';

export default function RootLayout() {
  const { isLoggedIn, loading } = useAuthStore();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!isLoggedIn) {
    return <Redirect href="/auth/sign-in" />;
  }
  
  return <Stack>{/* routes */}</Stack>;
}
```

### Protected Route Component
```typescript
// components/ProtectedRoute.tsx
import { useAuthStore } from '~/store/authStore';
import { Redirect } from 'expo-router';

export function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuthStore();
  
  if (!isLoggedIn) {
    return <Redirect href="/auth/sign-in" />;
  }
  
  return children;
}

// Usage in route
export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}
```

## Deep Linking

### Configure URL Scheme
```json
// app.json
{
  "expo": {
    "scheme": "pokepages",
    "web": {
      "bundler": "metro"
    }
  }
}
```

### Handle Deep Links
```typescript
// Deep link: pokepages://events/pikachu
// Opens: /events/pikachu

// Web URL: https://pokepages.app/events/pikachu
// Opens: /events/pikachu

// Both work automatically!
```

### Custom Link Handling
```typescript
import { useFocusEffect } from 'expo-router';
import { Linking } from 'react-native';

export default function Page() {
  useFocusEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      console.log('Deep link:', url);
      // Custom handling
    });
    
    return () => subscription.remove();
  });
}
```

## SEO & Meta Tags (Web)

### Head Component
```typescript
import Head from 'expo-router/head';

export default function Page() {
  return (
    <>
      <Head>
        <title>Page Title | PokePages</title>
        <meta name="description" content="Page description" />
        <meta property="og:title" content="Page Title" />
        <meta property="og:description" content="Page description" />
        <meta property="og:image" content="https://pokepages.app/og-image.png" />
        <link rel="canonical" href="https://pokepages.app/page" />
      </Head>
      
      <View>{/* Page content */}</View>
    </>
  );
}
```

### Dynamic Meta Tags
```typescript
export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const post = usePost(id);
  
  return (
    <>
      <Head>
        <title>{post.title} | PokePages</title>
        <meta name="description" content={post.description} />
        <meta property="og:title" content={post.title} />
        <meta property="og:image" content={post.imageUrl} />
      </Head>
      
      <View>{/* Post content */}</View>
    </>
  );
}
```

## Static Rendering (Web)

### Generate Static Params
```typescript
// app/events/[event].tsx
export async function generateStaticParams() {
  const events = await getEvents();
  
  return events.map((event) => ({
    event: event.slug,
  }));
}

// Generates static pages at build time:
// /events/pikachu
// /events/charizard
// /events/mewtwo
```

### Incremental Static Regeneration
```typescript
export const revalidate = 60; // Revalidate every 60 seconds

export default function Page() {
  // This page will be regenerated at most once per minute
}
```

## Navigation Hooks

### useRouter
```typescript
import { useRouter } from 'expo-router';

const router = useRouter();
router.push('/page');
router.back();
router.replace('/page');
```

### usePathname
```typescript
import { usePathname } from 'expo-router';

const pathname = usePathname();
// Current route: /events/pikachu → pathname: "/events/pikachu"
```

### useSearchParams
```typescript
import { useSearchParams } from 'expo-router';

const searchParams = useSearchParams();
// URL: /search?q=pikachu
// searchParams.get('q') → "pikachu"
```

### useSegments
```typescript
import { useSegments } from 'expo-router';

const segments = useSegments();
// URL: /guides/PLZA/strategies/123
// segments: ["guides", "PLZA", "strategies", "123"]
```

### useRootNavigationState
```typescript
import { useRootNavigationState } from 'expo-router';

const navigationState = useRootNavigationState();
const isReady = navigationState?.key != null;
```

## Best Practices

### 1. Route Organization
✅ **DO:** Group related routes
```
app/
├── (app)/           # Main app
├── (auth)/          # Authentication
└── (onboarding)/    # Onboarding
```

❌ **DON'T:** Flat structure for complex apps
```
app/
├── home.tsx
├── profile.tsx
├── login.tsx
├── signup.tsx
├── onboarding1.tsx
├── onboarding2.tsx
```

### 2. Navigation
✅ **DO:** Use Link for web SEO
```typescript
<Link href="/profile">Profile</Link>
```

❌ **DON'T:** Always use router.push
```typescript
<Pressable onPress={() => router.push('/profile')}>
```

### 3. Type Safety
✅ **DO:** Type your params
```typescript
const { id } = useLocalSearchParams<{ id: string }>();
```

❌ **DON'T:** Use any
```typescript
const { id } = useLocalSearchParams(); // id is any
```

### 4. Layouts
✅ **DO:** Share layouts via `_layout.tsx`
```
guides/
├── _layout.tsx      # Shared layout
├── beginner.tsx
└── advanced.tsx
```

❌ **DON'T:** Duplicate layout code
```typescript
// In each file
<Header />
<Content />
<Footer />
```

### 5. Dynamic Routes
✅ **DO:** Use descriptive param names
```
[username].tsx
[postId].tsx
[eventSlug].tsx
```

❌ **DON'T:** Generic names
```
[id].tsx
[item].tsx
[data].tsx
```

## Performance

### Lazy Loading
Routes are automatically code-split and lazy-loaded for web builds.

### Async Routes (Experimental)
```json
// app.json
{
  "expo": {
    "experiments": {
      "typedRoutes": true
    },
    "plugins": [
      [
        "expo-router",
        {
          "asyncRoutes": {
            "web": true,
            "default": "development"
          }
        }
      ]
    ]
  }
}
```

## Troubleshooting

### Routes Not Updating
Clear Metro bundler cache:
```bash
npm start -- --clear
```

### Type Errors
Regenerate types:
```bash
npx expo customize tsconfig.json
```

### Deep Links Not Working
Check URL scheme in `app.json` and rebuild app.

## Resources
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [Expo Router GitHub](https://github.com/expo/expo/tree/main/packages/expo-router)
- [File-based Routing Guide](https://docs.expo.dev/routing/introduction/)
