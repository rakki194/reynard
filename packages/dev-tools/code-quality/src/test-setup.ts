/**
 * 🦊 Test setup for Reynard Code Quality package
 *
 * *whiskers twitch with testing precision* Sets up the test environment
 * for the code quality analysis system.
 */

import { vi } from "vitest";

// Mock file system operations
vi.mock("fs/promises", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    readFile: vi.fn(),
    readdir: vi.fn(),
    writeFile: vi.fn(),
  };
});

// Mock child_process
vi.mock("child_process", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    exec: vi.fn(),
    execSync: vi.fn(),
  };
});

// Mock chokidar
vi.mock("chokidar", () => ({
  watch: vi.fn(() => ({
    on: vi.fn(),
    close: vi.fn(),
  })),
}));

// Mock util
vi.mock("util", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    promisify: vi.fn((fn) => fn),
  };
});

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

// Mock process.exit to prevent tests from actually exiting
vi.spyOn(process, 'exit').mockImplementation((code?: number | undefined) => {
  throw new Error(`process.exit(${code})`);
});

// Global test utilities
global.console = {
  ...console,
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};
