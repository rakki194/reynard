/**
 * Playwright Configuration for Documentation Validation Tests
 *
 * Specialized configuration for testing documentation code examples
 * with extended timeouts and isolated test environments.
 */

import { defineConfig, devices } from "@playwright/test";
import { createResultsManager, TEST_TYPES } from "../core/utils/results-manager";

// Initialize results manager for documentation tests
const resultsManager = createResultsManager(TEST_TYPES.COMPONENTS, {
  environment: process.env.NODE_ENV || "development",
  branch: process.env.GIT_BRANCH || "unknown",
  commit: process.env.GIT_COMMIT || "unknown",
});

// Create directories and get paths
const resultsPaths = resultsManager.createDirectories();

export default defineConfig({
  testDir: "../suites/documentation",
  fullyParallel: false, // Run tests sequentially to avoid resource conflicts
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to avoid conflicts with temp directories
  reporter: resultsManager.getReporterConfig(),
  use: {
    headless: true, // Run in headless mode to avoid empty browser windows
    trace: "on",
    screenshot: "on",
    video: "on",
  },
  timeout: 300000, // 5 minutes per test (documentation validation can be slow)
  expect: {
    timeout: 10000, // 10 seconds for assertions
  },
  projects: [
    {
      name: "documentation-validation",
      use: { ...devices["Desktop Chrome"] },
      testMatch: "**/documentation-validation.spec.ts",
    },
  ],

  // Output directory for test artifacts
  outputDir: resultsPaths.artifactsDir,

  // webServer: {
  //   command: "echo 'Documentation validation tests do not require a web server'",
  //   port: 3000,
  //   reuseExistingServer: !process.env.CI,
  // },
});
