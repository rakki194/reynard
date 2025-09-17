/**
 * 🦦 Vitest Workspace Configuration for Reynard Monorepo
 *
 * This centralized configuration uses the projects pattern to manage
 * all Vitest configurations across the entire monorepo efficiently.
 *
 * *splashes with enthusiasm* This eliminates the need for individual
 * vitest.config files in each package while maintaining full control
 * over testing configurations!
 */

import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Global settings that apply to all projects
    environment: "happy-dom",
    globals: true,
    testTimeout: 10000,
    hookTimeout: 10000,

    // Use forks pool for better process isolation
    pool: "forks",
    poolOptions: {
      forks: {
        maxForks: 4, // Allow up to 4 concurrent test processes
        singleFork: false,
      },
    },

    // Global coverage settings
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      reportsDirectory: ".vitest-coverage",
      exclude: [
        "node_modules/",
        "dist/",
        "build/",
        "coverage/",
        "**/*.d.ts",
        "**/*.config.*",
        "**/setup.*",
        "**/fixtures/**",
        "**/mocks/**",
        "**/__tests__/**",
      ],
    },
  },

  // Define all projects in the monorepo
  projects: [
    // Core packages
    {
      name: "components",
      root: "./packages/components",
      plugins: [solid()],
      test: {
        setupFiles: ["./src/__tests__/setup.ts"],
        include: ["src/**/*.{test,spec}.{js,ts,tsx}"],
        exclude: ["node_modules", "dist", ".git", ".cache"],
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
          exclude: [
            "node_modules/",
            "src/__tests__/",
            "**/*.d.ts",
            "**/*.config.*",
            "**/setup.*",
            "**/fixtures/**",
            "**/mocks/**",
          ],
        },
      },
      resolve: {
        conditions: ["development", "browser"],
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
        exclude: ["node_modules/", "**/node_modules/**", "dist/", "coverage/", "**/*.d.ts", "**/*.config.*"],
        testTimeout: 10000,
        hookTimeout: 10000,
        teardownTimeout: 10000,
        pool: "forks",
        poolOptions: {
          forks: {
            maxForks: 1,
            singleFork: true,
          },
        },
        coverage: {
          exclude: ["node_modules/", "src/__tests__/", "**/*.d.ts", "**/*.config.*", "**/examples/**"],
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
      resolve: {
        alias: {
          "@": "./src",
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
    
    // Additional packages
    {
      name: "queue-watcher",
      root: "./packages/queue-watcher",
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
      name: "algorithms",
      root: "./packages/algorithms",
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
      name: "auth",
      root: "./packages/auth",
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
      name: "fluent-icons",
      root: "./packages/fluent-icons",
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
      name: "themes",
      root: "./packages/themes",
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
      name: "error-boundaries",
      root: "./packages/error-boundaries",
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
});
