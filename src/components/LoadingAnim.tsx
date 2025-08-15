import React, { useEffect, useRef } from 'react';
import { Animated, ImageBackground, StyleSheet, View } from 'react-native';

import { theme } from '@/constants/style/theme';

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
    // <ImageBackground
    //   source={require('../assets/images/lightsabers3x.jpg')} // Replace with your image URL
    //   style={styles.background}
    // >
      <View style={styles.container}>
        <Animated.Text
          style={[
            theme.typography.logo, // Use the logo typography style
            { transform: [{ scale: scaleAnim }] }, // Apply scaling animation
          ]}
        >
          PP
        </Animated.Text>
      </View>
    // </ImageBackground>
  );
};

export default Loading;

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});