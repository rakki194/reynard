/**
 * Vitest Configuration for E2E Coverage Integration
 *
 * This configuration enables integration between E2E tests and Vitest
 * for comprehensive coverage reporting across the entire ecosystem.
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["scripts/**/*.{test,spec}.{js,ts,tsx}", "core/**/*.{test,spec}.{js,ts,tsx}"],
    exclude: [
      "node_modules",
      "dist",
      "build",
      "coverage",
      "suites/**", // Exclude Playwright test suites
      "configs/**", // Exclude Playwright configs
    ],
    environment: "node", // E2E utilities run in Node environment
    globals: true,
    coverage: {
      provider: "v8",
      enabled: true,
      reporter: ["text", "html", "lcov", "json"],
      reportsDirectory: "../coverage/e2e-utils",
      include: ["core/**/*.ts", "modules/**/*.ts", "scripts/**/*.ts"],
      exclude: [
        "node_modules/**",
        "dist/**",
        "coverage/**",
        "**/*.d.ts",
        "**/*.config.*",
        "**/test-setup.ts",
        "**/__tests__/**",
        "**/tests/**",
        "**/fixtures/**",
        "**/mocks/**",
        "suites/**", // Exclude Playwright test suites
        "configs/**", // Exclude Playwright configs
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
  },
});
