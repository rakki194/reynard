import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import solid from "eslint-plugin-solid/configs/typescript";

export default [
  // Base configuration for all files
  js.configs.recommended,

  // TypeScript configuration
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
      globals: {
        // Browser globals
        document: "readonly",
        window: "readonly",
        console: "readonly",
        fetch: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        HTMLElement: "readonly",
        HTMLSelectElement: "readonly",
        Event: "readonly",
        File: "readonly",
        RequestInit: "readonly",
        Response: "readonly",
        // Node.js globals
        process: "readonly",
        global: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^(error|_|_.*)$",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "error",
      "no-case-declarations": "off", // Allow declarations in case blocks
    },
  },

  // SolidJS configuration
  {
    files: ["**/*.{tsx,jsx}"],
    ...solid,
    rules: {
      ...solid.rules,
      "solid/reactivity": "warn", // Relax to warning
      "solid/no-destructure": "warn", // Relax to warning
      "solid/jsx-no-undef": "error",
      "solid/no-innerhtml": "warn", // Relax to warning for demo purposes
    },
  },

  // Test files configuration - more lenient
  {
    files: [
      "**/*.test.{ts,tsx}",
      "**/__tests__/**/*.{ts,tsx}",
      "**/test/**/*.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // Allow unused vars in tests
      "@typescript-eslint/no-explicit-any": "off", // Allow any in tests
    },
  },

  // Ignore patterns
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/build/**",
      "**/.next/**",
      "**/coverage/**",
      "**/*.min.js",
      "**/vite.config.ts",
      "**/vitest.config.ts",
    ],
  },
];
