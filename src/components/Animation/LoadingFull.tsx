import React from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';

export default function LoadingFull() {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#E6e6fa',
    }}>
      <LottieView
        source={require('../../../assets/lottie/loading.json')}
        autoPlay
        loop
        style={{
          width: 200,
          height: 200,
        }}
      />
    </View>
  );
}