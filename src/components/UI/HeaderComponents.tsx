import { forwardRef } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, Text, Platform, StyleSheet } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { theme } from 'constants/style/theme';

const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
const isWeb = Platform.OS === 'web';
const headerHeight = isMobile ? hp(10) : hp(9);

interface HeaderButtonProps {
  onPress?: () => void;
  iconName?: keyof typeof FontAwesome.glyphMap;
}

interface HeaderTitleProps {
  title: string;
}

export const HeaderButton = forwardRef<typeof Pressable, HeaderButtonProps>(
  ({ onPress, iconName = "info-circle" }, ref) => {
    return (
      <Pressable onPress={onPress} className="mr-4">
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

// ✅ Reusable HeaderTitle component with web fallback fonts
export const HeaderTitle = ({ title }: HeaderTitleProps) => (
  <Text 
    className={`text-white text-center pt-4`}
    style={{
      // Use our theme's display font (Modak) with outlined styling
      ...(isMobile ? theme.typography.displayOutlinedMobile : theme.typography.displayOutlined),
      // Extra safety for web: if Modak isn't available for any reason, fall back to Georgia/serif
      ...(isWeb && {
        fontFamily: 'Modak',
      }),
    }}
  >
    {title}
  </Text>
);

HeaderButton.displayName = 'HeaderButton';
HeaderTitle.displayName = 'HeaderTitle';

export const styles = StyleSheet.create({
  desktopDrawerStyle: {
    margin: theme.spacing.sm,
    backgroundColor: theme.colors.light.secondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    paddingTop: theme.spacing.sm,
    paddingLeft: theme.spacing.md * 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: theme.spacing.md,
    minHeight: headerHeight - theme.spacing.sm * 2,
  },
  mobileDrawerStyle: {
    margin: theme.spacing.sm,
    backgroundColor: theme.colors.light.secondary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    paddingLeft: theme.spacing.md * 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: theme.spacing.sm,
    minHeight: headerHeight - theme.spacing.xxl,
  },
  drawerToggleText: {
    color: theme.colors.light.text,
    fontSize: theme.typography.callToAction.fontSize * 2,
    fontFamily: theme.typography.callToAction.fontFamily,
    fontWeight: theme.typography.callToAction.fontWeight,
  },
  headerStyle: {
    height: headerHeight,
    backgroundColor: theme.colors.light.primary,
    ...(isWeb && {
      boxShadow: `0 2px 4px ${theme.colors.light.accent}40`,
    }),
  },
});
