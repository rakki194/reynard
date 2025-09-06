import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    environmentOptions: {
      jsdom: {
        // Better DOM environment for SolidJS
        pretendToBeVisual: true,
        url: "http://localhost/",
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      thresholds: {
        global: {
          branches: 80,
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
  },
  resolve: {
    alias: {
      "~": "./src",
    },
  },
});
