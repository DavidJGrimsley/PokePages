import { forwardRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, TouchableOpacityProps, Pressable, PressableProps, View } from 'react-native';

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
    backgroundColor: '#6366F1',
    borderRadius: 24,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
