// src/components/shared/BorderMask.tsx
import React, { ReactNode, useEffect } from 'react';
import {
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ViewProps,
} from 'react-native';
import Svg, { Rect, Defs, Mask, G, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

// react-native-reanimated + react-native-svg typing is awkward; use any to allow animatedProps
const AnimatedRect: any = Animated.createAnimatedComponent(Rect as any);

export interface BorderMaskProps {
  children: ReactNode;
  borderWidth?: number; // px
  borderRadius?: number; // px
  borderColor?: string;
  glowColor?: string; // main band color (center of gradient)
  glowColorSecondary?: string; // secondary band color (edges of gradient)
  bandOpacity?: number; // opacity of the sweeping band
  bandWidthMultiplier?: number; // multiplier for band width (default 2.2)
  shineSpeed?: number; // ms for one sweep
  showShine?: boolean;
  style?: StyleProp<ViewStyle> & ViewProps;
  // Optionally provide external sharedValue (0..1) to control sweep; if omitted internal animation runs
  externalShine?: SharedValue<number>;
  // width / height are optional — component will size to parent; svg uses viewBox to scale
  svgViewBoxSize?: number;
}

/**
 * BorderMask
 *
 * Implementation notes:
 * - We draw a rounded rect stroke as the mask path (stroke-only).
 * - Under the mask we render a very wide rectangular gradient band and animate its x position.
 * - The mask ensures only the stroke (ring) shows the band -> the band visually hugs the border.
 *
 * Works on both native and web because it only uses react-native-svg and Animated animatedProps.
 */
export const BorderMask: React.FC<BorderMaskProps> = ({
  children,
  borderWidth = 4,
  borderRadius = 12,
  borderColor = 'rgba(255,255,255,0.08)',
  glowColor = 'rgba(255,255,255,0.95)',
  glowColorSecondary,
  bandOpacity = 0.9,
  bandWidthMultiplier = 2.2,
  shineSpeed = 1600,
  showShine = true,
  style,
  externalShine,
  svgViewBoxSize = 100,
}) => {
  // no-op flag (kept for future platform tweaks)

  // Internal shared value (0..1) if user doesn't pass external one
  const internal = useSharedValue(0);
  const shine = externalShine ?? internal;

  useEffect(() => {
    if (showShine) {
      // loop animation 0 -> 1 repeatedly with constant speed (no ease in/out)
      shine.value = withRepeat(
        withTiming(1, { duration: shineSpeed, easing: Easing.linear }),
        -1,
        false
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shineSpeed, showShine]);

  /**
   * Animated props for the sweeping band rectangle
   * We animate the 'x' attribute of the Rect in viewBox coordinates.
   *
   * Strategy:
   * - Use a very wide band width (e.g. 250 viewBox units) and start it left of the viewport.
   * - x moves from -bandWidth to +svgViewBoxSize (ensuring seamless wrap-around).
   * - This way when the trailing edge exits, the leading edge is already entering.
   *
   * If you change svgViewBoxSize, the math below still works because it's relative.
   */
  const bandWidth = svgViewBoxSize * bandWidthMultiplier; // configurable band width
  const bandStart = -bandWidth; // start completely off-screen to the left
  const bandEnd = svgViewBoxSize; // end when leading edge exits right

  const animatedBandProps = useAnimatedProps(() => {
    // map 0..1 to bandStart..bandEnd
    const x = bandStart + (bandEnd - bandStart) * (shine.value ?? 0);
    return {
      x,
      // opacity might be toggled for pulses; keep constant for now
      opacity: showShine ? bandOpacity : 0,
    } as any;
  });

  /**
   * SVG mask id (uniqueish) — ensure it won't collide if multiple components are on page
   * Using a stable literal here is fine for most apps; you can add a prop for unique id if needed.
   */
  const maskId = 'bordermask-mask';
  const primary = 'rgba(163, 62, 161, 0.7)'; // #A33EA1 - TYPE_POISON / APP_PRIMARY
  const secondary = 'rgba(249, 85, 135, 0.8)'; // #F95587 - TYPE_PSYCHIC / APP_SECONDARY
  const white = 'rgba(251, 251, 251, 0.5)'; // #fbfbfb - WHITE
  const lavendar = 'rgba(230, 230, 250, 0.5)'; // #E6e6fa - LAVENDER  
  const flag = 'rgb(245, 119, 28, 0.7)'; // #FFCC00 - TYPE_FIRE / APP_FLAG
  
  /**
   * Layout notes:
   * - We render an <Svg> that covers the full area (absoluteFill). The Svg uses viewBox `0 0 svgViewBoxSize svgViewBoxSize`
   * - Inside the <Defs> we create a <Mask> with a <Rect> stroke-only (fill="none", stroke="white", strokeWidth)
   * - Under the Mask we draw:
   *     1) A base rect that paints the fallback borderColor (thin stroke visible when band is faint)
   *     2) An AnimatedRect (the moving wide band) filled with a linear gradient (via <Defs>/<LinearGradient>)
   * - On top of the Svg we render children (so content overlays the border ring).
   */

  return (
    <View style={[styles.container, style]}>
      {/* SVG layer that renders the masked band + base stroke */}
      <View style={StyleSheet.absoluteFill}>
        <Svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${svgViewBoxSize} ${svgViewBoxSize}`}
          preserveAspectRatio="none"
        >
          <Defs>
            {/* Mask: stroke-only rounded rect (stroke visible -> mask shows only stroke) */}
            <Mask id={maskId} x="0" y="0" width="100%" height="100%">
              {/* Rect with stroke in the mask - white stroke area will be visible */}
              <Rect
                x="0"
                y="0"
                width={svgViewBoxSize}
                height={svgViewBoxSize}
                rx={(borderRadius * svgViewBoxSize) / 100}
                ry={(borderRadius * svgViewBoxSize) / 100}
                fill="none"
                stroke="white"
                strokeWidth={borderWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Mask>

            {/* LinearGradient used by the band; left->right fade */}
            <SvgLinearGradient id="bandGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="transparent" stopOpacity="0" />
              <Stop offset="10%" stopColor={primary} stopOpacity="100" />
              <Stop offset="20%" stopColor={white} stopOpacity={bandOpacity} />
              <Stop offset="40%" stopColor={flag} stopOpacity="100" />
              <Stop offset="60%" stopColor={lavendar} stopOpacity={bandOpacity} />
              <Stop offset="80%" stopColor={secondary} stopOpacity={bandOpacity} />
              <Stop offset="90%" stopColor={primary} stopOpacity="100" />
              <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </SvgLinearGradient>
          </Defs>

          

          {/* Group masked by the stroke: only stroke-area will let this group show */}
          <G mask={`url(#${maskId})`}>
            {/* Massive band rectangle that we translate horizontally via animated props */}
            <AnimatedRect
              // start x will be animated via animatedBandProps
              animatedProps={animatedBandProps}
              y={0}
              width={bandWidth}
              height={svgViewBoxSize}
              fill="url(#bandGradient)"
            />
          </G>
        </Svg>
      </View>

      {/* children on top of border */}
      <View style={[StyleSheet.absoluteFill, { borderRadius, overflow: 'hidden' }]}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
  },
});

export const useBorderShine = (duration = 1600) => {
  const s = useSharedValue(0);
  useEffect(() => {
    s.value = withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false);
  }, [duration, s]);
  return s;
};
