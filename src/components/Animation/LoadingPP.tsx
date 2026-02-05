import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

export function LoadingPP() {
  const scale = useSharedValue(1);
  
  useEffect(() => {
    // Start the animation immediately with repeat
    scale.value = withRepeat(
      withTiming(5, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1, // Infinite repeat
      true  // Reverse (scale up and down)
    );
  }, [scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#E6e6fa', // app-background
    }}>
      <Animated.View style={animatedStyle}>
        <Text style={{
          fontSize: 60,
          fontFamily: 'Modak',
          color: '#582a5a', // app-primary
          userSelect: 'none',
        }}>
          PP
        </Text>
      </Animated.View>
    </View>
  );
}