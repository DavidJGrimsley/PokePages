import React, { type PropsWithChildren, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useSharedValue,
  Extrapolation,
} from 'react-native-reanimated';

import { ThemedView } from 'components/TextTheme/ThemedView';
import { ThemedText } from 'components/TextTheme/ThemedText';
import { useBottomTabOverflow } from 'components/UI/TabBarBackground';
import { useColorScheme } from '~/hooks/useColorScheme';
import { Footer } from '../Meta/Footer';

// Safely import scroll context hook
import { useScrollContext } from '../../app/(drawer)/guides/_layout';

const HEADER_HEIGHT = 350;

type Props = PropsWithChildren<{
  headerBackgroundColor: { dark: string; light: string };
  showsVerticalScrollIndicator?: boolean;
  backgroundGrid?: ReactNode; // Optional background grid
  headerHeight?: number; // Optional header height
  titleElement?: ReactNode; // Optional title/logo element
  spinningElement?: ReactNode; // Optional spinning element
  subTitles?: string[]; // Optional array of subtitle texts
}>;

export default function MultiLayerParallaxScrollView({
  children,
  headerBackgroundColor,
  showsVerticalScrollIndicator = false,
  backgroundGrid,
  titleElement,
  spinningElement,
  subTitles = [],
  headerHeight = HEADER_HEIGHT,
}: Props) {
  // Calculate dynamic height based on titles array
  const titleHeight = 100; // Approximate height of one title
  const dynamicHeaderHeight = headerHeight + (subTitles.length > 0 ? subTitles.length * titleHeight : 0);
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useSharedValue(0);
  const bottom = useBottomTabOverflow();

  // Get scroll context (returns null if not in context)
  const scrollContext = useScrollContext();

  // Scroll handler to track scroll position
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollOffset.value = event.contentOffset.y;
      
      // Update parent scroll context when scrolling
      if (scrollContext?.scrollY && scrollContext?.lastScrollY) {
        scrollContext.lastScrollY.value = scrollContext.scrollY.value;
        scrollContext.scrollY.value = event.contentOffset.y;
      }
    },
  });

  // Remove the old useAnimatedReaction since we're handling it in scrollHandler now

  // Layer 1: Background grid (slowest)
  const gridBackgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-600, 0, 600],
            [-150, 0, 150],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-600, 0, 600],
            [1.2, 1, 1.2],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  // Layer 2: Title/logo (medium speed)
  const titleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-600, 0, 200, 600],
            [-300, 0, 300, -300],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-600, 0, 600],
            [0.8, 1, 0.8],
            Extrapolation.CLAMP
          ),
        },
      ],
      opacity: interpolate(
        scrollOffset.value,
        [-600, 0, 300],
        [0, 1, 0.1],
        Extrapolation.CLAMP
      ),
    };
  });
  // Layer 2.5: Title/logo (medium speed)
  const subTitleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-600, 0, 600],
            [-300, 0, 300],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-600, 0, 600],
            [0.8, 1, 0.8],
            Extrapolation.CLAMP
          ),
        },
      ],
      opacity: interpolate(
        scrollOffset.value,
        [-600, 0, 300],
        [0, 1, 0.1],
        Extrapolation.CLAMP
      ),
    };
  });

  // Layer 3: Floating particles (fast)
  const particleFieldAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-600, 0, 600],
            [-450, 0, 450],
            Extrapolation.CLAMP
          ),
        },
        {
          rotate: interpolate(
            scrollOffset.value,
            [-600, 0, 600],
            [-15, 0, 15],
            Extrapolation.CLAMP
          ) + 'deg',
        },
      ],
    };
  });

  // Layer 4: Main floating element (fastest)
  const floatingElementAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-600, 0, 600],
            [-600, 0, 600],
            Extrapolation.CLAMP
          ),
        },
        {
          rotate: interpolate(
            scrollOffset.value,
            [-600, 0, 600],
            [180, 0, -180],
            Extrapolation.CLAMP
          ) + 'deg',
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-600, 0, 600],
            [0.5, 1, 0.5],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  // Default floating particles
  const defaultParticles = ['⭐', '✨', '💫', '💫', '⭐', '✨', '💫'];

  return (
    <View style={{ flex: 1 }}>
      <Animated.ScrollView
        ref={scrollRef}
        onScroll={scrollHandler}
        style={{ flex: 1 }} 
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        scrollEnabled={true}
      >
        <View
          style={{
            height: dynamicHeaderHeight, 
            backgroundColor: headerBackgroundColor[colorScheme],
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Layer 1: Background grid (slowest parallax) */}
          {backgroundGrid && (
            <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              <Animated.View
                style={[
                  { height: '120%', width: '120%', position: 'absolute', top: -50, left: -50, opacity: 0.4 },
                  gridBackgroundAnimatedStyle
                ]}
              >
                {backgroundGrid}
              </Animated.View>
            </View>
          )}
          
          {/* Layer 2: Title/logo (medium parallax) */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <Animated.View
              style={[
                { position: 'absolute', top: '15%', left: '5%', right: '5%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
                titleAnimatedStyle
              ]}
            >
              {titleElement && (
                <View className="mb-8">
                  {titleElement}
                </View>
              )}
              
            </Animated.View>
          </View>
          
          {/* Layer 2.5: Title/logo (medium parallax) */}
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <Animated.View
              style={[
                { position: 'absolute', top: '55%', left: '5%', right: '5%', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
                subTitleAnimatedStyle
              ]}
            >
              {subTitles && (
             
              <View className="space-y-9 items-center mb-9">
                {subTitles.map((subTitle, index) => (
                  <ThemedText 
                    key={index}
                    type="title" 
                    className="text-4xl font-bold text-white text-center leading-tight"
                    style={{
                      textShadowColor: 'rgba(0, 0, 0, 0.7)',
                      textShadowOffset: { width: 2, height: 2 },
                      textShadowRadius: 4,
                    }}
                  >
                    {subTitle}
                  </ThemedText>
                ))}
              </View>
              )}
            </Animated.View>
          </View>
          
          {/* Layer 3: Floating particles (fast parallax) */}
          <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, particleFieldAnimatedStyle]}>
              {defaultParticles.map((particle, i) => (
                <View key={i} style={{ position: 'absolute', left: `${15 + i * 12}%`, top: `${20 + (i % 3) * 25}%` }}>
                  <ThemedText style={{ fontSize: 16, opacity: 0.7 }}>
                    {particle}
                  </ThemedText>
                </View>
              ))}
            </Animated.View>
          </View>
          
          {/* Layer 4: Main spinning element (fastest parallax) */}
          {spinningElement && (
            <View  style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
              <Animated.View
                style={[
                  { height: 200, width: 200, position: 'absolute', top: 20, right: 20 },
                  floatingElementAnimatedStyle
                ]}
              >
                {spinningElement}
              </Animated.View>
            </View>
          )}
        </View>
        
        {/* Content area */}
        <ThemedView className="p-8" style={{ gap: 16 }}>
          {children}
          <Footer />
        </ThemedView>
      </Animated.ScrollView>
    </View>
  );
}
