/**
 * Test Setup for reynard-games
 *
 * Basic test setup with necessary mocks for games testing.
 */
import { vi, beforeEach, afterEach } from "vitest";
// Mock global objects
global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));
// Mock performance API
Object.defineProperty(global, "performance", {
    value: {
        now: vi.fn(() => Date.now()),
        mark: vi.fn(),
        measure: vi.fn(),
        getEntriesByType: vi.fn(() => []),
        getEntriesByName: vi.fn(() => []),
    },
    writable: true,
});
// Mock requestAnimationFrame for game loops
global.requestAnimationFrame = vi.fn(callback => {
    setTimeout(callback, 16); // ~60fps
    return 1;
});
global.cancelAnimationFrame = vi.fn();
// Setup test environment
beforeEach(() => {
    vi.clearAllMocks();
});
afterEach(() => {
    vi.restoreAllMocks();
});
