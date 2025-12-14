import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { cn } from '@/src/utils/cn';

interface DualCollapsibleRowProps {
  leftTitle: string;
  leftIcon: string;
  leftContent: React.ReactNode;
  leftBgColor?: string;
  leftBorderColor?: string;
  rightTitle: string;
  rightIcon: string;
  rightContent: React.ReactNode;
  rightBgColor?: string;
  rightBorderColor?: string;
}

type ExpandedCard = 'none' | 'left' | 'right';

export function DualCollapsibleRow({
  leftTitle,
  leftIcon,
  leftContent,
  leftBgColor = 'bg-green-50',
  leftBorderColor = 'border-green-500',
  rightTitle,
  rightIcon,
  rightContent,
  rightBgColor = 'bg-blue-50',
  rightBorderColor = 'border-blue-500',
}: DualCollapsibleRowProps) {
  const [expanded, setExpanded] = useState<ExpandedCard>('none');

  // Shared values for animations
  const leftWidth = useSharedValue(50);
  const rightWidth = useSharedValue(50);
  const leftOpacity = useSharedValue(1);
  const rightOpacity = useSharedValue(1);
  const leftContentHeight = useSharedValue(0);
  const rightContentHeight = useSharedValue(0);

  const handleLeftPress = () => {
    if (expanded === 'left') {
      // Collapse left
      leftContentHeight.value = withTiming(0, { duration: 200 });
      setTimeout(() => {
        leftWidth.value = withSpring(50);
        rightWidth.value = withSpring(50);
        leftOpacity.value = withTiming(1, { duration: 200 });
        rightOpacity.value = withTiming(1, { duration: 200 });
        setExpanded('none');
      }, 200);
    } else {
      // Expand left
      setExpanded('left');
      leftWidth.value = withSpring(100);
      rightWidth.value = withSpring(0);
      leftOpacity.value = withTiming(1, { duration: 200 });
      rightOpacity.value = withTiming(0, { duration: 200 });
      setTimeout(() => {
        leftContentHeight.value = withSpring(1);
      }, 300);
    }
  };

  const handleRightPress = () => {
    if (expanded === 'right') {
      // Collapse right
      rightContentHeight.value = withTiming(0, { duration: 200 });
      setTimeout(() => {
        leftWidth.value = withSpring(50);
        rightWidth.value = withSpring(50);
        leftOpacity.value = withTiming(1, { duration: 200 });
        rightOpacity.value = withTiming(1, { duration: 200 });
        setExpanded('none');
      }, 200);
    } else {
      // Expand right
      setExpanded('right');
      rightWidth.value = withSpring(100);
      leftWidth.value = withSpring(0);
      rightOpacity.value = withTiming(1, { duration: 200 });
      leftOpacity.value = withTiming(0, { duration: 200 });
      setTimeout(() => {
        rightContentHeight.value = withSpring(1);
      }, 300);
    }
  };

  const leftAnimatedStyle = useAnimatedStyle(() => ({
    width: `${leftWidth.value}%`,
    opacity: leftOpacity.value,
  }));

  const rightAnimatedStyle = useAnimatedStyle(() => ({
    width: `${rightWidth.value}%`,
    opacity: rightOpacity.value,
  }));

  const leftContentStyle = useAnimatedStyle(() => ({
    maxHeight: leftContentHeight.value === 0 ? 0 : 1000,
    opacity: leftContentHeight.value,
    overflow: 'hidden',
  }));

  const rightContentStyle = useAnimatedStyle(() => ({
    maxHeight: rightContentHeight.value === 0 ? 0 : 1000,
    opacity: rightContentHeight.value,
    overflow: 'hidden',
  }));

  return (
    <View className="flex-row gap-2 mb-4">
      {/* Left Card */}
      <Animated.View style={leftAnimatedStyle}>
        <Pressable
          onPress={handleLeftPress}
          className={cn(
            'border-2 rounded-lg p-4',
            leftBgColor,
            leftBorderColor
          )}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base font-bold text-app-text flex-1">
              {leftIcon} {leftTitle}
            </Text>
            <Text className="text-lg">
              {expanded === 'left' ? '▼' : '▶'}
            </Text>
          </View>

          <Animated.View style={leftContentStyle}>
            {leftContent}
          </Animated.View>
        </Pressable>
      </Animated.View>

      {/* Right Card */}
      <Animated.View style={rightAnimatedStyle}>
        <Pressable
          onPress={handleRightPress}
          className={cn(
            'border-2 rounded-lg p-4',
            rightBgColor,
            rightBorderColor
          )}
        >
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base font-bold text-app-text flex-1">
              {rightIcon} {rightTitle}
            </Text>
            <Text className="text-lg">
              {expanded === 'right' ? '▼' : '▶'}
            </Text>
          </View>

          <Animated.View style={rightContentStyle}>
            {rightContent}
          </Animated.View>
        </Pressable>
      </Animated.View>
    </View>
  );
}
