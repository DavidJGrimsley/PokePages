import { forwardRef } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, Text, Platform, Dimensions } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { cn } from '~/utils/cn';

const isAndroid = Platform.OS === 'android';
const isiOs = Platform.OS === 'ios';
const isWeb = Platform.OS === 'web';

// Detect mobile web using RN Web Dimensions (more reliable than window.innerWidth)
const { width: winW } = Dimensions.get('window');
const isMobileWeb = isWeb && winW <= 768;

// Header heights
// - Native mobile (iOS/Android): ~10.5% of screen height (existing behavior)
// - Mobile web: fixed px close to native appearance (prevents iOS Safari viewport quirks)
// - Desktop web: slightly taller than mobile
const headerHeight = isAndroid || isiOs
  ? hp(10.5)
  : isMobileWeb
    ? 64 // px, tuned for mobile Safari/Chrome
    : 72; // desktop web

interface HeaderButtonProps {
  onPress?: () => void;
  iconName?: keyof typeof FontAwesome.glyphMap;
  className?: string;
}

interface HeaderTitleProps {
  title: string;
  className?: string;
}

export const HeaderButton = forwardRef<typeof Pressable, HeaderButtonProps>(
  ({ onPress, iconName = "info-circle", className }, ref) => {
    return (
      <Pressable 
        onPress={onPress} 
        className={cn("mr-md", className)}
      >
        {({ pressed }) => (
          <FontAwesome
            name={iconName}
            size={25}
            color="#141115ff"
            style={{
              opacity: pressed ? 0.5 : 1,
            }}
          />
        )}
      </Pressable>
    );
  }
);

// ✅ Reusable HeaderTitle component using NativeWind typography classes
export const HeaderTitle = ({ title, className }: HeaderTitleProps) => (
  <Text 
    className={cn(
      'text-center',
      isAndroid
        ? 'typography-display-outlined-android'
        : (isiOs || isMobileWeb)
          ? 'typography-display-outlined-ios'
          : 'typography-display-outlined pt-xl',
      className
    )}
  >
    {title}
  </Text>
);

HeaderButton.displayName = 'HeaderButton';
HeaderTitle.displayName = 'HeaderTitle';

// Custom drawer toggle components using NativeWind
export const DrawerToggleButton = ({ onPress, isMobile: isMobileDevice }: { onPress?: () => void; isMobile?: boolean }) => (
  <Pressable 
    onPress={onPress}
    className={cn(
      "m-sm bg-app-secondary rounded-md px-sm items-center justify-center",
      isMobileDevice 
        ? "pt-md min-h-16" // Equivalent to minHeight: headerHeight - theme.spacing.xxl
        : "py-xs pt-sm min-h-20" // Equivalent to minHeight: headerHeight - theme.spacing.sm * 2
    )}
    style={{
      paddingLeft: 14, // Equivalent to theme.spacing.md * 0.9
      minWidth: isMobileDevice ? 8 : 16, // theme.spacing.sm : theme.spacing.md
    }}
  >
    <Text className="typography-cta text-app-text" style={{ fontSize: 28 }}>☰</Text>
  </Pressable>
);

// Header styles now handled by NativeWind classes
export const headerStyle = {
  height: headerHeight,
  backgroundColor: '#582a5a', // app-primary color
  ...(isWeb && {
    boxShadow: `0 2px 4px #959F5C40`, // app-accent with 40 opacity
  }),
};

// Export legacy styles as NativeWind classes for compatibility
export const drawerStyles = {
  desktop: "m-sm bg-app-secondary rounded-md px-sm py-xs pt-sm items-center justify-center min-w-md",
  mobile: "m-sm bg-app-secondary rounded-md px-sm pt-md items-center justify-center min-w-sm",
  text: "typography-cta text-app-text",
};
