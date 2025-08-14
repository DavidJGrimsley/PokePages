import colors from './colors';
import { fontFamilies, fontSizes, fontWeights, spacing, borderRadius } from './fonts';
import { RFPercentage } from "react-native-responsive-fontsize";
import { Platform } from 'react-native';

const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';

// Semantic font styles - combines family, size, and weight
export const typography = {
  display: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes.display,
    fontWeight: fontWeights.regular, // Modak only comes in regular weight
  },
  displayOutlined: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes.display,
    fontWeight: fontWeights.regular,
    color: colors.light.white, // White text
    // Dark shadow to create outline effect
    textShadowColor: colors.light.text,
    textShadowOffset: { width: RFPercentage(0.2), height: RFPercentage(0.2) },
    textShadowRadius: RFPercentage(0.1),
  },
  displayOutlinedMobile: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes.display * 0.9,
    fontWeight: fontWeights.regular,
    color: colors.light.white, // White text
    // Dark shadow to create outline effect
    textShadowColor: colors.light.text,
    textShadowOffset: { width: RFPercentage(0.2), height: RFPercentage(0.2) },
    textShadowRadius: RFPercentage(0.1),
  },
  displayOutlinedReverse: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes.display,
    fontWeight: fontWeights.regular,
    color: colors.light.text, // Dark text (more visible)
    // Light shadow to create outline effect
    textShadowColor: colors.light.white,
    textShadowOffset: { width: RFPercentage(0.2), height: RFPercentage(0.2) },
    textShadowRadius: RFPercentage(0.1),
  },
  header: {
    fontFamily: fontFamilies.header,
    fontSize: fontSizes.header,
    fontWeight: fontWeights.semibold,
  },
  subheader: {
    fontFamily: fontFamilies.subheader,
    fontSize: fontSizes.subheader,
    fontWeight: fontWeights.medium,
  },
  callToAction: {
    fontFamily: fontFamilies.callToAction,
    fontSize: fontSizes.cta,
    fontWeight: fontWeights.regular, // Press Start 2P only comes in regular weight
  },
  copy: {
    fontFamily: fontFamilies.copy,
    fontSize: fontSizes.copy,
    fontWeight: fontWeights.regular,
  },
  copyBold: {
    fontFamily: fontFamilies.copy,
    fontSize: fontSizes.copy,
    fontWeight: fontWeights.semibold,
  },
  mono: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.mono,
    fontWeight: fontWeights.regular,
  },
  monoBold: {
    fontFamily: fontFamilies.mono,
    fontSize: fontSizes.mono,
    fontWeight: fontWeights.bold,
  },
};

// Shadow presets - using RFPercentage for responsive shadows
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: RFPercentage(0.1) },
    shadowOpacity: 0.1,
    shadowRadius: RFPercentage(0.2),
    elevation: RFPercentage(0.2),
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: RFPercentage(0.3) },
    shadowOpacity: 0.2,
    shadowRadius: RFPercentage(0.6),
    elevation: RFPercentage(0.5),
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: RFPercentage(0.5) },
    shadowOpacity: 0.3,
    shadowRadius: RFPercentage(1.0),
    elevation: RFPercentage(0.8),
  },
};

// Tab bar styles - centralized for consistency
export const tabBarStyles = {
  tabBarStyle: {
    backgroundColor: colors.light.white, // Brown background
    height: isMobile ? RFPercentage(10) : RFPercentage(4),// Increased height
    // paddingV: RFPercentage(4), // Padding at top
    borderTopWidth: 5,
    borderTopColor: colors.light.accent, // Brown border
  },
  tabBarLabelStyle: {
    fontSize: RFPercentage(1.2), // Responsive font size
    fontWeight: '600' as const, // Proper TypeScript type
    marginBottom: RFPercentage(0.2),
  },
  tabBarActiveTintColor: colors.light.accent, // Brown for active tab
  tabBarInactiveTintColor: colors.light.brown, // Black for inactive tab
  tabBarIconStyle: {
    marginBottom: RFPercentage(0.1),
  },
};

// Combined theme object
export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  tabBarStyles,
  fontFamilies,
  fontSizes,
  fontWeights,
};

export default theme;
