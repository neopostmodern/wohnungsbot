/* eslint-env node */
module.exports = {
  extends: 'erb',
  plugins: ['@typescript-eslint'],
  rules: {
    'no-console': 'warn',
    'no-await-in-loop': 'off',
    'react/static-property-placement': 'off',
    'react/state-in-constructor': 'off',
    'import/extensions': 'off',
    'import/no-import-module-exports': 'off',
    'import/no-extraneous-dependencies': 'off',
    'react/jsx-filename-extension': [2, { extensions: ['.tsx'] }],
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error'
  },
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./configs/webpack.config.eslint.ts')
      },
      typescript: {}
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    }
  }
};
