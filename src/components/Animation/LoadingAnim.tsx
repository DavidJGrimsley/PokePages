import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated from 'react-native-reanimated';

export default function Loading() {
  const [isScaled, setIsScaled] = useState(false);
  
  // Start animation immediately and toggle continuously
  useEffect(() => {
    // Start the first animation immediately
    const startAnimation = () => {
      setIsScaled(true);
    };
    
    // Small delay to ensure component is fully mounted
    const startTimeout = setTimeout(startAnimation, 100);
    
    // Set up the repeating interval
    const interval = setInterval(() => {
      setIsScaled(prev => !prev);
    }, 1000);
    
    return () => {
      clearTimeout(startTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#E6e6fa', // app-background
    }}>
      <Animated.View 
        style={{
          transform: [{ scale: isScaled ? 5 : 1 }],
          transitionProperty: 'transform',
          transitionDuration: '1000ms',
          transitionTimingFunction: 'ease-in-out',
          willChange: 'transform',
        }}
      >
        <Text style={{
          fontSize: 60,
          fontFamily: 'Modak',
          color: '#582a5a', // app-primary
          // @ts-ignore - textShadow is valid on web
          userSelect: 'none',
        }}>
          PP
        </Text>
      </Animated.View>
    </View>
  );
}