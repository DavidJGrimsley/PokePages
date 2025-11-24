import React, { useState, useEffect } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BorderMask } from '../shared/BorderMask';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';

type HomeCardVariant = 'system' | 'favorite' | 'event';

interface HomeCardProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  path: string;
  variant: HomeCardVariant;
  badge?: string;
  onPress?: () => void;
  showNewFeatureLabel?: boolean;
}

const variantStyles = {
  system: {
    borderColor: '#A33EA100',
    iconColor: '#A33EA1',
    gradientColors: ['rgba(163, 62, 161, 0.06)', 'rgba(0, 0, 0, 0)'] as const,
    borderGlowColor: 'rgba(255, 165, 0, 0.1)',
    borderGlowColorSecondary: 'rgba(163, 62, 161, 0.5)',
  },
  favorite: {
    borderColor: '#FFA50000',
    iconColor: '#FFA500',
    gradientColors: ['rgba(255, 165, 0, 0.06)', 'rgba(0, 0, 0, 0)'] as const,
    borderGlowColor: 'rgba(0,0,0, 1)',
    borderGlowColorSecondary: 'rgba(255, 0, 0, 0.6)',
  },
  event: {
    borderColor: '#EF4444',
    iconColor: '#EE8130',
    gradientColors: ['rgba(239, 68, 68, 0.1)', 'rgba(0, 0, 0, 0)'] as const,
    borderGlowColor: 'rgba(239, 68, 68, 1)',
    borderGlowColorSecondary: 'rgba(255, 150, 150, 0.6)',
  },
};

export const HomeCard: React.FC<HomeCardProps> = ({
  title,
  icon,
  path,
  variant,
  badge,
  onPress,
  showNewFeatureLabel = false,
}) => {
  const styles = variantStyles[variant];
  
  // Interactive animations
  const pressed = useSharedValue(0);
  const [hovered, setHovered] = useState(false);
  
  // Shine sweep animation across card face (triggered on hover)
  const shinePosition = useSharedValue(-150);

  // Continuous border sweep (0..1 loop) for BorderMask
  const borderShine = useSharedValue(0);

  useEffect(() => {
    // Continuous perimeter sweep independent of hover
    borderShine.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
  }, [borderShine]);
  
  // Subtle pulse animation for idle state
  const pulseOpacity = useSharedValue(1);
  
  useEffect(() => {
    // Very subtle breathing pulse animation
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0.75, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Trigger shine animation on hover
  useEffect(() => {
    if (hovered) {
      shinePosition.value = withTiming(150, { duration: 1500, easing: Easing.bezier(0.4, 0, 0.2, 1) });
    } else {
      shinePosition.value = -150;
    }
  }, [hovered, shinePosition]);
  
  // Press animation - removed scale to avoid the smaller square effect
  const pressStyle = useAnimatedStyle(() => ({
    opacity: withSpring(pressed.value ? 0.85 : 1, { stiffness: 200, damping: 15 }),
  }));
  
  // Icon press animation - dramatic scale and rotate
  const iconPressStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(pressed.value ? 1.4 : 1, { stiffness: 300, damping: 10 }) },
      { rotate: withSpring(pressed.value ? '15deg' : '0deg', { stiffness: 300, damping: 10 }) },
    ],
  }));
  
  // Shine animation style
  const shineStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: `${shinePosition.value}%` }],
    opacity: hovered ? 1 : 0,
  }));
  
  // Pulse animation style
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseOpacity.value,
  }));
  
  const handlePressIn = () => {
    pressed.value = 1;
  };
  
  const handlePressOut = () => {
    pressed.value = 0;
  };
  
  const CardContent = (
    <Pressable 
      className="rounded-lg shadow-app-medium overflow-visible"
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={{ 
        width: '100%',
        aspectRatio: Platform.OS !== 'web' ? 1 : undefined,
        minHeight: Platform.OS === 'web' ? 160 : undefined,
      }}
    >
      <Animated.View style={[{ flex: 1, position: 'relative' }, pressStyle]}>
        <BorderMask
          borderWidth={3}
          borderRadius={8}
          borderColor={styles.borderColor}
          glowColor={styles.borderGlowColor}
          glowColorSecondary={styles.borderGlowColorSecondary}
          bandOpacity={0.95}
          bandWidthMultiplier={2.5}
          shineSpeed={1600}
          showShine={true}
          externalShine={borderShine}
          style={{ flex: 1 }}
        >
          {/* More transparent glass background */}
          <Animated.View style={[{ flex: 1, borderRadius: 8, overflow: 'hidden' }, pulseStyle]}>
          <LinearGradient
            colors={[
              `${styles.gradientColors[0]}`,
              `${styles.gradientColors[1]}`,
            ] as const}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          >
          {/* Stronger backdrop blur for liquid glass */}
          {Platform.OS === 'web' && (
            <View 
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backdropFilter: 'blur(12px) saturate(150%)',
                WebkitBackdropFilter: 'blur(12px) saturate(150%)',
                backgroundColor: hovered ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.012)',
              } as any}
            />
          )}
          
          {/* Animated shine sweep */}
          <View 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
              overflow: 'hidden',
              borderRadius: 8,
            }}
          >
            {/* Hover shine effect */}
            <Animated.View 
              style={[
                {
                  position: 'absolute',
                  width: '100%',
                  height: '250%',
                  transform: [{ rotate: '-20deg' }],
                },
                shineStyle,
              ]}
            >
              <LinearGradient
                colors={[
                  'rgba(255,255,255,0)',
                  'rgba(255,255,255,0.05)',
                  'rgba(255,255,255,0.15)',
                  'rgba(255,255,255,0.25)',
                  'rgba(255,255,255,0.15)',
                  'rgba(255,255,255,0.05)',
                  'rgba(255,255,255,0)',
                ]}  
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  flex: 1,
                }}
              />
            </Animated.View>
          </View>
          
          <View className="flex-1 p-md justify-center items-center" style={{ zIndex: 10 }}>
            {/* Icon with optional "New Feature" label */}
            {icon && (
              <Animated.View style={[{ marginBottom: 8, flexDirection: 'row', alignItems: 'center' }, iconPressStyle]}>
                <Ionicons name={icon} size={40} color={styles.iconColor} />
                {showNewFeatureLabel && (
                  <Text className="text-xs font-medium text-app-brown dark:text-dark-app-brown ml-xs">
                    New Feature
                  </Text>
                )}
              </Animated.View>
            )}
            
            {/* Title */}
            <View className="w-full">
              <Text 
                className="typography-cta text-app-accent dark:text-dark-app-accent text-center leading-relaxed" 
                numberOfLines={3}
                style={{ textShadowColor: 'rgba(0, 0, 0, 0.2)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 }}
              >
                {title}
              </Text>
            </View>
            
            {/* Optional Badge */}
            {badge && (
              <View className="bg-red-500 px-sm py-xs rounded-md mt-sm absolute top-2 right-2 shadow-md">
                <Text className="text-app-white text-xs font-bold">{badge}</Text>
              </View>
            )}
            </View>
          </LinearGradient>
        </Animated.View>
        </BorderMask>
      </Animated.View>
    </Pressable>
  );

  if (onPress) {
    return CardContent;
  }

  return (
    <Link href={path as any} asChild>
      {CardContent}
    </Link>
  );
};
