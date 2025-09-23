import React from 'react';
import { theme } from '@/constants/style/theme';
import MaskedView from '@react-native-masked-view/masked-view';
import { StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';


export function MaskText({ text }: { text: string }) {
  return (
    // <View style={styles.container} >
      
      <MaskedView
        style={{ flex: 1, flexDirection: 'row', height: '100%' }}
        maskElement={
          <View
            style={{
              // Transparent background because mask is based off alpha channel.
              backgroundColor: 'transparent',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={theme.typography.display}
            >
              {text}
            </Text>
          </View>
        }
      >
        {/* Shows behind the mask, you can put anything here, such as an image */}
        <Animated.View style={[styles.gradient, {
        animationName: {
          to: {
            transform: [{ rotate: "360deg" }]
          }
        },
        animationDuration: '3s',
        animationIterationCount: 'infinite',
      }]} />
    </MaskedView>
    // </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    experimental_backgroundImage: "linear-gradient(90deg,rgba(88, 42, 90, 1) 0%, rgba(230, 230, 250, 1) 53%, rgba(149, 159, 92, 1) 100%);",
    width: '100%',
    height: '100%',
  },
});

