/**
 * Test Setup for reynard-segmentation
 *
 * Basic test setup with necessary mocks for segmentation testing.
 */

import { vi, beforeEach, afterEach } from "vitest";

// Mock global objects
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock performance API
Object.defineProperty(global, "performance", {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
  },
  writable: true,
});

// Mock URL.createObjectURL and URL.revokeObjectURL
global.URL.createObjectURL = vi.fn(() => "mock-url");
global.URL.revokeObjectURL = vi.fn();

// Mock FileReader for image loading tests
global.FileReader = vi.fn().mockImplementation(() => ({
  readAsText: vi.fn(),
  readAsDataURL: vi.fn(),
  readAsArrayBuffer: vi.fn(),
  onload: null,
  onerror: null,
  result: null,
}));

// Mock Touch constructor for canvas interaction tests
global.Touch = vi.fn().mockImplementation(options => ({
  identifier: options.identifier,
  target: options.target,
  clientX: options.clientX,
  clientY: options.clientY,
}));

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };
global.console = {
  ...originalConsole,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Setup test environment
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Mock SolidJS createRoot for proper cleanup
import { createRoot } from "solid-js";

// Create a test root for each test
let testRoot: ReturnType<typeof createRoot>;

beforeEach(() => {
  testRoot = createRoot(() => {});
});

afterEach(() => {
  testRoot?.dispose();
});
