/**
 * 🦊 Test setup for Reynard Code Quality package
 *
 * *whiskers twitch with testing precision* Sets up the test environment
 * for the code quality analysis system.
 */
import { vi } from "vitest";
// Mock file system operations
vi.mock("fs/promises", () => ({
    readFile: vi.fn(),
    readdir: vi.fn(),
    writeFile: vi.fn(),
}));
// Mock child_process
vi.mock("child_process", () => ({
    exec: vi.fn(),
}));
// Mock chokidar
vi.mock("chokidar", () => ({
    watch: vi.fn(() => ({
        on: vi.fn(),
        close: vi.fn(),
    })),
}));
// Mock commander
vi.mock("commander", () => ({
    Command: vi.fn(() => ({
        name: vi.fn().mockReturnThis(),
        description: vi.fn().mockReturnThis(),
        version: vi.fn().mockReturnThis(),
        command: vi.fn().mockReturnThis(),
        option: vi.fn().mockReturnThis(),
        action: vi.fn().mockReturnThis(),
        parse: vi.fn(),
    })),
}));
// Global test utilities
global.console = {
    ...console,
    log: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
};
