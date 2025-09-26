/**
 * Simple Playwright Configuration for Component Testing
 *
 * Simplified configuration for testing components without backend services.
 */

import { defineConfig, devices } from "@playwright/test";
import { createResultsManager, TEST_TYPES } from "../core/utils/results-manager";
import { getExampleAppPath } from "../core/utils/project-root";

// Initialize results manager for E2E tests
const resultsManager = createResultsManager(TEST_TYPES.E2E, {
  environment: process.env.NODE_ENV || "development",
  branch: process.env.GIT_BRANCH || "unknown",
  commit: process.env.GIT_COMMIT || "unknown",
});

// Create directories and get paths
const resultsPaths = resultsManager.createDirectories();

export default defineConfig({
  testDir: "../suites",
  testMatch: [
    "**/*-simple.spec.ts", // Only run simple tests
  ],

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: resultsManager.getReporterConfig(),

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3001",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Take screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video on failure */
    video: "retain-on-failure",

    /* Global timeout for each action */
    actionTimeout: 10000,

    /* Global timeout for navigation */
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: `cd ${getExampleAppPath("auth-app")} && pnpm run dev`,
      url: "http://localhost:3001",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],

  /* Global test timeout */
  timeout: 30 * 1000,

  /* Global expect timeout */
  expect: {
    timeout: 10 * 1000,
  },

  /* Output directory for test artifacts */
  outputDir: resultsPaths.artifactsDir,
});
