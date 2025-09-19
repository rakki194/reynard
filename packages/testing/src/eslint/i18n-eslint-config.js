/**
 * i18n ESLint Configuration for Reynard Testing Package
 *
 * This configuration extends the main ESLint config with i18n-specific rules
 * for validating internationalization patterns across all packages.
 */

import js from "@eslint/js";
import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import jsxA11y from "eslint-plugin-jsx-a11y";
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
        HTMLInputElement: "readonly",
        HTMLTextAreaElement: "readonly",
        HTMLButtonElement: "readonly",
        HTMLDivElement: "readonly",
        HTMLImageElement: "readonly",
        HTMLVideoElement: "readonly",
        HTMLAudioElement: "readonly",
        HTMLCanvasElement: "readonly",
        CanvasRenderingContext2D: "readonly",
        OffscreenCanvas: "readonly",
        OffscreenCanvasRenderingContext2D: "readonly",
        Event: "readonly",
        File: "readonly",
        Blob: "readonly",
        URL: "readonly",
        URLSearchParams: "readonly",
        FormData: "readonly",
        RequestInit: "readonly",
        Response: "readonly",
        KeyboardEvent: "readonly",
        MouseEvent: "readonly",
        DragEvent: "readonly",
        WheelEvent: "readonly",
        CloseEvent: "readonly",
        MessageEvent: "readonly",
        StorageEvent: "readonly",
        MediaQueryListEvent: "readonly",
        Element: "readonly",
        Node: "readonly",
        NodeFilter: "readonly",
        SVGElement: "readonly",
        Image: "readonly",
        Audio: "readonly",
        ImageBitmap: "readonly",
        WebSocket: "readonly",
        AbortController: "readonly",
        TextEncoder: "readonly",
        TextDecoder: "readonly",
        ReadableStream: "readonly",
        XMLHttpRequest: "readonly",
        FileReader: "readonly",
        DOMParser: "readonly",
        Worker: "readonly",
        btoa: "readonly",
        atob: "readonly",
        crypto: "readonly",
        indexedDB: "readonly",
        IDBDatabase: "readonly",
        IDBOpenDBRequest: "readonly",
        localStorage: "readonly",
        sessionStorage: "readonly",
        navigator: "readonly",
        performance: "readonly",
        requestAnimationFrame: "readonly",
        FrameRequestCallback: "readonly",
        Intl: "readonly",
        confirm: "readonly",
        alert: "readonly",
        // Node.js globals
        process: "readonly",
        global: "readonly",
        NodeJS: "readonly",
        require: "readonly",
        // Test globals
        vi: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      // Disable the base rule and use TypeScript version
      "no-unused-expressions": "off",
      "@typescript-eslint/no-unused-expressions": [
        "error",
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^(error|_|_.*)$",
        },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "off", // Allow require() in some cases
      "prefer-const": "error",
      "no-case-declarations": "off", // Allow declarations in case blocks
      "no-regex-spaces": "error",
      "no-useless-escape": "error",
      "no-prototype-builtins": "error",
      "no-redeclare": "error",
      "no-import-assign": "error",
      // Modularity enforcement rules
      "max-lines": ["error", { max: 140, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["error", { max: 50, skipBlankLines: true, skipComments: true }],
    },
  },

  // SolidJS configuration
  {
    files: ["**/*.{tsx,jsx}"],
    ...solid,
    plugins: {
      ...solid.plugins,
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...solid.rules,
      "solid/reactivity": "warn", // Relax to warning
      "solid/no-destructure": "warn", // Relax to warning
      "solid/jsx-no-undef": "error",
      "solid/no-innerhtml": "warn", // Relax to warning for demo purposes
      // Accessibility rules
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",
    },
  },

  // JavaScript config files - Node.js environment
  {
    files: ["**/*.config.js", "**/*.config.mjs"],
    languageOptions: {
      globals: {
        process: "readonly",
        global: "readonly",
        NodeJS: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },
  },

  // Script files - Node.js environment
  {
    files: ["scripts/**/*.js", ".vscode/**/*.js"],
    languageOptions: {
      globals: {
        console: "readonly",
        process: "readonly",
        global: "readonly",
        NodeJS: "readonly",
        require: "readonly",
        module: "readonly",
        exports: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        Buffer: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
      },
    },
  },

  // Test files configuration - more lenient
  {
    files: ["**/*.test.{ts,tsx}", "**/__tests__/**/*.{ts,tsx}", "**/test/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // Allow unused vars in tests
      "@typescript-eslint/no-explicit-any": "off", // Allow any in tests
      // Test files can be longer but still have reasonable limits
      "max-lines": ["error", { max: 200, skipBlankLines: true, skipComments: true }],
      "max-lines-per-function": ["error", { max: 100, skipBlankLines: true, skipComments: true }],
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
      "**/debug-scan.js",
      "**/pkg/**/*.js", // Generated WebAssembly JavaScript files
      "**/third_party/**", // Exclude third-party code
    ],
  },
];
