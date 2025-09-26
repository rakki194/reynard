/**
 * 🐺 PENETRATION TESTING PLAYWRIGHT CONFIGURATION
 *
 * *snarls with predatory glee* Configuration for running penetration tests
 * with fenrir exploits integrated into E2E authentication testing.
 */

import { defineConfig, devices } from "@playwright/test";
import { createResultsManager, TEST_TYPES } from "../core/utils/results-manager";

// 🦊 Initialize results manager for penetration tests
const resultsManager = createResultsManager(TEST_TYPES.PENETRATION, {
  environment: process.env.NODE_ENV || "development",
  branch: process.env.GIT_BRANCH || "unknown",
  commit: process.env.GIT_COMMIT || "unknown",
});

// Create directories and get paths
const resultsPaths = resultsManager.createDirectories();

export default defineConfig({
  testDir: "../suites",
  testMatch: "security/*.spec.ts",

  fullyParallel: false, // Run penetration tests sequentially for safety
  forbidOnly: !!process.env.CI,
  retries: 0, // No retries for penetration tests
  workers: 1, // Single worker for penetration tests

  reporter: [
    ["html", { outputFolder: "penetration-results", open: "never" }],
    ["json", { outputFile: "penetration-results.json" }],
    ["junit", { outputFile: "penetration-results.xml" }],
  ],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 30000, // Longer timeout for penetration tests
    navigationTimeout: 60000,
  },

  projects: [
    {
      name: "penetration-chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Additional security testing configurations
        launchOptions: {
          args: [
            "--disable-web-security",
            "--disable-features=VizDisplayCompositor",
            "--disable-background-timer-throttling",
            "--disable-backgrounding-occluded-windows",
            "--disable-renderer-backgrounding",
          ],
        },
      },
    },
  ],

  timeout: 300 * 1000, // 5 minutes for penetration tests
  expect: {
    timeout: 30 * 1000,
  },

  outputDir: resultsPaths.artifactsDir,

  // Global setup for penetration testing
  globalSetup: "../core/setup/global-penetration-setup.ts",
  globalTeardown: "../core/setup/global-penetration-teardown.ts",
});
