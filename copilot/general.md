# React Native Performance & Best Practices Guide

## 1. App Startup Optimization (Time to Interactive - TTI)

### Minimize Startup Work
- **Don't load everything immediately** - users don't need all features in the first second
- Avoid putting 5-10 different functions in your first `useEffect` hook
- Don't initialize all tracking, load user data, and do everything upfront
- Lazy load what you can - don't load the user's complete medical record before they've signed in

### Use Profiling Tools
**React Native DevTools Profiler:**
- Hit "record" in the profiler, navigate your app, then stop profiling
- Identify views and functionalities that take the longest to render
- Look at seconds taken to render specific components

**Sentry Insights:**
- Provides nicer-looking insights from real apps in production
- Gives detailed information about what's happening in your real app

### Activate Async Routes with Expo Router
```json
{
  "expo-router": {
    "asyncRoutes": {
      "web": true,
      "default": "development"
    }
  }
}
```
- Components only mounted when required
- Not everything loaded initially
- ⚠️ **Caution:** Can improve startup time, but might decrease performance at later stages

### Use Expo Atlas
- Analyze the bundle of your application
- See all packages and modules included
- Identify packages taking up excessive time/space
- Some installed packages might be unexpectedly large

---

## 2. Avoiding Unnecessary Re-renders

### Understand Re-renders with DevTools
**Enable Highlight Updates:**
1. Open React Native DevTools Profiler
2. Click settings icon
3. Enable "Highlight updates when components render"
4. Navigate your app and see boxes appear when components render

**Analyze Flame Graphs:**
- Look for tall flames/bigger candles
- These indicate components loading slower

### Enable React Compiler
- **Expo SDK 54+:** Enabled by default
- **Below SDK 54:** Install Babel plugin and enable in `app.json`
- Automatically removes unnecessary `useMemo` and `useCallback` hooks
- Optimizes your app automatically

**Remember:** No reason to blame React Native for poor performance if your React code is poorly written in the first place.

---

## 3. Animation Performance (Target: 60 FPS)

### Show Performance Monitor
- Open DevTools → "Show perf monitor"
- See two numbers: UI thread and JavaScript thread
- Move around your app to identify where UI thread numbers drop
- Goal: Maintain 60 FPS at all times

### Avoid Blocking JavaScript Thread
- Use **Reanimated** or **Worklets** for smooth animations
- Move animations off the JavaScript thread
- Heavy computations should be on your backend when possible
- Use **React Transition API** for big computations that can't be moved to backend
  - Wrap computation in transition block
  - Observe with stages
  - Don't block JavaScript thread

---

## 4. List Performance Optimization

### Use Proper List Components
- ❌ **Avoid:** Default `FlatList` for complex cases
- ✅ **Use:** `FlashList` (tried and tested) or `LegendList` (newer, great JS implementation)
- Lists are where React Native performance often suffers most

### Efficient List Rendering
- **Pre-process your data** - don't calculate everything in render function
- Avoid rerendering everything on every change
- Don't put heavy computation in list render functions
- Works for `FlatList`, `FlashList`, and `LegendList`

### Understanding List Mutations
**Common Problems:**
- Incorrectly updating state → list doesn't rerender at all
- Unnecessarily rerendering entire list

**Solution:**
- Use **immutable updates** so React understands changes
- With React compiler or memoization, list items only rerender when required
- Update items correctly in terms of React patterns

---

## 5. State Management Best Practices

### Use Context Selectively
- ❌ **Don't:** Use context for everything (like using a fire hose to water a bonsai tree)
- ❌ **Don't:** Put every setting in one giant context
- ✅ **Do:** Have smaller contexts for specific cases (settings, users, theme)
- Context can quickly trigger unnecessary rerenders across entire component tree

### Use Proper State Management Libraries
**Recommended Libraries:**
- **Jotai** - Atomic state management
- **Zustand** - Most popular state management currently
- Both offer great performance
- Different implementations - try both to find your preference

---

## 6. Memory Leak Prevention

### Common Memory Leak Sources
- Event listeners not closed
- Intervals never cleared
- WebSocket connections never closed
- Async operations never cancelled
- Not using cleanup in `useEffect`

### Solutions
- Always use cleanup functions in `useEffect`
- Code might be longer, but necessary to prevent leaks
- Mobile apps stay in memory much longer than websites
- Small leaks compound over time → sluggish app or complete crashes
- Use profiling tools to identify JS memory leaks

**Important:** Write decent JavaScript/TypeScript code - there's no excuse.

---

## 7. Performance Measurement Tools

### React Native Profiling Documentation
- In-depth official documentation
- Learn to use regular React Native debugging tools

### Flashlight
- Generates performance score (like Lighthouse for browsers)
- Currently Android only (iOS support in development)

### Sentry Tracing
- Use in both front-end and back-end
- See full traces and pinpoint problems
- Identify slow API calls and database queries
- Include spans in your application
- Track specific operations

**Key Principle:** Measure first, optimize later. Always start with profiling.

---

## 8. Component Best Practices (2026)

### Prefer Pressable over TouchableOpacity
- ❌ **Stop using:** `TouchableOpacity` (outdated)
- ✅ **Use:** `Pressable` (comes with React Native)
- More events available: `onPressIn`, `onPressOut`, `onLongPress`
- More versatile and customizable

**Recommended Package:** `Presto` by Enso
- Abstraction from Pressable
- Automatic haptics and animations
- Configure haptics at entry point
- Can disable per-instance if needed

### Use Platform File Extensions
❌ **Avoid:** Runtime platform checks everywhere
```javascript
// Bad: Runtime checks
if (Platform.OS === 'ios') {
  // iOS code
}
```

✅ **Use:** Platform-specific files
```
ProfileScreen.tsx          // Default for all platforms
ProfileScreen.ios.tsx      // iOS-specific
ProfileScreen.android.tsx  // Android-specific
ProfileScreen.native.tsx   // iOS + Android
ProfileScreen.web.tsx      // Web-specific
```
- Easier to understand and maintain
- Better for native functionality (e.g., Expo UI Swift)
- Scales better as app grows

### Prefer Form Sheets over Modals (iOS)
- ✅ **Use:** Presentation form sheets instead of modals
- Beautiful blur background with liquid glass effect (iOS 18+)
- Can constrain detents (e.g., 45% of screen)
- User can expand/collapse
- More native feel than modal views
- Works on Android (present as modal with slide-from-bottom animation)

### Prefer FlatList over ScrollView
**When to use ScrollView:**
- Short, known lists (e.g., 3-4 items)

**When to use FlatList/LegendList:**
- Data from APIs
- Long lists
- Unknown list lengths

**FlatList Benefits:**
- `ListEmptyComponent` - automatically render when array is empty
- `ListHeaderComponent` - sticky headers
- Many other helpful properties
- Better performance for large datasets

**Pro Tip:** Use `contentInsetAdjustmentBehavior="automatic"` instead of wrapping in `SafeAreaView`
- Works with both `ScrollView` and `FlatList`
- Respects large headers on iOS
- Content fits nicely within scroll area

### Keep App Routes Lean
**With Expo Router:**
- Keep files in `/app` folder focused on routing only
- Don't add logic, state, data fetching in route files
- Import screen components from `/components` or `/screens`

```typescript
// Good: app/paywall.tsx
export default function PaywallRoute() {
  return <PaywallScreen />;
}

// Bad: app/paywall.tsx
export default function PaywallRoute() {
  const [data, setData] = useState();
  // lots of logic here...
}
```

**Benefits:**
- Easy refactoring
- Can reuse screens in multiple routes
- Present in different ways if needed
- Simpler navigation updates
- Easier to maintain and scale

---

## 9. Understanding JavaScript vs UI Thread

### Thread Responsibilities

**JavaScript Thread (Yellow):**
- Where React code lives
- Logic, state updates, API calls
- Decides what should be shown
- Doesn't draw anything on UI

**UI Thread (Blue/Main Thread):**
- Handles everything you see
- Rendering views
- Handling touches
- Running animations
- All visuals

### How Threads Work Together
1. JavaScript thread processes events (button press, state change)
2. JavaScript thread sends render request to UI thread
3. UI thread repaints/refreshes the UI
4. User sees the update

**Performance Issue:** If you block JavaScript thread with heavy computation, entire app freezes.

---

## 10. React Compiler (Expo SDK 54+)

### Enabling/Disabling
```json
// app.json
{
  "experiments": {
    "reactCompiler": true  // true by default in SDK 54+
  }
}
```

### What It Does
- Automatically prevents unnecessary re-renders
- Memoizes components and functions
- Works without manual `useMemo` or `useCallback`
- Significantly improves performance

### Health Check
```bash
npx react-compiler-healthcheck@latest
```
- Checks if your project can adopt React compiler
- Identifies issues preventing adoption

### VS Code Extension
**React Compiler Marker:**
- Shows if components are optimized for React compiler
- Real-time feedback while coding
- Helps identify issues immediately

---

## 11. Multi-Threading with React Native Worklets

### What Are Worklets?
- Similar to Web Workers
- Allow multi-threading in React Native
- Offload heavy computations to separate thread
- Keep app responsive during heavy tasks

### Basic Usage
```typescript
import { createWorkletRuntime, runOnRuntime } from 'react-native-worklets';

// Create runtime
const workerRuntime = createWorkletRuntime('worker', () => {
  console.log('Worker runtime initialized');
});

// Run heavy computation
runOnRuntime(workerRuntime, () => {
  'worklet'; // Required directive
  // Heavy computation here
  // This runs on separate thread
});
```

### Benefits
- JavaScript thread stays free
- App remains responsive
- Heavy computations don't block UI
- Perfect for:
  - Real-time data processing
  - Math-heavy logic
  - Image processing
  - Complex calculations

### How It Works
1. User triggers action (e.g., button press)
2. Event received in JS thread
3. Heavy task offloaded to worklet thread
4. Worklet thread processes (may be blocked)
5. JS thread continues processing other tasks
6. UI thread remains responsive
7. Result sent back to JS thread
8. State updated and UI refreshed

---

## 12. Best Practices Checklist

### Code Quality
- ✅ Use TypeScript
- ✅ Use static JavaScript features (`const`, `let`, not `var`)
- ✅ Use `import`/`export` (not `require` except for assets)
- ✅ Enable ESLint and static analysis
- ✅ Write decent React code first

### Performance
- ✅ Test on real devices (not simulator)
- ✅ Use React compiler (SDK 54+)
- ✅ Use latest APIs (e.g., `use` hook instead of custom context hooks)
- ✅ Minimize startup work
- ✅ Lazy load features
- ✅ Avoid blocking UI thread
- ✅ Use proper list components (FlashList/LegendList)
- ✅ Choose appropriate state management

### Measurement
- ✅ Profile first, optimize later
- ✅ Use React Native DevTools
- ✅ Use Sentry tracing
- ✅ Use Flashlight (Android)
- ✅ Know your numbers (measure improvements)
- ✅ Track performance metrics

---

## Performance Goals

**60 FPS** - The threshold at which your app feels truly native
- Better user reviews
- Longer session times
- Fewer abandoned interactions
- More engaged users

**Remember:** Performance isn't just about speed - it's about user experience and retention.

