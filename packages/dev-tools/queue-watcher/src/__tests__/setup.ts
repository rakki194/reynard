/**
 * 🦊 Test Setup
 *
 * Global test setup and mocks for the queue watcher package.
 */

import { vi } from "vitest";

// Mock fs module
const mockFs = {
  existsSync: vi.fn(),
  watch: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  rmSync: vi.fn(),
};

// Mock child_process module
const mockExecSync = vi.fn();

// Mock console methods
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
};

// Mock process methods
const mockProcess = {
  cwd: vi.fn(() => "/test/workspace"),
  exit: vi.fn(),
  on: vi.fn(),
};

// Apply mocks
vi.mock("fs", () => ({
  default: mockFs,
  existsSync: mockFs.existsSync,
  watch: mockFs.watch,
  readFileSync: mockFs.readFileSync,
  writeFileSync: mockFs.writeFileSync,
  mkdirSync: mockFs.mkdirSync,
  rmSync: mockFs.rmSync,
}));

vi.mock("child_process", () => ({
  default: {
    execSync: mockExecSync,
  },
  execSync: mockExecSync,
}));

// Mock console
vi.spyOn(console, "log").mockImplementation(mockConsole.log);
vi.spyOn(console, "error").mockImplementation(mockConsole.error);
vi.spyOn(console, "warn").mockImplementation(mockConsole.warn);
vi.spyOn(console, "info").mockImplementation(mockConsole.info);

// Mock process
vi.spyOn(process, "cwd").mockImplementation(mockProcess.cwd);
vi.spyOn(process, "exit").mockImplementation(mockProcess.exit as any);
vi.spyOn(process, "on").mockImplementation(mockProcess.on as any);

// Set default mock implementations
mockFs.existsSync.mockReturnValue(true);
mockExecSync.mockReturnValue(Buffer.from("Mock command output"));

// Export mocks for use in tests
export { mockConsole, mockExecSync, mockFs, mockProcess };
