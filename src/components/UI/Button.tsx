import { forwardRef } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, Pressable, PressableProps, View, ViewStyle } from 'react-native';
import { cn } from 'utils/cn';

type ButtonProps = {
  title?: string;
  variant?: 'touch' | 'press';
  style?: ViewStyle | ViewStyle[] | ((state: { pressed: boolean }) => ViewStyle | ViewStyle[]);
  className?: string;
} & Omit<(TouchableOpacityProps | PressableProps), 'style' | 'className'>;

export const Button = forwardRef<View, ButtonProps>(({ title, variant = 'touch', style, className, ...touchableProps }, ref) => {
  const baseClassName = "items-center bg-purple-900 rounded-lg flex-row justify-center p-4 shadow-lg";

  if (variant === 'press') {
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
        <Text className="color-white text-center font-mono text-xs">{title}</Text>
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
      <Text className="color-white text-center font-mono text-xs">{title}</Text>
    </TouchableOpacity>
  );
});

Button.displayName = 'Button';
