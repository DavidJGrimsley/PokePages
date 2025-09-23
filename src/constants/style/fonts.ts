import { RFPercentage } from "react-native-responsive-fontsize";

// Font families - using Roboto family variants with Press Start 2P for CTA and Modak for display
export const fontFamilies = {
  display: 'Modak', // Large, eye-catching text (hero sections, logos) - fun, bubbly style
  callToAction: 'PressStart2P', // Buttons, links, actionable text - retro gaming style
  copy: 'Roboto', // Body text, paragraphs, general reading
  header: 'Roboto Slab', // Main headings (h1, h2)
  subheader: 'Roboto Condensed', // Secondary headings (h3, h4, h5, h6)
  mono: 'Roboto Mono', // Code, technical text, monospace needs
};

// Responsive spacing using RFPercentage for consistency
export const spacing = {
  xs: RFPercentage(0.4),    // ~4px responsive
  sm: RFPercentage(0.8),    // ~8px responsive
  md: RFPercentage(1.6),    // ~16px responsive
  lg: RFPercentage(2.4),    // ~24px responsive
  xl: RFPercentage(3.2),    // ~32px responsive
  xxl: RFPercentage(4.8),   // ~48px responsive
};

// Responsive border radius using RFPercentage
export const borderRadius = {
  sm: RFPercentage(0.4),    // ~4px responsive
  md: RFPercentage(0.8),    // ~8px responsive
  lg: RFPercentage(1.2),    // ~12px responsive
  xl: RFPercentage(1.6),    // ~16px responsive
  round: RFPercentage(5.0), // ~50px responsive
};

// Font sizes for different use cases - using RFPercentage for responsive scaling
export const fontSizes = {
  xs: RFPercentage(1.2),    // ~12px responsive
  sm: RFPercentage(1.4),    // ~14px responsive  
  md: RFPercentage(1.6),    // ~16px responsive
  lg: RFPercentage(1.8),    // ~18px responsive
  xl: RFPercentage(2.0),    // ~20px responsive
  xxl: RFPercentage(2.4),   // ~24px responsive
  xxxl: RFPercentage(3.2),  // ~32px responsive
  display: RFPercentage(5.6), // ~56px responsive - Large display text for Modak's bold style
  header: RFPercentage(2.8),  // ~28px responsive - Main headers
  subheader: RFPercentage(2.0), // ~20px responsive - Subheaders
  cta: RFPercentage(1.4),     // ~14px responsive - Call to action buttons for pixel font readability
  copy: RFPercentage(1.6),    // ~16px responsive - Body copy
  mono: RFPercentage(1.4),    // ~14px responsive - Monospace text
};

export const fontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
};

// Semantic font styles - combines family, size, and weight
export const typography = {
  display: {
    fontFamily: fontFamilies.display,
    fontSize: fontSizes.display,
    fontWeight: fontWeights.regular, // Modak only comes in regular weight
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

export default {
  fontFamilies,
  fontSizes,
  fontWeights,
  typography,
};