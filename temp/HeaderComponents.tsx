import { forwardRef } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Pressable, StyleSheet, Text, Platform } from 'react-native';
import { heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { theme } from '../../constants/style/theme';

const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
const isWeb = Platform.OS === 'web';
const mainHeaderColor = theme.colors.light.primary;
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
      <Pressable onPress={onPress}>
        {({ pressed }) => (
          <FontAwesome
            name={iconName}
            size={25}
            color={theme.colors.light.text}
            style={[
              styles.headerRight,
              {
                opacity: pressed ? 0.5 : 1,
              },
            ]}
          />
        )}
      </Pressable>
    );
  }
);

// ✅ Reusable HeaderTitle component with web fallback fonts
export const HeaderTitle = ({ title }: HeaderTitleProps) => (
  <Text style={isMobile ? styles.headerTitleMobile : styles.headerTitleDesktop}>
    {title}
  </Text>
);

HeaderButton.displayName = 'HeaderButton';
HeaderTitle.displayName = 'HeaderTitle';

export const styles = StyleSheet.create({
  headerRight: {
    marginRight: 15,
  },
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
  headerTitleMobile: {
    ...theme.typography.displayOutlinedMobile,
    // Web fallback fonts
    ...(isWeb && {
      fontFamily: 'Georgia, serif', // Fallback for Modak
      textShadowColor: theme.colors.light.accent,
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 0,
    }),
  },
  headerTitleDesktop: {
    ...theme.typography.displayOutlined,
    paddingTop: theme.spacing.md,
    // Web fallback fonts
    // ...(isWeb && {
    //   fontFamily: 'Georgia, serif', // Fallback for Modak
    //   textShadowColor: theme.colors.light.accent,
    //   textShadowOffset: { width: 3, height: 3 },
    //   textShadowRadius: 0,
    // }),
  },
  headerStyle: {
    height: headerHeight,
    backgroundColor: mainHeaderColor,
    // Web-specific fixes
    ...(isWeb && {
      boxShadow: `0 2px 4px ${theme.colors.light.accent}40`,
    }),
  },
});