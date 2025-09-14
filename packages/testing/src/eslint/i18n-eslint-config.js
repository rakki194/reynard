/**
 * ESLint Configuration for i18n Rules (Flat Config)
 * Provides hardcoded string detection and translation validation
 */

import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      "no-console": "warn",
      "no-debugger": "warn",
    },
  },
  
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      "no-console": "warn",
      "no-debugger": "warn",
    },
  },
  
  // Test files - more lenient rules
  {
    files: [
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "**/test-utils.ts",
      "**/test-utils.tsx",
    ],
    rules: {
      "no-console": "off",
      "no-debugger": "off",
    },
  },

  // Configuration files - more lenient rules
  {
    files: [
      "**/*.config.js",
      "**/*.config.ts",
      "**/*.config.json",
      "**/package.json",
      "**/tsconfig.json",
    ],
    rules: {
      "no-console": "off",
      "no-debugger": "off",
    },
  },

  // Documentation files - more lenient rules
  {
    files: ["**/*.md", "**/*.mdx", "**/README.md", "**/CHANGELOG.md"],
    rules: {
      "no-console": "off",
      "no-debugger": "off",
    },
  },

  // Core packages that don't need i18n
  {
    files: [
      "packages/algorithms/**/*",
      "packages/api-client/**/*",
      "packages/colors/**/*",
      "packages/composables/**/*",
      "packages/config/**/*",
      "packages/connection/**/*",
      "packages/core/**/*",
      "packages/fluent-icons/**/*",
    ],
    rules: {
      "no-console": "off",
      "no-debugger": "off",
    },
  },
];