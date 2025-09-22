/**
 * 🦊 Vitest Configuration for Vitest Config Generator
 * Test configuration for the vitest-config-generator tool
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.{test,spec}.{js,ts}"],
    exclude: ["node_modules", "dist", "**/*.d.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: ".vitest-coverage",
      include: ["src/**/*.ts"],
      exclude: [
        "src/**/*.test.ts",
        "src/**/*.spec.ts",
        "src/__tests__/**/*",
        "dist/**/*",
        "node_modules/**/*",
        "vitest.generated.config.ts",
        "**/*.generated.config.ts",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 85,
          lines: 85,
          statements: 85,
        },
      },
    },
    reporters: ["default", "json"],
    outputFile: {
      json: ".vitest-reports/test-results.json",
    },
  },
});
