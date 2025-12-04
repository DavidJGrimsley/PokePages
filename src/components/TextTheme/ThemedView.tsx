import { View, type ViewProps } from 'react-native';
import { useThemeColor } from '~/hooks/useThemeColor';
import { cn } from '~/utils/cn';

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  className?: string;
};

export function ThemedView({ style, lightColor, darkColor, className, ...otherProps }: ThemedViewProps) {
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background');

  return (
    <View 
      className={cn('bg-app-background dark:bg-dark-app-background', className)} 
      style={[
        // Only apply custom backgroundColor if lightColor or darkColor is specified
        (lightColor || darkColor) && { backgroundColor },
        style
      ]} 
      {...otherProps} 
    />
  );
}

// ReverseThemedView uses opposite colors - dark background in light mode, light background in dark mode
export function ReverseThemedView({ style, lightColor, darkColor, className, ...otherProps }: ThemedViewProps) {
  // Reverse the color mapping
  const backgroundColor = useThemeColor({ light: darkColor, dark: lightColor }, 'background');

  return (
    <View 
      className={cn('bg-dark-app-background dark:bg-app-background', className)} 
      style={[
        // Only apply custom backgroundColor if lightColor or darkColor is specified
        (lightColor || darkColor) && { backgroundColor },
        style
      ]} 
      {...otherProps} 
    />
  );
}
