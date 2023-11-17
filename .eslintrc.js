/* eslint-env node */
module.exports = {
  extends: 'erb',
  plugins: ['@typescript-eslint'],
  rules: {
    'no-console': 'warn',
    'no-await-in-loop': 'off',
    'no-plusplus': ['error', { allowForLoopAfterthoughts: true }],
    'react/static-property-placement': 'off',
    'react/state-in-constructor': 'off',
    'react/no-danger': 'off',
    'react/require-default-props': 'off',
    'react/jsx-filename-extension': ['error', { extensions: ['.tsx'] }],
    'import/extensions': 'off',
    'import/no-import-module-exports': 'off',
    'import/no-extraneous-dependencies': 'off',
    'no-shadow': 'off',
    '@typescript-eslint/no-shadow': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      { vars: 'all', argsIgnorePattern: '_' }
    ]
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
