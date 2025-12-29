# Styling with NativeWind (Tailwind CSS)

## Overview
PokePages uses **NativeWind 4.x** - a utility-first styling system that brings Tailwind CSS to React Native. This provides a consistent, powerful, and developer-friendly way to style components across mobile and web.

## Why NativeWind?

### Advantages
✅ **Familiar syntax** - Use Tailwind classes you already know
✅ **Cross-platform** - Same styles work on iOS, Android, and Web
✅ **Type-safe** - TypeScript autocomplete for class names
✅ **Performance** - Compiled at build time, not runtime
✅ **Responsive design** - Built-in breakpoints for different screen sizes
✅ **Dark mode support** - Easy theme switching
✅ **No StyleSheet.create()** - Cleaner component code
✅ **Variants** - Easy conditional styling
✅ **Custom utilities** - Extend with app-specific classes

## Setup

### Installation
```bash
npm install nativewind@^4.0.0
npm install --save-dev tailwindcss
```

### Configuration Files

**tailwind.config.js**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './App.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Custom color palette
        app: {
          primary: '#EF5350',
          secondary: '#42A5F5',
          background: '#FAFAFA',
          text: '#212121',
          // ...
        },
      },
      fontFamily: {
        modak: ['Modak_400Regular'],
        roboto: ['Roboto_400Regular'],
        'roboto-medium': ['Roboto_500Medium'],
        'roboto-bold': ['Roboto_700Bold'],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
    },
  },
  plugins: [],
};
```

**global.css**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom utilities */
@layer utilities {
  .typography-header {
    @apply text-4xl font-bold tracking-tight;
  }
  
  .typography-subheader {
    @apply text-2xl font-semibold;
  }
  
  .typography-body {
    @apply text-base leading-6;
  }
  
  .typography-caption {
    @apply text-sm text-gray-600 dark:text-gray-400;
  }
}
```

**Import in root layout:**
```typescript
import '@/global.css';
```

## Basic Usage

### Simple Styling
```typescript
import { View, Text, Pressable } from 'react-native';

function Button({ title, onPress }) {
  return (
    <Pressable
      className="bg-blue-500 px-6 py-3 rounded-lg active:bg-blue-600"
      onPress={onPress}
    >
      <Text className="text-white font-semibold text-center">
        {title}
      </Text>
    </Pressable>
  );
}
```

### Common Patterns

#### Flexbox Layouts
```typescript
// Vertical stack
<View className="flex-col gap-4">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</View>

// Horizontal row
<View className="flex-row items-center gap-2">
  <Icon />
  <Text>Label</Text>
</View>

// Center content
<View className="flex-1 justify-center items-center">
  <Text>Centered</Text>
</View>

// Space between
<View className="flex-row justify-between items-center">
  <Text>Left</Text>
  <Text>Right</Text>
</View>
```

#### Spacing
```typescript
// Padding
<View className="p-4">              {/* All sides */}
<View className="px-4 py-2">        {/* Horizontal & vertical */}
<View className="pt-4 pb-2">        {/* Top & bottom */}

// Margin
<View className="m-4">              {/* All sides */}
<View className="mx-auto">          {/* Center horizontally */}
<View className="mt-4 mb-2">        {/* Top & bottom */}

// Gap (for flex children)
<View className="flex-col gap-4">   {/* Vertical gap */}
<View className="flex-row gap-2">   {/* Horizontal gap */}
```

#### Colors
```typescript
// Background
<View className="bg-blue-500">
<View className="bg-app-primary">   {/* Custom color */}

// Text
<Text className="text-white">
<Text className="text-app-text">

// Border
<View className="border-2 border-gray-300">
```

#### Typography
```typescript
<Text className="text-xs">      {/* 12px */}
<Text className="text-sm">      {/* 14px */}
<Text className="text-base">    {/* 16px */}
<Text className="text-lg">      {/* 18px */}
<Text className="text-xl">      {/* 20px */}
<Text className="text-2xl">     {/* 24px */}

<Text className="font-normal">
<Text className="font-medium">
<Text className="font-bold">

<Text className="italic">
<Text className="uppercase">
<Text className="capitalize">
```

## Dark Mode Support

### Enable Dark Mode
```typescript
import { useColorScheme } from 'react-native';

function ThemedView({ children, className = '' }) {
  const colorScheme = useColorScheme();
  
  return (
    <View className={`
      bg-white dark:bg-gray-900
      ${className}
    `}>
      {children}
    </View>
  );
}
```

### Dark Mode Classes
```typescript
<View className="bg-white dark:bg-gray-900">
<Text className="text-gray-900 dark:text-white">
<View className="border-gray-200 dark:border-gray-700">
```

### Custom Dark Mode Hook
```typescript
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);
  
  useEffect(() => {
    setHasHydrated(true);
  }, []);
  
  const colorScheme = useRNColorScheme();
  
  // Prevent flash on web
  if (hasHydrated) {
    return colorScheme;
  }
  
  return 'light';
}
```

## Responsive Design

### Breakpoints
```typescript
<View className="
  w-full           // Mobile: full width
  md:w-1/2         // Tablet: half width
  lg:w-1/3         // Desktop: third width
">
  <Text className="
    text-sm        // Mobile: small text
    md:text-base   // Tablet: base text
    lg:text-lg     // Desktop: large text
  ">
    Responsive text
  </Text>
</View>
```

### Platform-Specific Styles
```typescript
import { Platform } from 'react-native';

<View className={`
  p-4
  ${Platform.OS === 'web' ? 'max-w-screen-xl mx-auto' : ''}
`}>
  {/* Content */}
</View>
```

## Custom Utilities

### Typography Classes
```css
/* global.css */
@layer utilities {
  .typography-header {
    @apply text-4xl font-bold text-app-text dark:text-dark-app-text;
    font-family: 'Modak';
  }
  
  .typography-subheader {
    @apply text-2xl font-semibold text-app-text dark:text-dark-app-text;
  }
  
  .typography-body {
    @apply text-base leading-relaxed text-app-text dark:text-dark-app-text;
  }
  
  .typography-label {
    @apply text-sm font-medium text-gray-700 dark:text-gray-300;
  }
  
  .typography-caption {
    @apply text-xs text-gray-500 dark:text-gray-400;
  }
}
```

Usage:
```typescript
<Text className="typography-header">Page Title</Text>
<Text className="typography-body">Body content...</Text>
```

### Custom Components
```css
@layer components {
  .btn-primary {
    @apply bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold;
    @apply active:bg-blue-600;
  }
  
  .btn-secondary {
    @apply bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold;
    @apply active:bg-gray-300;
  }
  
  .card {
    @apply bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg;
  }
}
```

## Advanced Patterns

### Conditional Classes with cn() Utility
```typescript
import { cn } from '~/utils/cn';

function Button({ variant = 'primary', size = 'medium', className, ...props }) {
  return (
    <Pressable
      className={cn(
        // Base classes
        'rounded-lg font-semibold text-center',
        
        // Variant classes
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-900',
        variant === 'danger' && 'bg-red-500 text-white',
        
        // Size classes
        size === 'small' && 'px-3 py-1.5 text-sm',
        size === 'medium' && 'px-4 py-2 text-base',
        size === 'large' && 'px-6 py-3 text-lg',
        
        // Custom classes
        className
      )}
      {...props}
    />
  );
}
```

### cn() Implementation
```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Dynamic Styles
```typescript
function Card({ isActive, className }) {
  return (
    <View className={cn(
      'p-4 rounded-lg border-2',
      isActive 
        ? 'bg-blue-50 border-blue-500' 
        : 'bg-white border-gray-200',
      className
    )}>
      {/* Content */}
    </View>
  );
}
```

### Animated Styles with Reanimated
```typescript
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

function AnimatedCard() {
  const animatedStyle = useAnimatedStyle(() => ({
    // Reanimated styles
  }));
  
  return (
    <Animated.View 
      className="bg-white p-4 rounded-lg"
      style={animatedStyle}
    >
      {/* Content */}
    </Animated.View>
  );
}
```

## Custom Theme Extension

### Extend Colors
```javascript
// tailwind.config.js
theme: {
  extend: {
    colors: {
      app: {
        primary: '#EF5350',
        secondary: '#42A5F5',
        accent: '#FFA726',
        background: '#FAFAFA',
        'background-dark': '#121212',
        text: '#212121',
        'text-dark': '#FFFFFF',
        error: '#F44336',
        success: '#4CAF50',
        warning: '#FF9800',
      },
      pokemon: {
        normal: '#A8A878',
        fire: '#F08030',
        water: '#6890F0',
        electric: '#F8D030',
        grass: '#78C850',
        // ... all types
      },
    },
  },
}
```

### Extend Spacing
```javascript
spacing: {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px',
},
```

### Custom Shadows
```javascript
boxShadow: {
  'app-small': '0 2px 4px rgba(0, 0, 0, 0.1)',
  'app-medium': '0 4px 8px rgba(0, 0, 0, 0.12)',
  'app-large': '0 8px 16px rgba(0, 0, 0, 0.15)',
},
```

## Performance Tips

### 1. Use className Over Style Prop
```typescript
// ❌ Slower - creates new object each render
<View style={{ padding: 16, backgroundColor: 'blue' }}>

// ✅ Faster - compiled at build time
<View className="p-4 bg-blue-500">
```

### 2. Extract Repeated Classes
```typescript
// ❌ Repeated classes
<View className="bg-white dark:bg-gray-900 p-4 rounded-lg">
<View className="bg-white dark:bg-gray-900 p-4 rounded-lg">

// ✅ Create utility class
// In global.css
.card {
  @apply bg-white dark:bg-gray-900 p-4 rounded-lg;
}

// In component
<View className="card">
```

### 3. Memoize Conditional Classes
```typescript
import { useMemo } from 'react';

function Component({ variant, size }) {
  const className = useMemo(
    () => cn(
      'base-classes',
      variant === 'primary' && 'variant-classes',
      size === 'large' && 'size-classes'
    ),
    [variant, size]
  );
  
  return <View className={className} />;
}
```

## Common Patterns

### Card Component
```typescript
function Card({ children, className, ...props }) {
  return (
    <View 
      className={cn(
        'bg-white dark:bg-gray-800',
        'rounded-xl',
        'p-4',
        'shadow-lg',
        'border border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}
```

### Button Variants
```typescript
const buttonVariants = {
  base: 'px-6 py-3 rounded-lg font-semibold text-center',
  variants: {
    primary: 'bg-blue-500 text-white active:bg-blue-600',
    secondary: 'bg-gray-200 text-gray-900 active:bg-gray-300',
    outline: 'border-2 border-blue-500 text-blue-500 active:bg-blue-50',
    ghost: 'text-blue-500 active:bg-blue-50',
  },
  sizes: {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  },
};
```

### Input Component
```typescript
function Input({ error, className, ...props }) {
  return (
    <TextInput
      className={cn(
        'border-2 rounded-lg px-4 py-2',
        'bg-white dark:bg-gray-800',
        'text-gray-900 dark:text-white',
        error 
          ? 'border-red-500' 
          : 'border-gray-300 dark:border-gray-600',
        className
      )}
      {...props}
    />
  );
}
```

## Migration from StyleSheet

### Before (StyleSheet)
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

<View style={styles.container}>
  <Text style={styles.title}>Title</Text>
</View>
```

### After (NativeWind)
```typescript
<View className="flex-1 p-4 bg-white">
  <Text className="text-2xl font-bold mb-2">Title</Text>
</View>
```

## Debugging

### See Generated Classes
In development, NativeWind logs generated styles:
```typescript
// Enable debug mode
<View className="bg-blue-500" data-tw-debug />
```

### VS Code Extension
Install **Tailwind CSS IntelliSense** for:
- Autocomplete
- Hover previews
- Linting
- Class name suggestions

## Best Practices

1. ✅ **Use semantic class names** - `bg-app-primary` instead of `bg-blue-500`
2. ✅ **Group related classes** - `bg-white p-4 rounded-lg shadow-lg`
3. ✅ **Use cn() for conditional classes** - Cleaner than string templates
4. ✅ **Extract repeated patterns** - Create custom utilities
5. ✅ **Follow Tailwind order** - Layout → spacing → colors → typography
6. ✅ **Use dark mode consistently** - Always provide dark variant
7. ✅ **Mobile-first responsive** - Start with mobile, add `md:` `lg:` breakpoints
8. ❌ **Avoid arbitrary values** - `w-[123px]` (use theme values instead)

## Resources
- [NativeWind Documentation](https://www.nativewind.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind CSS Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
