import { resolve } from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node", // VS Code extensions run in Node.js environment
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/", "**/*.d.ts", "**/*.config.*", "**/__tests__/**", "**/test-utils/**"],
      thresholds: {
        global: {
          branches: 70, // Lower threshold for VS Code extension tests
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },
    testTimeout: 15000, // Longer timeout for VS Code extension tests
    hookTimeout: 15000,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
