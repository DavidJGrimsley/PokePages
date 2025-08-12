module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
          unstable_transformImportMeta: true,
        },
      ],
    ],
    plugins: [
      'nativewind/babel',
      'react-native-worklets/plugin', // Must be last for Reanimated 4
    ],
  };
};
