/**
 * Test setup for Reynard Floating Panel System
 * Uses happy-dom for fast, modern DOM environment
 */

import { cleanup } from "@solidjs/testing-library";
import { afterEach, vi } from "vitest";

// Mock localStorage for tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};
global.localStorage = localStorageMock as globalThis.Storage;

// Mock document.documentElement for theme tests
// Fix happy-dom document.body issue
if (typeof document !== "undefined" && !document.body) {
  const body = document.createElement("body");
  document.appendChild(body);
}
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
  value: vi.fn().mockImplementation(query => ({
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
