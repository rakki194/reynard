/**
 * 🦊 Test Setup for Incremental Linting
 *
 * Global test setup and mocks for the incremental linting package.
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
  statSync: vi.fn(),
  readdirSync: vi.fn(),
};

// Mock child_process module
const mockExecSync = vi.fn();
const mockSpawn = vi.fn();

// Mock console methods
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Mock process methods
const mockProcess = {
  cwd: vi.fn(() => "/test/workspace"),
  exit: vi.fn(),
  on: vi.fn(),
  env: {},
};

// Mock path module
const mockPath = {
  resolve: vi.fn((...args) => args.join("/")),
  join: vi.fn((...args) => args.join("/")),
  dirname: vi.fn(path => path.split("/").slice(0, -1).join("/")),
  basename: vi.fn(path => path.split("/").pop() || ""),
  extname: vi.fn(path => {
    const parts = path.split(".");
    return parts.length > 1 ? `.${parts.pop()}` : "";
  }),
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
  statSync: mockFs.statSync,
  readdirSync: mockFs.readdirSync,
}));

vi.mock("child_process", () => ({
  default: {
    execSync: mockExecSync,
    spawn: mockSpawn,
  },
  execSync: mockExecSync,
  spawn: mockSpawn,
}));

vi.mock("path", () => ({
  default: mockPath,
  resolve: mockPath.resolve,
  join: mockPath.join,
  dirname: mockPath.dirname,
  basename: mockPath.basename,
  extname: mockPath.extname,
}));

// Mock console
vi.spyOn(console, "log").mockImplementation(mockConsole.log);
vi.spyOn(console, "error").mockImplementation(mockConsole.error);
vi.spyOn(console, "warn").mockImplementation(mockConsole.warn);
vi.spyOn(console, "info").mockImplementation(mockConsole.info);
vi.spyOn(console, "debug").mockImplementation(mockConsole.debug);

// Mock process
vi.spyOn(process, "cwd").mockImplementation(mockProcess.cwd);
vi.spyOn(process, "exit").mockImplementation(mockProcess.exit as any);
vi.spyOn(process, "on").mockImplementation(mockProcess.on as any);

// Set default mock implementations
mockFs.existsSync.mockReturnValue(true);
mockFs.statSync.mockReturnValue({ mtime: new Date(), size: 1024 });
mockFs.readdirSync.mockReturnValue([]);
mockExecSync.mockReturnValue(Buffer.from("Mock command output"));
mockSpawn.mockReturnValue({
  stdout: { on: vi.fn() },
  stderr: { on: vi.fn() },
  on: vi.fn(),
  kill: vi.fn(),
});

// Export mocks for use in tests
export { mockConsole, mockExecSync, mockSpawn, mockFs, mockProcess, mockPath };
