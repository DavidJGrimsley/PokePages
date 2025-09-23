import React from 'react';
import { theme } from 'constants/style/theme';
import { View, StyleSheet } from 'react-native';
import Animated from 'react-native-reanimated';


export function BouncyText({ text }: { text: string }) {
  return (
    <View style={styles.container}>
      <Animated.Text 
        style={[theme.typography.display, styles.text, {
          animationName: {
            to: {
              transform: [{ rotate: "5deg" }, { scale: 1.05 }]
            }
          },
          animationDuration: '2s',
          animationIterationCount: 'infinite',
          animationDirection: 'alternate',
        }]}
      >
        {text}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  text: {
    textAlign: 'center',
  },
});


