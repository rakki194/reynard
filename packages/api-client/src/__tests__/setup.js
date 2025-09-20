/**
 * Test setup for Reynard API Client
 */
import { vi } from 'vitest';
import { setupTestEnvironment } from 'reynard-testing';
// Setup the test environment
setupTestEnvironment();
// Mock fetch globally for API client tests
global.fetch = vi.fn();
// Mock console methods to reduce noise in tests
global.console = {
    ...console,
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
};
// Mock performance.now for timing tests
global.performance = {
    ...performance,
    now: vi.fn(() => Date.now()),
};
// Mock AbortController for fetch cancellation tests
global.AbortController = vi.fn(() => ({
    abort: vi.fn(),
    signal: {
        aborted: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
    },
}));
// Mock URL for URL construction tests
global.URL = vi.fn((url, base) => {
    const actualURL = new (globalThis.URL || require('url').URL)(url, base);
    return {
        ...actualURL,
        toString: vi.fn(() => actualURL.toString()),
    };
});
// Setup test environment variables
process.env.NODE_ENV = 'test';
process.env.REYNARD_BACKEND_URL = 'http://localhost:8000';
// Clean up after each test
afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
});
// Global test timeout
vi.setConfig({
    testTimeout: 10000,
});
