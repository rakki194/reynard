/**
 * Playwright Configuration for E2E Authentication Testing
 *
 * Comprehensive Playwright configuration for testing authentication workflows
 * across the Reynard ecosystem with gatekeeper, backend, and auth package.
 *
 * 🦊 *whiskers twitch with unified precision* Now uses centralized results management.
 */

import { defineConfig, devices } from "@playwright/test";
import { detectAuthAppPort } from "../core/config/port-detector";
import { createResultsManager, TEST_TYPES } from "../core/utils/results-manager";
import { getE2EDir, getExampleAppPath } from "../core/utils/project-root";

/**
 * See https://playwright.dev/docs/test-configuration.
 */

// 🦊 Initialize results manager for E2E tests
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
    "**/*.spec.ts",
    "!**/security/*.spec.ts", // Exclude security tests from main config
    "!**/i18n/*.spec.ts", // Exclude i18n tests from main config
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
    baseURL: process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${detectAuthAppPort()}`,

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

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    {
      name: "Mobile Chrome",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "Mobile Safari",
      use: { ...devices["iPhone 12"] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: `cd ${getE2EDir()}/backend && ./start.sh`,
      url: "http://localhost:8000",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: `cd ${getExampleAppPath("auth-app")} && E2E_BACKEND_URL=http://localhost:8000 pnpm run dev`,
      url: `http://localhost:${detectAuthAppPort()}`,
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

  /* Global setup and teardown */
  globalSetup: "../core/setup/global-setup.ts",
  globalTeardown: "../core/setup/global-teardown.ts",
});
