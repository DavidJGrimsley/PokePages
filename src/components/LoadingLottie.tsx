import React, { type ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import LottieView from 'lottie-react-native';

type LottieSource = ComponentProps<typeof LottieView>['source'];

export type LoadingLottieProps = {
  // Pass require('.../animation.json') or { uri: 'https://...' }
  source: LottieSource;
  autoPlay?: boolean;
  loop?: boolean;
  size?: number; // square size in px
};

const LoadingLottie: React.FC<LoadingLottieProps> = ({
  source,
  autoPlay = true,
  loop = true,
  size = 140,
}) => {
  return (
    <View style={styles.container}>
      <LottieView
        autoPlay={autoPlay}
        loop={loop}
        style={{ width: size, height: size }}
        source={source}
      />
    </View>
  );
};

export default LoadingLottie;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
