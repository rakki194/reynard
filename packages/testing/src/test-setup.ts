/**
 * Global test setup for reynard-testing
 */

import '@testing-library/jest-dom';
import { vi, beforeEach, afterEach } from 'vitest';
import { cleanup } from '@solidjs/testing-library';
import { setupBrowserMocks, resetBrowserMocks } from './mocks/browser-mocks';

// Setup browser mocks
setupBrowserMocks();

// Suppress SolidJS lifecycle warnings in tests
const originalWarn = console.warn;
console.warn = (...args: any[]) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes(
      'computations created outside a `createRoot` or `render` will never be disposed',
    )
  ) {
    return; // Suppress this specific warning
  }
  originalWarn(...args);
};

// Reset mocks before each test
beforeEach(() => {
  resetBrowserMocks();
});

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
