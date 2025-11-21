// babel.config.js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          unstable_transformImportMeta: true,
          jsxImportSource: 'nativewind',
        },
      ],
      'nativewind/babel',
    ],
    plugins: [
      '@babel/plugin-proposal-export-namespace-from',
      'react-native-worklets/plugin',

      // MUST be last — Reanimated requires it
      // 'react-native-reanimated/plugin',
    ],
  };
};
