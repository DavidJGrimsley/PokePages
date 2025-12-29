# Animations with React Native Reanimated

## Overview
PokePages uses **React Native Reanimated** for high-performance animations that run on the UI thread. This avoids jank, keeps 60 FPS, and enables gesture-driven interactions.

## Why Reanimated?
✅ Runs on the UI thread (worklets) → no JS thread blocking
✅ Declarative + imperative APIs
✅ Gesture-driven animations with `react-native-gesture-handler`
✅ Layout animations, shared values, and derived values
✅ Works across iOS, Android, and Web (with Hermes)

## Setup Checklist
- Install Reanimated and Gesture Handler (already in project)
- Enable Reanimated Babel plugin (Expo handles this)
- Keep `react-native-gesture-handler` at the root: `GestureHandlerRootView` in `_layout.tsx`
- Use Hermes engine (default for Expo SDK 50+)

## Core Patterns

### 1) Shared Values (state on UI thread)
```tsx
const progress = useSharedValue(0);
```

### 2) Derived/Animated Styles
```tsx
const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: 1 + progress.value * 0.2 }],
  opacity: 0.6 + progress.value * 0.4,
}));

return <Animated.View style={animatedStyle} />;
```

### 3) Animations
```tsx
progress.value = withTiming(1, { duration: 500 });
progress.value = withSpring(1, { damping: 15, stiffness: 150 });
progress.value = withRepeat(withTiming(1, { duration: 1200 }), -1, true);
```

### 4) Gestures
```tsx
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

const pan = Gesture.Pan()
  .onUpdate((e) => {
    translateX.value = e.translationX;
    translateY.value = e.translationY;
  })
  .onEnd(() => {
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
  });

return (
  <GestureDetector gesture={pan}>
    <Animated.View style={animatedStyle} />
  </GestureDetector>
);
```

### 5) Layout Animations
```tsx
import { FadeIn, FadeOut, Layout } from 'react-native-reanimated';

<Animated.View
  entering={FadeIn.duration(250)}
  exiting={FadeOut.duration(200)}
  layout={Layout.springify()}
>
  {children}
</Animated.View>
```

## Usage Examples in PokePages
- `components/Animation/HelloWave.tsx` uses `useSharedValue`, `withRepeat`, `withSequence`, `withTiming` to drive a looping wave.
- Drawer/tab layouts and guide screens use Reanimated shared values for scroll/gesture-driven UI polish.
- Ensure all animated wrappers use `Animated.View`/`Animated.Text` instead of plain primitives when styles depend on shared values.

## Performance Guidelines
- Prefer Reanimated over `Animated` for complex/interactive animations.
- Keep heavy calculations off the JS thread; do math inside worklets.
- Avoid allocating new objects/functions every frame—derive inside `useAnimatedStyle`.
- Use `withTiming` for deterministic transitions, `withSpring` for natural motion, `withRepeat` for loops.
- Combine with `react-native-gesture-handler` for touch/drag interactions.

## Safety / Gotchas
- Animated styles must be serializable (no functions/Date/Map, etc.).
- Don’t read mutable JS refs inside worklets—use shared values instead.
- When mixing with React state, sync by setting shared values in effects.
- Ensure `GestureHandlerRootView` wraps the app (already in `_layout.tsx`).

## Debugging
- Use the performance monitor to watch UI vs JS thread load.
- If animation janks: check for JS thread blocks (expensive loops, heavy renders).
- Validate that Hermes is enabled (Expo default) for best Reanimated support.

## Quick Patterns
- **Pulse:** `withRepeat(withTiming(1, { duration: 800 }), -1, true)` on scale/opacity.
- **Press feedback:** on press in → `withSpring(0.94)`, on release → `withSpring(1)`.
- **List item mount:** `entering={FadeInDown.springify()}` for cards/rows.
- **Sticky headers:** drive translateY with scroll shared values.

## References
- Official docs: https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/getting-started/
- Gesture Handler: https://docs.swmansion.com/react-native-gesture-handler/docs
