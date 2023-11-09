/* eslint-env node */
module.exports = {
  extends: ['erb', 'eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  root: true,
  rules: {
    "no-console": "warn",
    "no-await-in-loop": "off",
    "react/static-property-placement": "off",
    "react/state-in-constructor": "off",
    "import/extensions": "off",
    "import/no-import-module-exports": "off",
    "import/no-extraneous-dependencies": "off",
    "react/jsx-filename-extension": [2, { "extensions": [".tsx"] }],
  }
};