// .eslintrc.cjs
module.exports = {
  root: true,

  env: {
    browser: true,
    es2021: true,
    node: true,
  },

  globals: {
    cy: 'readonly',
    Cypress: 'readonly',
    describe: 'readonly',
    it: 'readonly',
    beforeEach: 'readonly',
    expect: 'readonly',
  },

  extends: [
    'airbnb',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],

  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
  },

  plugins: ['react-refresh'],

  settings: {
    react: { version: 'detect' },
  },

  rules: {
    'jsx-a11y/label-has-associated-control': ['error', { assert: 'either' }],
    'react/react-in-jsx-scope': 'off',
    'react/jsx-filename-extension': ['warn', { extensions: ['.jsx', '.js'] }],
    'react/prop-types': 'warn',
    'react/require-default-props': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/function-component-definition': [
      'warn',
      { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
    ],
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'import/extensions': ['error', 'ignorePackages', { js: 'never', jsx: 'never' }],
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': ['error', {
      devDependencies: ['vite.config.*', 'cypress.config.*', '**/*.test.*', '**/*.spec.*', '**/setup.js',
        'cypress/**/*'],
    }],
    'no-param-reassign': ['error', {
      props: true,
      ignorePropertyModificationsFor: ['state', 'acc', 'config'],
    }],
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-unused-vars': ['error', { vars: 'all', args: 'after-used', ignoreRestSiblings: true }],
  },
};
