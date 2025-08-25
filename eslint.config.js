module.exports = [
  {
    files: ["**/*.{js,jsx}"], // Apply to Javascript files
    languageOptions: {
      parser: require("@babel/eslint-parser"),
      ecmaVersion: 2025, // Modern ECMAScript
      sourceType: "module", // Allow modules
    },
    plugins: {
      react: require("eslint-plugin-react"),
      "jsx-a11y": require("eslint-plugin-jsx-a11y"),
      "no-only-tests": require("eslint-plugin-no-only-tests"),
      prettier: require("eslint-plugin-prettier"),
    },
    rules: {
      "react/display-name": "off",
      "no-only-tests/no-only-tests": 2,
      "no-debugger": 2,
      "no-console": [
        2,
        {
          allow: ["error"],
        },
      ],
      "no-warning-comments": [
        2,
        {
          terms: ["do not commit"],
          location: "anywhere",
        },
      ],
      "no-restricted-syntax": [
        "error",
        "CallExpression[callee.name='consoleErrorTrackingOff']",
      ],
      "prettier/prettier": "warn",
    },
  },
];
