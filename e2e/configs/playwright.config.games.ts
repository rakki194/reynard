/**
 * Playwright Configuration for Games Demo E2E Testing
 *
 * Comprehensive Playwright configuration for testing the Games Demo application
 * with focus on game functionality, performance, and user interactions.
 *
 * 🦊 *whiskers twitch with gaming precision* Optimized for game testing scenarios.
 */

import { defineConfig, devices } from "@playwright/test";
import { createResultsManager, TEST_TYPES } from "../core/utils/results-manager";
import { getChromiumArgs, getFirefoxArgs } from "../suites/games/game-test-config";

/**
 * See https://playwright.dev/docs/test-configuration.
 */

// 🦊 Initialize results manager for Games E2E tests
const resultsManager = createResultsManager(TEST_TYPES.E2E, {
  environment: process.env.NODE_ENV || "development",
  branch: process.env.GIT_BRANCH || "unknown",
  commit: process.env.GIT_COMMIT || "unknown",
});

// Create directories and get paths
const _resultsPaths = resultsManager.createDirectories();

export default defineConfig({
  testDir: "../suites/games",
  testMatch: [
    "**/games-demo.spec.ts",
    "**/roguelike-game.spec.ts",
    "**/3d-games.spec.ts",
    "**/games-performance.spec.ts",
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
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3002",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Take screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video on failure */
    video: "retain-on-failure",

    /* Global timeout for each action */
    actionTimeout: 15000, // Longer timeout for game interactions

    /* Global timeout for navigation */
    navigationTimeout: 45000, // Longer timeout for game loading

    /* Browser context options */
    viewport: { width: 1280, height: 720 }, // Standard game resolution
    deviceScaleFactor: 1,
    hasTouch: false,
    isMobile: false,
    locale: "en-US",
    timezoneId: "America/New_York",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Game-specific settings
        viewport: { width: 1280, height: 720 },
        launchOptions: {
          args: getChromiumArgs(),
        },
      },
    },

    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1280, height: 720 },
        launchOptions: {
          firefoxUserPrefs: getFirefoxArgs(),
        },
      },
    },

    {
      name: "webkit",
      use: {
        ...devices["Desktop Safari"],
        viewport: { width: 1280, height: 720 },
      },
    },

    /* Test against mobile viewports for responsive games */
    {
      name: "Mobile Chrome",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 375, height: 667 },
      },
    },
    {
      name: "Mobile Safari",
      use: {
        ...devices["iPhone 12"],
        viewport: { width: 375, height: 667 },
      },
    },

    /* High DPI testing for crisp game graphics */
    {
      name: "High DPI Chrome",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 2,
        launchOptions: {
          args: [...getChromiumArgs(), "--force-device-scale-factor=2"],
        },
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: "cd ../../examples/games-demo && pnpm dev --port 3002",
      url: "http://localhost:3002",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      stdout: "pipe",
      stderr: "pipe",
    },
  ],

  /* Global test timeout */
  timeout: 60 * 1000, // Longer timeout for game tests

  /* Global expect timeout */
  expect: {
    timeout: 15 * 1000, // Longer timeout for game assertions
  },

  /* Output directory for test artifacts */
  outputDir: _resultsPaths.artifactsDir,

  /* No global setup/teardown needed for games tests */

  /* Game-specific test configurations */
  // Note: Custom test options are handled through environment variables
  // or test utilities rather than configuration properties
});
