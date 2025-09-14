/**
 * Global test setup for reynard-testing
 * Uses happy-dom for fast, modern DOM environment
 */

import { cleanup } from "@solidjs/testing-library";
// Using unified testing setup instead of jest-dom
import { afterEach, vi } from "vitest";

// Ensure DOM is properly initialized
if (typeof document === 'undefined') {
  throw new Error('DOM environment not properly initialized');
}

// Mock localStorage for tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock as Storage;

// Mock document.documentElement for theme tests
Object.defineProperty(document, "documentElement", {
  value: {
    setAttribute: vi.fn(),
    getAttribute: vi.fn(),
  },
  writable: true,
});

// Mock window.matchMedia for responsive tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Clean up SolidJS components after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
