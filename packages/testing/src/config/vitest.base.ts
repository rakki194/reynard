import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

/**
 * Base Vitest configuration for all Reynard packages
 * Provides common settings and can be extended by individual packages
 */
export const createBaseVitestConfig = (
  options: {
    packageName: string;
    setupFiles?: string[];
    additionalPlugins?: any[];
    coverageThresholds?: {
      branches?: number;
      functions?: number;
      lines?: number;
      statements?: number;
    };
    excludeFromCoverage?: string[];
  } = { packageName: "unknown" },
) => {
  const {
    packageName,
    setupFiles = ["./src/test-setup.ts"],
    additionalPlugins = [],
    coverageThresholds = {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
    excludeFromCoverage = [],
  } = options;

  return defineConfig({
    plugins: [solid(), ...additionalPlugins],
    test: {
      environment: "happy-dom",
      globals: true,
      setupFiles,
      environmentOptions: {
        happyDOM: {
          // Fast, modern DOM environment for SolidJS
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
          global: coverageThresholds,
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
          ...excludeFromCoverage,
        ],
      },
    },
  });
};

/**
 * Standard Vitest configuration for component testing
 */
export const createComponentTestConfig = (packageName: string) =>
  createBaseVitestConfig({
    packageName,
    setupFiles: ["./src/test-setup.ts"],
    coverageThresholds: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  });

/**
 * Standard Vitest configuration for utility/algorithm testing
 */
export const createUtilityTestConfig = (packageName: string) =>
  createBaseVitestConfig({
    packageName,
    setupFiles: ["./src/test-setup.ts"],
    coverageThresholds: {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  });

/**
 * Standard Vitest configuration for integration testing
 */
export const createIntegrationTestConfig = (packageName: string) =>
  createBaseVitestConfig({
    packageName,
    setupFiles: ["./src/test-setup.ts"],
    coverageThresholds: {
      branches: 75,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  });
