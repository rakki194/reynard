/**
 * DOM Testing Playwright Configuration
 *
 * Simple configuration for DOM assertion tests without global setup.
 */

import { defineConfig, devices } from "@playwright/test";
import { createResultsManager, TEST_TYPES } from "../core/utils/results-manager";

// 🦊 Initialize results manager for DOM tests
const resultsManager = createResultsManager(TEST_TYPES.DOM, {
  environment: process.env.NODE_ENV || "development",
  branch: process.env.GIT_BRANCH || "unknown",
  commit: process.env.GIT_COMMIT || "unknown",
});

// Create directories and get paths
const resultsPaths = resultsManager.createDirectories();

export default defineConfig({
  testDir: "../suites",
  testMatch: [
    "dom/*.spec.ts",
    "auth/*.spec.ts", // Include auth tests in DOM config
    "tracing/*.spec.ts", // Include tracing tests
  ],

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ["html", { open: "never" }],
    ["json", { outputFile: "dom-assertions-results.json" }],
  ],

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  timeout: 30 * 1000,
  expect: {
    timeout: 10 * 1000,
  },

  outputDir: "../results/dom-assertions-results/",
});
