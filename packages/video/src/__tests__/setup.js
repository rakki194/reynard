/**
 * Test Setup for reynard-video
 *
 * Basic test setup with necessary mocks for video testing.
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
// Mock HTMLMediaElement for video testing
Object.defineProperty(HTMLMediaElement.prototype, "load", {
    writable: true,
    value: vi.fn(),
});
Object.defineProperty(HTMLMediaElement.prototype, "play", {
    writable: true,
    value: vi.fn(() => Promise.resolve()),
});
Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    writable: true,
    value: vi.fn(),
});
// Setup test environment
beforeEach(() => {
    vi.clearAllMocks();
});
afterEach(() => {
    vi.restoreAllMocks();
});
