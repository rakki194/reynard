import { vi } from "vitest";
// Global test setup for unified-repository package
// This file is imported by vitest.config.ts
// Mock any global dependencies if needed
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
// Setup any global test utilities
beforeEach(() => {
    // Reset any global state before each test
});
