/**
 * Test setup file for Vitest
 * Provides common mocks and test environment setup
 */

import { vi, beforeEach, afterEach } from "vitest";
import { getOwner } from "solid-js";

// Suppress SolidJS lifecycle warnings in tests
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    typeof args[0] === "string" &&
    args[0].includes(
      "computations created outside a `createRoot` or `render` will never be disposed",
    )
  ) {
    return; // Suppress this specific warning
  }
  originalWarn(...args);
};

// Mock localStorage
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
  writable: true,
});

// Mock sessionStorage
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
  writable: true,
});

// Mock matchMedia
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

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn(
  (cb: FrameRequestCallback) => setTimeout(cb, 0) as any,
);
global.cancelAnimationFrame = vi.fn((id: number) => clearTimeout(id));

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.getItem.mockReturnValue(null);
  sessionStorageMock.getItem.mockReturnValue(null);
});

// Clean up SolidJS computations after each test
afterEach(() => {
  const owner = getOwner();
  if (owner) {
    // Clean up any remaining computations
    owner.cleanups?.forEach((cleanup) => cleanup());
  }
});
