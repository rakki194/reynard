/**
 * Test Setup for Error Boundaries
 * Global test configuration and utilities
 */

import { vi } from 'vitest';

// Mock global error handlers
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;

// Mock fetch for error reporting tests
global.fetch = vi.fn();

// Mock console methods to avoid noise in tests
global.console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
  log: vi.fn()
};

// Mock sessionStorage
Object.defineProperty(window, 'sessionStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
});

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn()
  },
  writable: true
});

// Mock location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000/test',
    reload: vi.fn()
  },
  writable: true
});

// Mock navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'Mozilla/5.0 (Test Browser)'
  },
  writable: true
});

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
