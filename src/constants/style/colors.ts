
const tintColorLight = '#B39DDB'; // light purple
const tintColorDark = '#a96710'; 
const accentColorLight = '#959F5C'; // moss green
const darkPurple = '#582a5a';
const lavender = '#E6e6fa'; // soft lavender

export default {
  light: {
    text: '#141115ff', // black
    white: '#fbfbfbff', // white
    background: lavender, // lavender
    primary: darkPurple, // dark purple
    secondary: tintColorLight, // light purple
    accent: accentColorLight, // dark purple
    tint: tintColorLight,
    brown: '#8d6346ff', // raw umber (brown)
    tabIconDefault: accentColorLight, // accent
    tabIconSelected: tintColorLight,
    flag: '#FF9800',
    // For build cards:
    red: '#e74c3c', // Physical Attacker (red)
    lightRed: '#fdf2f2', // Physical Attacker background
    purple: darkPurple, // Special Attacker (purple)
    purpleBackground: lavender, // Special Attacker background
    blue: '#3498db', // Physical Wall (blue)
    blueBackground: '#f2f8fd', // Physical Wall background
    green: accentColorLight, // Special Wall (green)
    greenBackground: '#f2fdf5', // Special Wall background
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

