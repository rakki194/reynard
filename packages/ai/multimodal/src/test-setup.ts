/**
 * Test setup for multimodal package
 * Provides mocks for dependencies and test utilities
 */

import { vi, afterEach, beforeEach } from "vitest";
import { cleanup } from "@solidjs/testing-library";

// Mock URL.createObjectURL for file handling
global.URL.createObjectURL = vi.fn(() => "mock-object-url");
global.URL.revokeObjectURL = vi.fn();

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Custom matchers that replace jest-dom functionality
const customMatchers = {
  /**
   * Check if element is in the document
   */
  toBeInTheDocument: (element: Element | null) => {
    if (!element) {
      return {
        message: () => "Expected element to be in the document, but it was null",
        pass: false,
      };
    }
    const pass = document.contains(element);
    return {
      message: () => (pass ? "Expected element not to be in the document" : "Expected element to be in the document"),
      pass,
    };
  },

  /**
   * Check if element has a specific class
   */
  toHaveClass: (element: Element | null, className: string) => {
    if (!element) {
      return {
        message: () => `Expected element to have class '${className}', but element was null`,
        pass: false,
      };
    }
    const pass = element.classList.contains(className);
    return {
      message: () =>
        pass ? `Expected element not to have class '${className}'` : `Expected element to have class '${className}'`,
      pass,
    };
  },
};

// Extend expect with custom matchers
expect.extend(customMatchers);

// Setup any global test configurations
beforeEach(() => {
  // Reset any global state before each test
});

afterEach(() => {
  // Clean up after each test
  cleanup();
});
