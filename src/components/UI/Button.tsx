import { forwardRef } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, Pressable, PressableProps, View, ViewStyle } from 'react-native';
import { cn } from '~/utils/cn';

type ButtonProps = {
  title?: string;
  variant?: 'touch' | 'press' | 'primary' | 'secondary' | 'accent';
  style?: ViewStyle | ViewStyle[] | ((state: { pressed: boolean }) => ViewStyle | ViewStyle[]);
  className?: string;
} & Omit<(TouchableOpacityProps | PressableProps), 'style' | 'className'>;

export const Button = forwardRef<View, ButtonProps>(({ title, variant = 'primary', style, className, ...touchableProps }, ref) => {
  // Define variant-based classes that match your design system
  const getVariantClasses = (variant: string) => {
    switch (variant) {
      case 'primary':
        return 'bg-app-primary shadow-app-medium';
      case 'secondary':
        return 'bg-app-secondary shadow-app-medium';
      case 'accent':
        return 'bg-app-accent shadow-app-medium';
      case 'touch':
      case 'press':
      default:
        return 'bg-app-primary shadow-app-medium';
    }
  };

  const baseClassName = cn(
    'items-center rounded-lg flex-row justify-center p-md',
    getVariantClasses(variant)
  );

  const textClassName = 'typography-cta text-app-white text-center';

  if (variant === 'press' || (!['primary', 'secondary', 'accent'].includes(variant))) {
    return (
      <Pressable 
        ref={ref} 
        {...touchableProps as PressableProps} 
        style={(state) => (
          typeof style === 'function'
            ? (style as (state: { pressed: boolean }) => ViewStyle | ViewStyle[])(state)
            : style
        )}
        className={cn(baseClassName, className)}
      >
        <Text className={textClassName}>{title}</Text>
      </Pressable>
    );
  }
  
  return (
    <TouchableOpacity 
      ref={ref} 
      {...touchableProps as TouchableOpacityProps} 
      style={typeof style === 'function' ? undefined : style}
      className={cn(baseClassName, className)}
    >
      <Text className={textClassName}>{title}</Text>
    </TouchableOpacity>
  );
});

Button.displayName = 'Button';
