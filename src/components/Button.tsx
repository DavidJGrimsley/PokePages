import { forwardRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, Pressable, PressableProps, View } from 'react-native';
import { theme } from '@/constants/style/theme';

type ButtonProps = {
  title?: string;
  variant?: 'touch' | 'press';
} & (TouchableOpacityProps | PressableProps);

export const Button = forwardRef<View, ButtonProps>(({ title, variant = 'touch', style, ...touchableProps }, ref) => {
  if (variant === 'press') {
    return (
      <Pressable 
        ref={ref} 
        {...touchableProps as PressableProps} 
        style={({ pressed }) => [
          styles.button, 
          typeof style === 'function' ? style({ pressed }) : style
        ]}
      >
        <Text style={styles.buttonText}>{title}</Text>
      </Pressable>
    );
  }
  
  return (
    <TouchableOpacity ref={ref} {...touchableProps as TouchableOpacityProps} style={[styles.button, typeof style === 'function' ? style({ pressed: false }) : style]}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
});

Button.displayName = 'Button';

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: theme.colors.light.primary,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: theme.spacing.md,
    shadowColor: theme.shadows.medium.shadowColor,
    shadowOffset: theme.shadows.medium.shadowOffset,
    shadowOpacity: theme.shadows.medium.shadowOpacity,
    shadowRadius: theme.shadows.medium.shadowRadius,
    elevation: theme.shadows.medium.elevation,
  },
  buttonText: {
    color: theme.colors.light.white,
    ...theme.typography.callToAction,
    textAlign: 'center',
  },
});
