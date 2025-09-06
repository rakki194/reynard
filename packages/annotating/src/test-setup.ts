import { vi } from 'vitest';

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
