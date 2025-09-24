// /Users/dj/OnDiskDocuments/AppsByMe/PokePages/metro.config.js
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Configure path aliases for Metro
config.resolver.alias = {
  "@": path.resolve(__dirname, "."),
  "~": path.resolve(__dirname, "src"),
  "app": path.resolve(__dirname, "src/app"),
  "constants": path.resolve(__dirname, "src/constants"),
  "components": path.resolve(__dirname, "src/components"),
  "utils": path.resolve(__dirname, "src/utils"),
};

// Re-enable NativeWind with minimal CSS input to avoid problematic global CSS rules
module.exports = withNativeWind(config, {
  // Use the sanitized global.css directly so all layers are applied
  input: "./global.css",
});
