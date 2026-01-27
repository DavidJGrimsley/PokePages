import React from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { AdConfig } from '~/services/adsService';

interface AdBannerProps {
  /** The ad configuration to display */
  ad: AdConfig;
  
  /** Optional: Custom className for container */
  className?: string;
  
  /** Callback when ad is pressed */
  onPress?: () => void;
  
  /** Callback when info icon is pressed */
  onInfoPress?: () => void;
  
  /** Callback when dismiss icon is pressed */
  onDismiss?: () => void;
  
  /** Animated value for scale/opacity */
  animatedValue?: Animated.Value;
}

/**
 * AdBanner Component
 * 
 * Displays a horizontal banner ad.
 * Minimal and tasteful design that blends with the app's aesthetic.
 * Responsive to parent container width.
 */
export function AdBanner({ ad, className = '', onPress, onInfoPress, onDismiss, animatedValue }: AdBannerProps) {
  const handlePress = () => {
    onPress?.();
  };

  const handleInfoPress = (e: any) => {
    e.stopPropagation();
    onInfoPress?.();
  };

  const handleDismiss = (e: any) => {
    e.stopPropagation();
    onDismiss?.();
  };

  // Gradient colors based on accent color
  const gradientColors: Record<string, [string, string]> = {
    blue: ['#3b82f6', '#1e40af'],
    green: ['#10b981', '#047857'],
    purple: ['#a855f7', '#7e22ce'],
    orange: ['#f97316', '#c2410c'],
    pink: ['#ec4899', '#be185d'],
  };

  const gradient = gradientColors[ad.accentColor] || gradientColors.blue;

  const animatedStyle = animatedValue ? {
    opacity: animatedValue,
    transform: [{
      scale: animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0.8, 1],
      })
    }]
  } : {};

  return (
    <Animated.View 
      className={`${className}`}
      style={[animatedStyle, { width: '100%', maxWidth: 960, alignSelf: 'center', paddingHorizontal: 12 }]}
    >
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={{ width: '100%' }}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="rounded-xl overflow-hidden shadow-app-medium"
        >
          {/* Action icons - Info and Dismiss */}
          <View className="absolute top-2.5 right-2.5 flex-row items-center z-10" style={{ gap: 10 }}>
            <TouchableOpacity
              onPress={handleInfoPress}
              className="bg-white/20 rounded-full p-2"
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="help-circle-outline" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleDismiss}
              className="bg-white/20 rounded-full p-2"
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={22} color="white" />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View className="flex-row items-center p-4 pr-16">
            {/* Icon */}
            <View className="bg-white/20 rounded-full p-3 mr-4">
              <Ionicons 
                name={ad.icon as any} 
                size={28} 
                color="white" 
              />
            </View>

            {/* Text content */}
            <View className="flex-1">
              <Text className="text-white font-bold text-base mb-1">
                {ad.title}
              </Text>
              <Text className="text-white/90 text-sm">
                {ad.tagline}
              </Text>
            </View>
          </View>

          {/* Bottom accent line */}
          <View className="h-1 bg-white/30" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}
