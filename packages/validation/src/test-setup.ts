/**
 * Test setup for validation package
 * Provides mocks and test utilities
 */

import { vi } from "vitest";

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};
