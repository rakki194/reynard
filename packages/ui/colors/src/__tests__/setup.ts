/**
 * Test setup file for colors package
 */

import { beforeEach, afterEach, vi } from "vitest";

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };

beforeEach(() => {
  // Suppress console.debug calls during tests
  console.debug = vi.fn();
});

afterEach(() => {
  // Restore original console
  Object.assign(console, originalConsole);
});
