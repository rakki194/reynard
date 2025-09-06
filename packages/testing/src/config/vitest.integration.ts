import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

/**
 * Vitest configuration for integration testing
 * Includes setup for testing multiple components together
 */
export default defineConfig({
  plugins: [solid()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    environmentOptions: {
      jsdom: {
        pretendToBeVisual: true,
        url: "http://localhost/",
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      thresholds: {
        global: {
          branches: 75,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
      exclude: [
        "node_modules/",
        "dist/",
        "coverage/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/test-setup.ts",
        "**/fixtures/**",
        "**/mocks/**",
      ],
    },
    // Integration test specific configuration
    testTimeout: 30000, // Longer timeout for integration tests
    hookTimeout: 30000,
    maxConcurrency: 1, // Run integration tests sequentially
  },
  resolve: {
    alias: {
      "~": new URL("./src", import.meta.url).pathname,
    },
  },
});
