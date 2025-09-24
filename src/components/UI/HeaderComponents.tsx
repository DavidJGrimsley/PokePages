import { forwardRef } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, Text, Platform } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { cn } from '~/utils/cn';

const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
const isWeb = Platform.OS === 'web';
const headerHeight = isMobile ? hp(10) : hp(9);

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
      'text-center pt-md',
      isMobile ? 'typography-display-outlined-mobile' : 'typography-display-outlined',
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
