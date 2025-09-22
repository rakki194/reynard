/**
 * 🦊 TypeScript Configuration Generator Test Setup
 */

import { beforeAll, afterAll } from "vitest";

// Global test setup
beforeAll(() => {
  // Set up any global test configuration
  process.env.NODE_ENV = "test";
});

afterAll(() => {
  // Clean up any global test resources
  delete process.env.NODE_ENV;
});
