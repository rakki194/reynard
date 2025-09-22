/**
 * 🦊 Test Configuration Generator
 * Helper functions for generating Vitest test configurations
 */

import type { GeneratorConfig, VitestProjectConfig } from "./types.js";

export function generateTestConfig(config: GeneratorConfig, globalExcludePatterns: string[], projects: VitestProjectConfig[]) {
  return {
    // Worker configuration
    maxWorkers: config.maxWorkers || 1,
    pool: "forks",
    poolOptions: {
      forks: {
        maxForks: 1,
        singleFork: true,
      },
    },

    // Parallelism settings
    fileParallelism: false,
    isolate: false,

    // Timeout settings
    testTimeout: 30000,
    hookTimeout: 10000,

    // Reporter configuration
    reporters: [
      "default",
      ["json", { outputFile: ".vitest-reports/global-report.json" }],
    ] as (string | [string, any])[],

    // Coverage settings
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: ".vitest-coverage/global",
    },

    // Environment configuration
    environment: config.environment || "happy-dom",
    globals: true,

    // Fake timers configuration
    fakeTimers: {
      toFake: [
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval",
        "setImmediate",
        "clearImmediate",
        "performance",
        "Date",
        "requestAnimationFrame",
        "cancelAnimationFrame",
        "requestIdleCallback",
        "cancelIdleCallback",
      ],
      advanceTimers: true,
      now: 0,
    },

    // File patterns
    include: generateIncludePatterns(),
    exclude: generateExcludePatterns(globalExcludePatterns),

    // Generated projects
    projects,
  };
}

export function generateIncludePatterns(): string[] {
  return process.env.VITEST_AGENT_ID
    ? [`packages/${process.env.VITEST_AGENT_ID}/**/*.{test,spec}.{js,ts,tsx}`]
    : [
        "**/*.{test,spec}.{js,ts,tsx}",
        "**/__tests__/**/*.{js,ts,tsx}",
        "src/**/*.{test,spec}.{js,ts,tsx}",
        "src/__tests__/**/*.{js,ts,tsx}",
      ];
}

export function generateExcludePatterns(globalExcludePatterns: string[]): string[] {
  return [
    "node_modules",
    "**/node_modules/**",
    "dist",
    ".git",
    ".cache",
    "coverage",
    ".vitest-reports",
    ".vitest-coverage",
    "**/node_modules/**/*.{test,spec}.{js,ts,tsx}",
    ...globalExcludePatterns,
  ];
}
