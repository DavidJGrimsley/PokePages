import React from 'react'
import { View, Text } from 'react-native'
import LottieView from 'lottie-react-native'

interface SuccessMessageProps {
  title?: string
  message: string
  showAnimation?: boolean
  animationSource?: any
}

export default function SuccessMessage({ 
  title = 'Success!', 
  message, 
  showAnimation = true,
  animationSource 
}: SuccessMessageProps) {
  const defaultAnimationSource = require('../../../assets/lottie/stars.json')
  
  return (
    <View className="items-center p-6 bg-green-50 border border-green-200 rounded-lg">
      {showAnimation && (
        <View className="mb-4">
          <LottieView
            source={animationSource || defaultAnimationSource}
            autoPlay
            loop={false}
            style={{ width: 80, height: 80 }}
          />
        </View>
      )}
      
      <Text className="text-lg font-bold text-green-800 text-center mb-2">
        {title}
      </Text>
      
      <Text className="text-green-700 text-center text-sm leading-5">
        {message}
      </Text>
    </View>
  )
}