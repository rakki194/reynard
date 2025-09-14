/**
 * DOM Testing Playwright Configuration
 * 
 * Simple configuration for DOM assertion tests without global setup.
 */

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./",
  testMatch: [
    "dom-*.spec.ts",
    "auth.spec.ts" // Include simple auth tests in DOM config
  ],

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [["html"], ["json", { outputFile: "dom-assertions-results.json" }]],

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

  outputDir: "dom-assertions-results/",
});