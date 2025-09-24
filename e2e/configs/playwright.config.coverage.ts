/**
 * Playwright Configuration with Code Coverage for E2E Authentication Testing
 *
 * This configuration enables code coverage collection during E2E tests
 * and provides integration with Vitest coverage reporting.
 */

import { defineConfig, devices } from "@playwright/test";
import { detectAuthAppPort } from "../core/config/port-detector";
import { createResultsManager, TEST_TYPES } from "../core/utils/results-manager";

// Initialize results manager for E2E tests with coverage
const resultsManager = createResultsManager(TEST_TYPES.E2E, {
  environment: process.env.NODE_ENV || "development",
  branch: process.env.GIT_BRANCH || "unknown",
  commit: process.env.GIT_COMMIT || "unknown",
  enableCoverage: true,
});

// Create directories and get paths
const resultsPaths = resultsManager.createDirectories();

export default defineConfig({
  testDir: "../suites",
  testMatch: [
    "**/auth/*.spec.ts",
    "**/auth-*.spec.ts",
  ],

  /* Run tests in files in parallel */
  fullyParallel: false, // Disable for coverage collection

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI for coverage */
  workers: 1, // Single worker for accurate coverage

  /* Reporter to use with coverage support */
  reporter: [
    ["html", { outputFolder: resultsPaths.html }],
    ["json", { outputFile: resultsPaths.json }],
    ["junit", { outputFile: resultsPaths.xml }],
    ["list"],
  ],

  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${detectAuthAppPort()}`,

    /* Collect trace when retrying the failed test */
    trace: "on-first-retry",

    /* Take screenshot on failure */
    screenshot: "only-on-failure",

    /* Record video on failure */
    video: "retain-on-failure",

    /* Global timeout for each action */
    actionTimeout: 10000,

    /* Global timeout for navigation */
    navigationTimeout: 30000,

    /* Enable coverage collection */
    extraHTTPHeaders: {
      'Coverage-Enabled': 'true',
    },
  },

  /* Configure projects for code coverage testing */
  projects: [
    {
      name: "chromium-coverage",
      use: { 
        ...devices["Desktop Chrome"],
        // Enable coverage collection in browser
        launchOptions: {
          args: [
            '--enable-code-coverage',
            '--disable-extensions-file-access-check',
            '--enable-experimental-web-platform-features',
          ],
        },
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      command: "cd backend && ./start.sh",
      url: "http://localhost:8000",
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
    {
      command: "cd ../examples/auth-app && E2E_BACKEND_URL=http://localhost:8000 pnpm run dev",
      url: `http://localhost:${detectAuthAppPort()}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        // Enable coverage instrumentation in dev server
        VITE_COVERAGE: 'true',
        NODE_ENV: 'test',
      },
    },
  ],

  /* Global test timeout */
  timeout: 60 * 1000, // Longer timeout for coverage collection

  /* Global expect timeout */
  expect: {
    timeout: 15 * 1000,
  },

  /* Output directory for test artifacts */
  outputDir: resultsPaths.artifacts,

  /* Global setup and teardown */
  globalSetup: "../core/setup/global-setup-coverage.ts",
  globalTeardown: "../core/setup/global-teardown-coverage.ts",
});
