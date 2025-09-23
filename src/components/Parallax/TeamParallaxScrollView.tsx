import { ReactNode, useState, type PropsWithChildren } from 'react';
import { View, Dimensions} from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
  Extrapolation,
} from 'react-native-reanimated';

import { ThemedView } from 'components/TextTheme/ThemedView';
import { ThemedText } from 'components/TextTheme/ThemedText';
import { useBottomTabOverflow } from 'components/UI/TabBarBackground';
import { useColorScheme } from '~/hooks/useColorScheme';

const HEADER_HEIGHT = 300;
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

type Props = PropsWithChildren<{
  headerBackgroundColor: { dark: string; light: string };
  backgroundImage?: any; // Optional background image
  headerHeight?: number; // Optional header height
  floatingElement?: ReactNode; // Optional floating element
  titleElement?: ReactNode; // Optional title/logo element
}>;

export default function TeamParallaxScrollView({
  children,
  headerBackgroundColor,
  backgroundImage,
  headerHeight = HEADER_HEIGHT,
  floatingElement,
  titleElement,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();
  const [contentHeight, setContentHeight] = useState(SCREEN_HEIGHT);

  // Layer 1: Background (slowest)
  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-600, 0, 600],
            [-120, 0, 500],
            Extrapolation.CLAMP
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-600, 0, 600],
            [1.1, 1, 1.1],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  // Layer 2: Midground (medium speed) Title Element - moves downward faster and left to right
  const midgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-600, 0, 600],
            [-500, 0, 800], // Moves downward much faster when scrolling down
            Extrapolation.CLAMP
          ),
        },
        {
          translateX: interpolate(
            scrollOffset.value,
            [-600, 0, 600],
            [-100, 0, 1800], // Moves from left to right as you scroll down
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
        [0, 1, 0.1], // Fades out as it scrolls down
        Extrapolation.CLAMP
      ),
    };
  });

  // Layer 3: Dev icons (fast) - moves in reverse direction
  const devIconFieldAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-600, 0, 600],
            [400, 0, -600], // Moves in reverse direction (upward when scrolling down)
            Extrapolation.CLAMP
          ),
        },
        {
          rotate: interpolate(
            scrollOffset.value,
            [-600, 0, 600],
            [15, 0, -15], // Also reverse the rotation
            Extrapolation.CLAMP
          ) + 'deg',
        },
      ],
    };
  });

  // Layer 4: Floating element (fastest) - Moves dynamically
  const floatingElementAnimatedStyle = useAnimatedStyle(() => {
    const elementWidth = 120;

    const scrollStart = 0;
    const scrollEnd = contentHeight - SCREEN_HEIGHT;

    const verticalMovement = interpolate(
      scrollOffset.value,
      [scrollStart, scrollEnd/3, scrollEnd*2/3, scrollEnd],
      [50, SCREEN_HEIGHT - 100, 50, SCREEN_HEIGHT - 100],
      Extrapolation.CLAMP
    );
    
    const horizontalMovement = interpolate(
      scrollOffset.value,
      [scrollStart, scrollEnd],
      [SCREEN_WIDTH - elementWidth, 20],
      Extrapolation.CLAMP
    );
    
    return {
      transform: [
        {
          translateY: verticalMovement,
        },
        {
          translateX: horizontalMovement,
        },
        {
          rotate: interpolate(
            scrollOffset.value,
            [scrollStart, scrollEnd],
            [0, 360],
            Extrapolation.CLAMP
          ) + 'deg',
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [scrollStart, scrollEnd],
            [2, 0.5],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  // Generic dev icons - can be customized
  const devIcons = ['💻', '⚛️', 'TS', '🔧', '📱', '🌐', '⚡', '🎮'];

  return (
    <View style={{ flex: 1 }}>
      {/* Floating element (if provided) */}
      {floatingElement && (
        <Animated.View
          style={[
            { 
              height: 120, 
              width: 120, 
              position: 'absolute', 
              top: 0,
              left: 0,
              zIndex: 100,
              opacity: 0.7, 
            }, 
            floatingElementAnimatedStyle
          ]}
        >
          {floatingElement}
        </Animated.View>
      )}

      
      <Animated.ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}
        onContentSizeChange={(w, h) => setContentHeight(h)}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
      >
        <View
          style={[
            { 
              height: headerHeight, 
              overflow: 'hidden',
              backgroundColor: headerBackgroundColor[colorScheme] 
            },
          ]}>
          
          {/* Layer 1: Background image (if provided) */}
          {backgroundImage && (
            <Animated.View
              style={[
                { height: '100%', width: '100%', zIndex: 1, opacity: 0.4 },
                backgroundAnimatedStyle
              ]}
            >
              {backgroundImage}
            </Animated.View>
          )}
          {/* Layer 2: Title element (if provided) */}
          {titleElement && (
            <Animated.View style={[
              { position: 'absolute', top: 24, left: 24, zIndex: 101 },
              midgroundAnimatedStyle
            ]}>
             {titleElement}
            </Animated.View>
          )}
          {/* Layer 3: Floating dev icons */}
          <Animated.View 
            style={[
              { 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                zIndex: 2 
              }, 
              devIconFieldAnimatedStyle
            ]}
          >
            {devIcons.map((icon, i) => (
              <View key={i} style={{ 
                position: 'absolute',
                left: `${10 + i * 11}%`, 
                top: `${15 + (i % 4) * 20}%`,
              }}>
                <ThemedText style={{ fontSize: 20, opacity: 0.6 }}>
                  {icon}
                </ThemedText>
              </View>
            ))}
          </Animated.View>
        </View>
        
        <ThemedView className="flex-1 p-8" style={{ gap: 16 }}>
          {children}
        </ThemedView>
      </Animated.ScrollView>
    </View>
  );
}
