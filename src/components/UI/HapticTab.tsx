import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { View } from 'react-native';
import Colors from 'constants/style/colors';
import { useColorScheme } from '~/hooks/useColorScheme';

export function HapticTab(props: BottomTabBarButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const { accessibilityState } = props;
  const focused = accessibilityState?.selected;

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      {/* Pink indicator line at the top of active tab */}
      {focused && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: Colors[colorScheme].accent, // Pink from our color palette
            zIndex: 1,
          }}
        />
      )}
      <PlatformPressable
        {...props}
        onPressIn={(ev) => {
          if (process.env.EXPO_OS === 'ios') {
            // Add a soft haptic feedback when pressing down on the tabs.
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          props.onPressIn?.(ev);
        }}
      />
    </View>
  );
}
