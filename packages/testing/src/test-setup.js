/**
 * Global test setup for reynard-testing
 * Uses happy-dom for fast, modern DOM environment
 */
import { cleanup } from "@solidjs/testing-library";
// Using unified testing setup instead of jest-dom
import { afterEach, vi } from "vitest";
import { PropertySymbol } from "happy-dom";
// Ensure DOM is properly initialized
if (typeof document === "undefined") {
    throw new Error("DOM environment not properly initialized");
}
// Fix happy-dom timer functionality issues
const browserWindow = global.document[PropertySymbol.openerWindow] ||
    global.document[PropertySymbol.window];
if (browserWindow) {
    const window = browserWindow;
    global.setTimeout = window.setTimeout;
    global.clearTimeout = window.clearTimeout;
    global.setInterval = window.setInterval;
    global.clearInterval = window.clearInterval;
    global.requestAnimationFrame = window.requestAnimationFrame;
    global.cancelAnimationFrame = window.cancelAnimationFrame;
    global.queueMicrotask = window.queueMicrotask;
}
// Ensure document.body exists for tests
// Try to access document.body safely
try {
    if (!document.body) {
        const body = document.createElement("body");
        document.documentElement.appendChild(body);
    }
}
catch (error) {
    console.warn("Could not initialize document.body:", error);
    // Create a mock body for testing
    Object.defineProperty(document, "body", {
        value: document.createElement("body"),
        writable: true,
        configurable: true,
    });
}
// Mock localStorage for tests
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
};
global.localStorage = localStorageMock;
// Mock document.documentElement for theme tests
Object.defineProperty(document, "documentElement", {
    value: {
        setAttribute: vi.fn(),
        getAttribute: vi.fn(),
    },
    writable: true,
});
// Mock window.matchMedia for responsive tests
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
// Clean up SolidJS components after each test
afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});
