import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

// Base configuration for component testing
const baseConfig = {
  plugins: [solid()],
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./test/setup.ts"],
    environmentOptions: {
      happyDOM: {
        url: "http://localhost:3000",
        settings: {
          disableJavaScriptFileLoading: true,
          disableJavaScriptEvaluation: true,
          disableCSSFileLoading: true,
        },
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      thresholds: {
        global: {
          branches: 85,
          functions: 90,
          lines: 90,
          statements: 90,
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
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      "~": new URL("./src", import.meta.url).pathname,
    },
  },
};

export default defineConfig({
  ...baseConfig,
  plugins: [
    ...baseConfig.plugins!,
    {
      name: "mock-chartjs-adapter",
      resolveId(id) {
        if (id === "chartjs-adapter-date-fns") {
          return id;
        }
        return null;
      },
      load(id) {
        if (id === "chartjs-adapter-date-fns") {
          return "export default {};";
        }
        return null;
      },
    },
  ],
  test: {
    ...baseConfig.test,
    setupFiles: ["./test/setup.ts"],
    typecheck: {
      tsconfig: "./tsconfig.test.json",
    },
  },
});
