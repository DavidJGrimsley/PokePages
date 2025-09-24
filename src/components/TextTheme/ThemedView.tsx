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
      className={cn('bg-app-background', className)} 
      style={[
        // Only apply custom backgroundColor if lightColor or darkColor is specified
        (lightColor || darkColor) && { backgroundColor },
        style
      ]} 
      {...otherProps} 
    />
  );
}
