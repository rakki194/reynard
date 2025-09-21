/**
 * 🦊 ADR System Test Setup
 * Global test setup for the ADR system
 */

import { beforeAll, afterAll } from "vitest";

// Global test setup
beforeAll(() => {
  // Set up any global test configuration
  console.log("🦊 Setting up ADR system tests...");
});

afterAll(() => {
  // Clean up any global test resources
  console.log("🦊 Cleaning up ADR system tests...");
});
