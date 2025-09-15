// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
// import storybook from "eslint-plugin-storybook";

module.exports = [
  {
    files: ['**/*.{ts,tsx}'], // Apply to TypeScript files
    languageOptions: {
      parser: require('@typescript-eslint/parser'), // Use the TypeScript parser
      ecmaVersion: 'latest', // Modern ECMAScript features
      sourceType: 'module', // Allow modules
    },
    plugins: {
      react: require('eslint-plugin-react'),
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      'jsx-a11y': require('eslint-plugin-jsx-a11y'),
      'no-only-tests': require('eslint-plugin-no-only-tests'),
      prettier: require('eslint-plugin-prettier'),
      storybook: require('eslint-plugin-storybook'),
    },
    rules: {
      'jsx-a11y/alt-text': 1,
      'jsx-a11y/aria-role': 1,
      'jsx-a11y/aria-unsupported-elements': 1,
      curly: 2,
      'eol-last': 2,
      'jsx-a11y/heading-has-content': 1,
      'jsx-a11y/html-has-lang': 1,
      'jsx-a11y/iframe-has-title': 1,
      'jsx-a11y/img-redundant-alt': 1,
      'jsx-a11y/interactive-supports-focus': 1,
      'jsx-a11y/label-has-associated-control': 1,
      'jsx-a11y/lang': 1,
      'jsx-a11y/mouse-events-have-key-events': 1,
      'no-duplicate-imports': 2,
      'no-lonely-if': 2,
      'no-multiple-empty-lines': 2,
      'no-nested-ternary': 2,
      'jsx-a11y/no-redundant-roles': 1,
      'no-trailing-spaces': 2,
      'no-var': 2,
      'object-curly-newline': 2,
      'object-property-newline': 2,
      'prefer-const': [
        'error',
        {
          destructuring: 'all',
          ignoreReadBeforeAssign: true,
        },
      ],
      'jsx-a11y/role-has-required-aria-props': 1,
      'jsx-a11y/role-supports-aria-props': 1,
      semi: 2,
      'sort-keys': 0,
      'jsx-a11y/tabindex-no-positive': 1,
      'react/prop-types': 0,
      // Ultimately we want to require any to be an exceptional case.
      '@typescript-eslint/no-explicit-any': 'error',
      // "@typescript-eslint/no-unsafe-argument": "warn",
      // "@typescript-eslint/no-unsafe-assignment": "warn",
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'none',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],

      'react/display-name': 'off',
      'no-only-tests/no-only-tests': 2,
      'no-debugger': 2,
      'no-console': [
        2,
        {
          allow: ['error'],
        },
      ],
      'no-warning-comments': [
        2,
        {
          terms: ['do not commit'],
          location: 'anywhere',
        },
      ],
      'no-restricted-syntax': [
        'error',
        "CallExpression[callee.name='consoleErrorTrackingOff']",
      ],
      quotes: ['warn', 'single', { avoidEscape: true }],
      'prettier/prettier': ['warn', { singleQuote: true }],
    },
  },
  {
    files: ['**/*.{js,jsx}'], // Apply to Javascript files
    languageOptions: {
      parser: require('@babel/eslint-parser'),
      ecmaVersion: 2025, // Modern ECMAScript
      sourceType: 'module', // Allow modules
    },
    plugins: {
      react: require('eslint-plugin-react'),
      'jsx-a11y': require('eslint-plugin-jsx-a11y'),
      'no-only-tests': require('eslint-plugin-no-only-tests'),
      prettier: require('eslint-plugin-prettier'),
    },
    rules: {
      'react/display-name': 'off',
      'no-only-tests/no-only-tests': 2,
      'no-debugger': 2,
      'no-console': [
        2,
        {
          allow: ['error'],
        },
      ],
      'no-warning-comments': [
        2,
        {
          terms: ['do not commit'],
          location: 'anywhere',
        },
      ],
      'no-restricted-syntax': [
        'error',
        "CallExpression[callee.name='consoleErrorTrackingOff']",
      ],
      quotes: ['warn', 'single', { avoidEscape: true }],
      'prettier/prettier': ['warn', { singleQuote: true }],
    },
  },
];
