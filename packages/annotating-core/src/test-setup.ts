import { vi } from "vitest";

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  debug: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock timers
vi.useFakeTimers();

// Mock fetch for API client tests
global.fetch = vi.fn();

// Mock AbortController for request cancellation tests
global.AbortController = vi.fn().mockImplementation(() => ({
  abort: vi.fn(),
  signal: {
    aborted: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
}));

// Mock performance.now for timing tests
global.performance = {
  ...global.performance,
  now: vi.fn(() => Date.now()),
};

// Mock crypto for ID generation tests
global.crypto = {
  ...global.crypto,
  randomUUID: vi.fn(() => 'mock-uuid-1234-5678-9abc-def012345678'),
};
