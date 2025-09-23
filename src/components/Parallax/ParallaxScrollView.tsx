import React, { ReactNode } from 'react';
import { Animated, View, ViewStyle, ImageSourcePropType } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cn } from 'utils/cn';
import { useColorScheme } from '~/hooks/useColorScheme';

const HEADER_HEIGHT = 250;

interface ParallaxScrollViewProps {
  headerBackgroundColor: { dark: string; light: string };
  headerImage?: ImageSourcePropType;
  headerHeight?: number;
  titleElement?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: ViewStyle;
}

export default function ParallaxScrollView({
  headerBackgroundColor,
  headerImage,
  headerHeight = HEADER_HEIGHT,
  titleElement,
  children,
  className,
  style,
}: ParallaxScrollViewProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollY = new Animated.Value(0);

  const headerTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, headerHeight * 1.5],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, headerHeight - 100],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight * 2.25],
    extrapolate: 'clamp',
  });

  return (
    <SafeAreaView className={cn('flex-1', className)} style={style}>
      <Animated.ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}>
        <Animated.View
          className="absolute top-0 left-0 right-0 overflow-hidden z-10"
          style={{
            height: headerHeight,
            transform: [{ translateY: headerTranslateY }],
            backgroundColor: headerBackgroundColor[colorScheme],
          }}>
          {headerImage && (
            <Animated.Image
              source={headerImage}
              className="w-full h-full"
              style={{
                transform: [{ translateY: imageTranslateY }],
                resizeMode: 'cover',
              }}
            />
          )}
          {titleElement && (
            <View className="absolute inset-0 flex items-center justify-center z-20">
              {titleElement}
            </View>
          )}
        </Animated.View>
        <View className="pt-64">{children}</View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
