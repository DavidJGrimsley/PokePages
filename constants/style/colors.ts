const tintColorLight = '#B39DDB'; // blue-gray
const tintColorDark = '#a96710'; // secondary
const accentColorLight = '#959F5C'; // moss green

export default {
  light: {
    text: '#141115ff', // black
    white: '#fbfbfbff', // white
    background: '#E6e6fa', // lavender
    primary: '#582a5a', // dark purple
    secondary: tintColorLight, // light purple
    accent: accentColorLight, // dark purple
    tint: tintColorLight,
    brown: '#8d6346ff', // raw umber (brown)
    red: '#FA4A1E', // Coquelicot
    tabIconDefault: accentColorLight, // accent
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FEFEFE', // white
    background: '#20182d', // plum
    secondary: '#a96710', // orange
    tint: tintColorDark,
    icon: '#9BA1A6', // gray
    tabIconDefault: '#321e3bb9', // accent
    tabIconSelected: tintColorDark,
    accent: '#321e3bb9', // dark purple
  },
};

