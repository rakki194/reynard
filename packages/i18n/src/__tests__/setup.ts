/**
 * Test setup file for enhanced i18n tests
 */

import { vi } from "vitest";

// Mock import.meta.glob
vi.mock("import.meta", () => ({
  glob: vi.fn().mockReturnValue({}),
}));

// Mock performance API
Object.defineProperty(global, "performance", {
  value: {
    now: vi.fn().mockReturnValue(1000),
  },
  writable: true,
});

// Mock localStorage
Object.defineProperty(global, "localStorage", {
  value: {
    getItem: vi.fn().mockReturnValue("en"),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
});

// Mock document
Object.defineProperty(global, "document", {
  value: {
    documentElement: {
      setAttribute: vi.fn(),
      getAttribute: vi.fn(),
    },
  },
  writable: true,
});

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
  group: vi.fn(),
  groupEnd: vi.fn(),
  log: vi.fn(),
  info: vi.fn(),
};
