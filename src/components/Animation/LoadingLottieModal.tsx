import React from 'react';
import { View, Text, Modal, Platform } from 'react-native';
import LottieView from 'lottie-react-native';

interface LoadingLottieModalProps {
  visible: boolean;
  message?: string;
}

const isWeb = Platform.OS === 'web';

export default function LoadingLottieModal({ visible, message }: LoadingLottieModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
    >
      <View className="flex-1 bg-black/50 justify-center items-center">
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl items-center min-w-[320px]">
          <View style={{
            width: 250,
            height: 250,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <LottieView
              source={isWeb ? require('../../../assets/lottie/stars.json') : require('../../../assets/lottie/loading.json')}
              autoPlay
              loop
              style={{
                width: 250,
                height: 250,
              }}
              // Web-specific optimization for sharp rendering
              {...(isWeb && {
                rendererSettings: {
                  preserveAspectRatio: 'xMidYMid meet',
                  progressiveLoad: false,
                  hideOnTransparent: true,
                },
              })}
            />
          </View>
          {message && (
            <Text className="typography-body text-center mt-4 text-gray-700 dark:text-gray-300 font-semibold">
              {message}
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
}