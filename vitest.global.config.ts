/**
 * Global Vitest Configuration for Reynard
 *
 * This configuration ensures that no more than 4 vitest processes
 * run concurrently across all agents, creating a global queue system.
 *
 * 🐺> *alpha wolf dominance* This is the pack leader configuration
 * that coordinates all testing across the entire Reynard ecosystem!
 */

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Global worker limit - maximum 1 process per agent
    maxWorkers: 1,

    // Use forks pool for better process isolation and control
    pool: "forks",
    poolOptions: {
      forks: {
        maxForks: 1, // Hard limit on child processes
        singleFork: true, // Force single fork per agent
      },
    },

    // Disable file parallelism to prevent multiple test files running simultaneously
    fileParallelism: false,

    // Disable test isolation to reduce process overhead
    // Only do this if your tests are properly designed for it
    isolate: false,

    // Global timeout settings
    testTimeout: 30000,
    hookTimeout: 10000,

    // Reporter configuration for better coordination
    reporters: [
      ["default", { summary: false }],
      ["json", { outputFile: ".vitest-reports/global-report.json" }],
    ],

    // Coverage settings
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: ".vitest-coverage/global",
    },

    // Environment configuration
    environment: "happy-dom",
    globals: true,

    // 2025 Fake timers configuration for performance.now support
    fakeTimers: {
      toFake: [
        "setTimeout",
        "clearTimeout",
        "setInterval",
        "clearInterval",
        "setImmediate",
        "clearImmediate",
        "performance", // Include performance.now in fake timers
        "Date",
        "requestAnimationFrame",
        "cancelAnimationFrame",
        "requestIdleCallback",
        "cancelIdleCallback",
      ],
      advanceTimers: true,
      now: 0,
    },

    // File patterns - look for tests in current directory and subdirectories
    // Filter by VITEST_AGENT_ID if set
    include: process.env.VITEST_AGENT_ID
      ? [`packages/${process.env.VITEST_AGENT_ID}/**/*.{test,spec}.{js,ts,tsx}`]
      : [
          "**/*.{test,spec}.{js,ts,tsx}",
          "**/__tests__/**/*.{js,ts,tsx}",
          "src/**/*.{test,spec}.{js,ts,tsx}",
          "src/__tests__/**/*.{js,ts,tsx}",
        ],
    exclude: [
      "node_modules",
      "**/node_modules/**",
      "dist",
      ".git",
      ".cache",
      "coverage",
      ".vitest-reports",
      ".vitest-coverage",
      "**/node_modules/**/*.{test,spec}.{js,ts,tsx}",
    ],

    // Define all projects in the monorepo
    projects: [
      // Core packages
      {
        name: "components",
        root: "./packages/components",
        test: {
          setupFiles: ["./src/__tests__/setup.ts"],
          include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
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
            thresholds: {
              global: {
                branches: 80,
                functions: 85,
                lines: 85,
                statements: 85,
              },
            },
          },
        },
      },

      {
        name: "components-core",
        root: "./packages/components-core",
        test: {
          setupFiles: ["./src/__tests__/setup.ts"],
          include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
          coverage: {
            thresholds: {
              global: {
                branches: 80,
                functions: 85,
                lines: 85,
                statements: 85,
              },
            },
          },
        },
      },

      {
        name: "components-themes",
        root: "./packages/components-themes",
        test: {
          setupFiles: ["./src/__tests__/setup.ts"],
          include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
          coverage: {
            thresholds: {
              global: {
                branches: 80,
                functions: 85,
                lines: 85,
                statements: 85,
              },
            },
          },
        },
      },

      {
        name: "testing",
        root: "./packages/testing",
        test: {
          setupFiles: ["./src/test-setup.ts"],
          include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
          coverage: {
            thresholds: {
              global: {
                branches: 85,
                functions: 90,
                lines: 90,
                statements: 90,
              },
            },
          },
        },
      },

      {
        name: "charts",
        root: "./packages/charts",
        test: {
          setupFiles: ["./src/__tests__/setup.ts"],
          include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
          coverage: {
            thresholds: {
              global: {
                branches: 80,
                functions: 85,
                lines: 85,
                statements: 85,
              },
            },
          },
        },
      },

      {
        name: "games",
        root: "./packages/games",
        test: {
          setupFiles: ["./src/__tests__/setup.ts"],
          include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
          coverage: {
            thresholds: {
              global: {
                branches: 80,
                functions: 85,
                lines: 85,
                statements: 85,
              },
            },
          },
        },
      },

      {
        name: "i18n",
        root: "./packages/i18n",
        test: {
          setupFiles: ["./src/__tests__/setup.ts"],
          include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
          coverage: {
            thresholds: {
              global: {
                branches: 80,
                functions: 85,
                lines: 85,
                statements: 85,
              },
            },
          },
        },
      },

      {
        name: "rag",
        root: "./packages/rag",
        test: {
          setupFiles: ["./src/__tests__/setup.ts"],
          include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
          coverage: {
            thresholds: {
              global: {
                branches: 80,
                functions: 85,
                lines: 85,
                statements: 85,
              },
            },
          },
        },
      },

      {
        name: "ai-shared",
        root: "./packages/ai-shared",
        test: {
          setupFiles: ["./src/__tests__/setup.ts"],
          include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
          coverage: {
            thresholds: {
              global: {
                branches: 80,
                functions: 85,
                lines: 85,
                statements: 85,
              },
            },
          },
        },
      },

      {
        name: "segmentation",
        root: "./packages/segmentation",
        test: {
          setupFiles: ["./src/__tests__/setup.ts"],
          include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
          coverage: {
            thresholds: {
              global: {
                branches: 80,
                functions: 80,
                lines: 80,
                statements: 80,
              },
            },
          },
        },
      },

      {
        name: "video",
        root: "./packages/video",
        test: {
          setupFiles: ["./src/__tests__/setup.ts"],
          include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
          coverage: {
            thresholds: {
              global: {
                branches: 80,
                functions: 85,
                lines: 85,
                statements: 85,
              },
            },
          },
        },
      },

      {
        name: "validation",
        root: "./packages/validation",
        test: {
          setupFiles: ["./src/__tests__/setup.ts"],
          include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
          coverage: {
            thresholds: {
              global: {
                branches: 80,
                functions: 85,
                lines: 85,
                statements: 85,
              },
            },
          },
        },
      },

      {
        name: "code-quality",
        root: "./packages/code-quality",
        test: {
          setupFiles: ["./src/__tests__/setup.ts"],
          include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
          coverage: {
            thresholds: {
              global: {
                branches: 80,
                functions: 85,
                lines: 85,
                statements: 85,
              },
            },
          },
        },
      },

      // Examples
      {
        name: "comprehensive-dashboard",
        root: "./examples/comprehensive-dashboard",
        test: {
          setupFiles: ["./src/__tests__/setup.ts"],
          include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
          coverage: {
            thresholds: {
              global: {
                branches: 70,
                functions: 75,
                lines: 75,
                statements: 75,
              },
            },
          },
        },
      },

      {
        name: "test-app",
        root: "./examples/test-app",
        test: {
          setupFiles: ["./src/__tests__/setup.ts"],
          include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
          coverage: {
            thresholds: {
              global: {
                branches: 70,
                functions: 75,
                lines: 75,
                statements: 75,
              },
            },
          },
        },
      },

      // Templates
      {
        name: "starter-template",
        root: "./templates/starter",
        test: {
          setupFiles: ["./src/__tests__/setup.ts"],
          include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
          coverage: {
            thresholds: {
              global: {
                branches: 70,
                functions: 75,
                lines: 75,
                statements: 75,
              },
            },
          },
        },
      },

      // Scripts
      {
        name: "testing-scripts",
        root: "./scripts/testing",
        test: {
          setupFiles: ["./src/__tests__/setup.ts"],
          include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
          coverage: {
            thresholds: {
              global: {
                branches: 80,
                functions: 85,
                lines: 85,
                statements: 85,
              },
            },
          },
        },
      },
    ],
  },

  // Resolve configuration
  resolve: {
    conditions: ["development", "browser"],
  },
});
