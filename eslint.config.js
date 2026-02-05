/* eslint-env node */
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      'dist/*',
      'copilotInstructions/**',
      'tests/**',
      'scripts/**',
      '.expo/**',
      'api-server/**',
      'backup-database.js',
      'tailwind.config.js',
    ],
  },
  {
    rules: {
      'react/display-name': 'off',
      'unicode-bom': 'off',
    },
  },
]);
