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
  "@/constants": path.resolve(__dirname, "constants"),
  "~/components": path.resolve(__dirname, "src/components"),
  "~/utils": path.resolve(__dirname, "src/utils"),
  "~/store": path.resolve(__dirname, "src/store"),
};

module.exports = withNativeWind(config, { input: "./global.css" });
