/**
 * Component Test Setup - For packages that need component testing utilities
 */
import { vi } from "vitest";
import { setupBrowserTest } from "./browser-setup.js";
/**
 * Setup for component packages (reynard-caption, reynard-annotating, etc.)
 * Includes component-specific mocks like File API, timers, and observers
 */
export function setupComponentTest() {
    setupBrowserTest();
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
    // Mock File API for file upload tests
    global.File = class File {
        constructor(content, name, options = {}) {
            Object.defineProperty(this, "content", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: content
            });
            Object.defineProperty(this, "name", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: name
            });
            Object.defineProperty(this, "options", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: options
            });
            Object.defineProperty(this, "type", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: void 0
            });
            Object.defineProperty(this, "size", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            this.type = options.type || "text/plain";
        }
        static fromString(content, name, type) {
            return new File([content], name, { type });
        }
    };
    // Mock URL.createObjectURL for image preview tests
    global.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = vi.fn();
}
