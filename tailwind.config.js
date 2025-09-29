/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
    "./app.json",
  ],
  presets: [require("nativewind/preset")],
  corePlugins: {
    preflight: false,
    aspectRatio: false, // Disable aspect-ratio utilities that may cause parsing issues
    textShadow: false, // Disable text shadow to avoid conflicts with custom plugin
    backdropBlur: false,
    backdropBrightness: false,
    backdropContrast: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropOpacity: false,
    backdropSaturate: false,
    backdropSepia: false,
  },
  theme: {
    extend: {
      colors: {
        // Main app theme colors based on your colors.ts
        'app-primary': '#582a5a',        // darkPurple
        'app-secondary': '#B39DDB',      // tintColorLight (light purple)
        'app-accent': '#959F5C',         // accentColorLight (moss green)
        'app-background': '#E6e6fa',     // lavender
        'app-surface': '#fbfbfb',        // white
        'app-text': '#141115',           // black
        'app-white': '#fbfbfb',          // white
        'app-brown': '#8d6346',          // raw umber (brown)
        'app-flag': '#FF9800',           // flag orange
        
        // Build card colors
        'app-red': '#e74c3c',            // Physical Attacker
        'app-red-bg': '#fdf2f2',         // Physical Attacker background
        'app-purple': '#582a5a',         // Special Attacker (same as primary)
        'app-purple-bg': '#E6e6fa',      // Special Attacker background (same as app-background)
        'app-blue': '#3498db',           // Physical Wall
        'app-blue-bg': '#f2f8fd',        // Physical Wall background
        'app-green': '#959F5C',          // Special Wall (same as accent)
        'app-green-bg': '#f2fdf5',       // Special Wall background
        
        // Tab colors
        'app-tab-active': '#959F5C',     // accent for active tab
        'app-tab-inactive': '#8d6346',   // brown for inactive tab
        'app-tab-default': '#959F5C',    // accent
        'app-tab-selected': '#B39DDB',   // tintColorLight
        
        // Dark mode variants
        dark: {
          'app-primary': '#a96710',      // tintColorDark (orange)
          'app-secondary': '#a96710',    // orange
          'app-background': '#20182d',   // plum
          'app-text': '#FEFEFE',         // white
          'app-icon': '#9BA1A6',         // gray
          'app-accent': '#321e3bb9',     // dark purple with alpha
          'app-tab-default': '#321e3bb9', // accent with alpha
          'app-tab-selected': '#a96710',  // tintColorDark
        }
      },
      fontFamily: {
        'display': ['Modak'],                    // fontFamilies.display
        'cta': ['PressStart2P'],                 // fontFamilies.callToAction  
        'copy': ['Roboto'],                      // fontFamilies.copy
        'header': ['RobotoSlab'],                // fontFamilies.header
        'subheader': ['RobotoCondensed'],        // fontFamilies.subheader
        'mono': ['RobotoMono'],                  // fontFamilies.mono
        
        // Aliases for convenience
        'press-start': ['PressStart2P'],
        'modak': ['Modak'],
        'roboto': ['Roboto'],
        'roboto-slab': ['RobotoSlab'], 
        'roboto-condensed': ['RobotoCondensed'],
        'roboto-mono': ['RobotoMono'],
      },
      fontSize: {
        // Using RFPercentage equivalent values (approximated for web compatibility)
        'xs-responsive': '12px',     // ~RFPercentage(1.2)
        'sm-responsive': '14px',     // ~RFPercentage(1.4) - also used for CTA
        'md-responsive': '16px',     // ~RFPercentage(1.6) - also used for copy
        'lg-responsive': '18px',     // ~RFPercentage(1.8)
        'xl-responsive': '20px',     // ~RFPercentage(2.0) - also used for subheader
        'xxl-responsive': '24px',    // ~RFPercentage(2.4)
        'xxxl-responsive': '32px',   // ~RFPercentage(3.2)
        'display-responsive': '56px', // ~RFPercentage(5.6)
        'header-responsive': '28px',  // ~RFPercentage(2.8)
        'mono-responsive': '14px',    // ~RFPercentage(1.4)
      },
      spacing: {
        // Using RFPercentage equivalent values
        'xs': '4px',      // ~RFPercentage(0.4)
        'sm': '8px',      // ~RFPercentage(0.8)
        'md': '16px',     // ~RFPercentage(1.6)
        'lg': '24px',     // ~RFPercentage(2.4)
        'xl': '32px',     // ~RFPercentage(3.2)
        'xxl': '48px',    // ~RFPercentage(4.8)
        
        // Custom spacing values
        '18': '4.5rem',
        '88': '22rem',
        '45': '180px',    // For Pokemon images (w-45, h-45)
        '50': '200px',    // For container heights (h-50)
      },
      borderRadius: {
        'xs': '4px',      // ~RFPercentage(0.4)
        'sm': '4px',      // ~RFPercentage(0.4) 
        'md': '8px',      // ~RFPercentage(0.8)
        'lg': '12px',     // ~RFPercentage(1.2)
        'xl': '16px',     // ~RFPercentage(1.6)
        'round': '50px',  // ~RFPercentage(5.0)
        'app': '12px',    // Custom border radius
      },
      boxShadow: {
        'app-small': '0 2px 4px rgba(0,0,0,0.1)',
        'app-medium': '0 6px 12px rgba(0,0,0,0.2)',
        'app-large': '0 8px 16px rgba(0,0,0,0.3)',
      },

      animation: {
        'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
        'bounce-gentle': 'bounce-gentle 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-scale': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.5)' },
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
        },
      }
    },
  },
  plugins: [
    // Temporarily disable plugin for iOS build testing
  ],
}