/**
 * Component Testing Playwright Configuration
 *
 * Simple configuration for component E2E tests without backend dependencies.
 */

import { defineConfig, devices } from "@playwright/test";
import { createResultsManager, TEST_TYPES } from "../core/utils/results-manager";

// 🦊 Initialize results manager for component tests
const resultsManager = createResultsManager(TEST_TYPES.COMPONENTS, {
  environment: process.env.NODE_ENV || "development",
  branch: process.env.GIT_BRANCH || "unknown",
  commit: process.env.GIT_COMMIT || "unknown",
});

// Create directories and get paths
const resultsPaths = resultsManager.createDirectories();

export default defineConfig({
  testDir: "../suites",
  testMatch: [
    "ui/*.spec.ts",
    "audio/*.spec.ts",
    "gallery/*.spec.ts",
    "3d/*.spec.ts",
    "boundingbox/*.spec.ts",
    "games/*.spec.ts",
    "chat/*.spec.ts",
    "monaco/*.spec.ts",
    "segmentation/*.spec.ts",
    "charts/*.spec.ts",
  ],

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [
    ["html", { open: "never" }],
    ["json", { outputFile: "component-tests-results.json" }],
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

  outputDir: resultsPaths.artifactsDir,
});
