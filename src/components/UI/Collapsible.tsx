import { PropsWithChildren, useState, useEffect } from 'react';
import { TouchableOpacity, Animated, Easing } from 'react-native';

import { ThemedText } from 'components/TextTheme/ThemedText';
import { ThemedView } from 'components/TextTheme/ThemedView';
import { IconSymbol } from 'components/UI/IconSymbol';
import { useColorScheme } from '~/hooks/useColorScheme';
import colors from 'constants/style/colors';

interface CollapsibleProps extends PropsWithChildren {
  title: string;
  isOpen?: boolean;
  onToggle?: (isOpen: boolean) => void;
  animatedOpen?: boolean;
}

export function Collapsible({ children, title, isOpen: externalIsOpen, onToggle, animatedOpen = false }: CollapsibleProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [rotateAnim] = useState(new Animated.Value(0));
  const [heightAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const [opacityAnim] = useState(new Animated.Value(0));
  const [hasAnimatedOpen, setHasAnimatedOpen] = useState(false);
  
  const isControlledExternally = externalIsOpen !== undefined;
  const isOpen = isControlledExternally ? externalIsOpen : internalIsOpen;
  const theme = useColorScheme() ?? 'light';

  // Initialize animation values properly - start closed
  useEffect(() => {
    if (animatedOpen && isControlledExternally) {
      // Always start closed for animated components
      rotateAnim.setValue(0);
      heightAnim.setValue(0);
      scaleAnim.setValue(0.95);
      opacityAnim.setValue(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  useEffect(() => {
    if (animatedOpen && isControlledExternally) {
      if (isOpen && !hasAnimatedOpen) {
        // First time opening with animation
        setHasAnimatedOpen(true);
        
        // Small delay to ensure the content is rendered first with closed values
        setTimeout(() => {
          // Animate to open state
          Animated.parallel([
            Animated.timing(rotateAnim, {
              toValue: 1,
              duration: 400,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(heightAnim, {
              toValue: 1,
              duration: 600,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: false,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 500,
              easing: Easing.out(Easing.back(1.1)),
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 1,
              duration: 400,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            })
          ]).start();
        }, 50); // Small delay to allow render
      } else if (!isOpen && hasAnimatedOpen) {
        // Reset animations when closed
        setHasAnimatedOpen(false);
        Animated.parallel([
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(heightAnim, {
            toValue: 0,
            duration: 400,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: false,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 300,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          })
        ]).start();
      }
    } else if (!animatedOpen) {
      // For non-animated or internally controlled components
      if (isOpen) {
        rotateAnim.setValue(1);
        heightAnim.setValue(1);
        scaleAnim.setValue(1);
        opacityAnim.setValue(1);
      } else {
        rotateAnim.setValue(0);
        heightAnim.setValue(0);
        scaleAnim.setValue(0.95);
        opacityAnim.setValue(0);
      }
    }
  }, [isOpen, animatedOpen, isControlledExternally, hasAnimatedOpen, rotateAnim, heightAnim, scaleAnim, opacityAnim]);

  const handlePress = () => {
    if (isControlledExternally) {
      onToggle?.(!isOpen);
    } else {
      const newIsOpen = !internalIsOpen;
      setInternalIsOpen(newIsOpen);
      
      // Handle animation for internal control
      if (newIsOpen) {
        Animated.parallel([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.back(1.1)),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();
      } else {
        Animated.parallel([
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 300,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          })
        ]).start();
      }
    }
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <ThemedView>
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
        onPress={handlePress}
        activeOpacity={0.8}>
        <Animated.View
          style={{
            transform: [
              {
                rotate: animatedOpen && isControlledExternally ? rotateInterpolate : (isOpen ? '90deg' : '0deg')
              }
            ]
          }}
        >
          <IconSymbol
            name="chevron.right"
            size={18}
            weight="medium"
            color={theme === 'light' ? colors.light.text : colors.dark.icon}
          />
        </Animated.View>

        <ThemedText type="subtitle">{title}</ThemedText>
      </TouchableOpacity>
      {isOpen && (
        <Animated.View 
          style={[
            { marginTop: 6, marginLeft: 24, overflow: 'hidden' },
            animatedOpen && isControlledExternally ? {
              opacity: opacityAnim,
              transform: [
                { scaleY: heightAnim },
                { scale: scaleAnim }
              ]
            } : {}
          ]}
        >
          <ThemedView>{children}</ThemedView>
        </Animated.View>
      )}
    </ThemedView>
  );
}
