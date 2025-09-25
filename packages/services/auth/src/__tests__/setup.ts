/**
 * Test setup for Reynard Auth Package
 */

import { vi, afterEach } from "vitest";
import { setupBaseTest } from "reynard-testing";

// Setup the test environment
setupBaseTest();

// Mock localStorage for auth tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock sessionStorage for auth tests
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, "sessionStorage", {
  value: sessionStorageMock,
});

// Mock crypto for JWT token generation
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: vi.fn(() => "mock-uuid"),
    getRandomValues: vi.fn(arr => arr),
  },
});

// Setup test environment variables
process.env.NODE_ENV = "test";
process.env.REYNARD_BACKEND_URL = "http://localhost:8000";

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Global test timeout
vi.setConfig({
  testTimeout: 10000,
});
