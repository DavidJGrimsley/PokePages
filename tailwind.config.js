/** @type {import('tailwindcss').Config} */

// Pokémon Type Colors - single source of truth loaded from JSON
const TYPE_COLORS = require('./src/constants/style/typeColors.json');
const TYPE_NORMAL = TYPE_COLORS.normal; // beige/white-ish
const TYPE_FIGHTING = TYPE_COLORS.fighting; // red
const TYPE_FLYING = TYPE_COLORS.flying; // light blue
const TYPE_POISON = TYPE_COLORS.poison; // purple
const TYPE_GROUND = TYPE_COLORS.ground; // brown
const TYPE_ROCK = TYPE_COLORS.rock; // dark brown
const TYPE_BUG = TYPE_COLORS.bug; // green
const TYPE_GHOST = TYPE_COLORS.ghost; // purple
const TYPE_STEEL = TYPE_COLORS.steel; // gray
const TYPE_FIRE = TYPE_COLORS.fire; // orange
const TYPE_WATER = TYPE_COLORS.water; // blue
const TYPE_GRASS = TYPE_COLORS.grass; // light green
const TYPE_ELECTRIC = TYPE_COLORS.electric; // yellow
const TYPE_PSYCHIC = TYPE_COLORS.psychic; // pink
const TYPE_ICE = TYPE_COLORS.ice; // cyan
const TYPE_DRAGON = TYPE_COLORS.dragon; // purple
const TYPE_DARK = TYPE_COLORS.dark; // brown
const TYPE_FAIRY = TYPE_COLORS.fairy; // pink
const TYPE_STELLAR = TYPE_COLORS.stellar; // teal

// App Theme Colors (derived from type colors where applicable)
const APP_PRIMARY = TYPE_POISON;        // #A33EA1 - Poison purple
const APP_SECONDARY = TYPE_PSYCHIC;     // #F95587 - Psychic pink
const APP_ACCENT = TYPE_GRASS;          // #7AC74C - Grass green
const APP_BROWN = TYPE_GROUND;          // #E2BF65 - Ground brown
const APP_FLAG = TYPE_FIRE;             // #EE8130 - Fire orange

// Custom colors (not type-based)
const LAVENDER = '#E6e6fa';
const WHITE = '#fbfbfb';
const BLACK = '#141115';
const TINT_LIGHT = '#B39DDB';
const TINT_DARK = '#a96710';

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
        // Main app theme colors (using type colors for consistency)
        'app-primary': APP_PRIMARY,          // Poison type color
        'app-secondary': APP_SECONDARY,      // Psychic type color
        'app-accent': APP_ACCENT,            // Grass type color
        'app-background': LAVENDER,          // Custom lavender
        'app-surface': WHITE,                // Custom white
        'app-text': BLACK,                   // Custom black
        'app-white': WHITE,                  // Custom white
        'app-brown': APP_BROWN,              // Ground type color
        'app-flag': APP_FLAG,                // Fire type color
        
        // Build card colors
        'app-red': '#e74c3c',                // Physical Attacker
        'app-red-bg': '#fdf2f2',             // Physical Attacker background
        'app-purple': APP_PRIMARY,           // Special Attacker (Poison type)
        'app-purple-bg': LAVENDER,           // Special Attacker background
        'app-blue': '#3498db',               // Physical Wall
        'app-blue-bg': '#f2f8fd',            // Physical Wall background
        'app-green': APP_ACCENT,             // Special Wall (Grass type)
        'app-green-bg': '#f2fdf5',           // Special Wall background
        
        // Tab colors (using type colors)
        'app-tab-active': APP_ACCENT,        // Grass type color
        'app-tab-inactive': APP_BROWN,       // Ground type color
        'app-tab-default': APP_ACCENT,       // Grass type color
        'app-tab-selected': TINT_LIGHT,      // Light purple tint

        // Dark mode variants
        dark: {
          'app-primary': TINT_DARK,          // tintColorDark (orange)
          'app-secondary': TINT_DARK,        // orange
          'app-background': '#20182d',       // plum
          'app-text': '#FEFEFE',             // white
          'app-icon': '#9BA1A6',             // gray
          'app-accent': '#321e3bb9',         // dark purple with alpha
          'app-tab-default': '#321e3bb9',    // accent with alpha
          'app-tab-selected': TINT_DARK,     // tintColorDark
        },
        
        // Pokémon type colors (all 19 types)
        'type-normal': TYPE_NORMAL,
        'type-fighting': TYPE_FIGHTING,
        'type-flying': TYPE_FLYING,
        'type-poison': TYPE_POISON,
        'type-ground': TYPE_GROUND,
        'type-rock': TYPE_ROCK,
        'type-bug': TYPE_BUG,
        'type-ghost': TYPE_GHOST,
        'type-steel': TYPE_STEEL,
        'type-fire': TYPE_FIRE,
        'type-water': TYPE_WATER,
        'type-grass': TYPE_GRASS,
        'type-electric': TYPE_ELECTRIC,
        'type-psychic': TYPE_PSYCHIC,
        'type-ice': TYPE_ICE,
        'type-dragon': TYPE_DRAGON,
        'type-dark': TYPE_DARK,
        'type-fairy': TYPE_FAIRY,
        'type-stellar': TYPE_STELLAR,
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