import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

const Loading = () => {
  const scaleAnim = useRef(new Animated.Value(1)).current; // Animation value for scaling

  useEffect(() => {
    // Create a loop animation for scaling
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.5, // Scale up to 1.5x
          duration: 1000, // 1 second
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1, // Scale back to original size
          duration: 1000, // 1 second
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [scaleAnim]);

  return (
    <View className="flex-1 justify-center items-center">
      <Animated.Text
        className="text-6xl text-purple-900"
        style={{ 
          transform: [{ scale: scaleAnim }],
          fontFamily: 'Molle',
          textShadowColor: '#959F5C',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 20,
        }}
      >
        TA
      </Animated.Text>
    </View>
  );
};

export default Loading;