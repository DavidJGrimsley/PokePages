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
    <View className="flex-1 justify-center items-center bg-app-background">
      <Animated.View 
        style={{
          transform: [{ scale: isScaled ? 5 : 1 }],
          transitionProperty: 'transform',
          transitionDuration: '1000ms',
          transitionTimingFunction: 'ease-in-out',
          // Add these for better web compatibility
          willChange: 'transform', // Hint to browser for optimization
        }}
      >
        <Text className="text-6xl font-modak text-app-primary select-none drop-shadow-lg">
          PP
        </Text>
      </Animated.View>
    </View>
  );
}