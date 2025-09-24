/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./constants/**/*.{js,jsx,ts,tsx}",
    "./app.json",
  ],
  presets: [require("nativewind/preset")],
  corePlugins: {
    // Disable problematic core plugins
    aspectRatio: false,
    textShadow: false,
    backdropBlur: false,
    backdropBrightness: false,
    backdropContrast: false,
    backdropGrayscale: false,
    backdropHueRotate: false,
    backdropInvert: false,
    backdropOpacity: false,
    backdropSaturate: false,
    backdropSepia: false,
    // Also disable other potentially problematic plugins
    blur: false,
    brightness: false,
    contrast: false,
    dropShadow: false,
    grayscale: false,
    hueRotate: false,
    invert: false,
    saturate: false,
    sepia: false,
  },
  theme: {
    extend: {
      colors: {
        // Simplified color palette
        primary: '#582a5a',
        secondary: '#B39DDB',
        accent: '#959F5C',
        background: '#E6e6fa',
        surface: '#fbfbfb',
        text: '#141115',
      },
    },
  },
  plugins: [],
}