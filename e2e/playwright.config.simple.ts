/**
 * Simple Playwright Configuration for E2E Authentication Testing
 */

import { defineConfig, devices } from "@playwright/test";
import { getAuthAppBaseUrl } from "./utils/port-detector";

export default defineConfig({
  testDir: "./",
  testMatch: "simple-auth.spec.ts",

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [["html"], ["json", { outputFile: "e2e-results.json" }]],

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || getAuthAppBaseUrl(),
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

  outputDir: "e2e-results/",
});
