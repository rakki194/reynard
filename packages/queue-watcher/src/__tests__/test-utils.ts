/**
 * 🦊 Test Utilities for Queue Watcher
 *
 * Common utilities and mocks for testing the queue watcher package.
 */

import path from "path";
import { vi, expect } from "vitest";

// Mock file system operations
export const mockFs = {
  existsSync: vi.fn(),
  watch: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  rmSync: vi.fn(),
};

// Mock child_process
export const mockExecSync = vi.fn();

// Mock console methods
export const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
};

// Mock process
export const mockProcess = {
  cwd: vi.fn(() => "/test/workspace"),
  exit: vi.fn(),
  on: vi.fn(),
};

// Setup mocks
export function setupMocks() {
  // Mock fs
  vi.mock("fs", () => ({
    default: mockFs,
    existsSync: mockFs.existsSync,
    watch: mockFs.watch,
    readFileSync: mockFs.readFileSync,
    writeFileSync: mockFs.writeFileSync,
    mkdirSync: mockFs.mkdirSync,
    rmSync: mockFs.rmSync,
  }));

  // Mock child_process
  vi.mock("child_process", () => ({
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
}

// Cleanup mocks
export function cleanupMocks() {
  vi.clearAllMocks();
  vi.resetAllMocks();
  vi.restoreAllMocks();
}

// Test file helpers
export function createTestFile(filePath: string, content: string = "test content") {
  const fullPath = path.resolve(filePath);
  mockFs.existsSync.mockImplementation((path: string) => {
    return path === fullPath;
  });
  mockFs.readFileSync.mockImplementation((path: string) => {
    if (path === fullPath) {
      return Buffer.from(content);
    }
    throw new Error("File not found");
  });
  return fullPath;
}

// Test directory helpers
export function createTestDirectory(dirPath: string) {
  const fullPath = path.resolve(dirPath);
  mockFs.existsSync.mockImplementation((path: string) => {
    return path === fullPath || path.startsWith(fullPath);
  });
  return fullPath;
}

// Mock file watcher
export function mockFileWatcher() {
  const watchers = new Map<string, (eventType: string, filename: string) => void>();

  mockFs.watch.mockImplementation((dir: string, options: any, callback?: any) => {
    const actualCallback = typeof options === "function" ? options : callback;
    watchers.set(dir, actualCallback);

    return {
      close: () => watchers.delete(dir),
    };
  });

  return {
    triggerFileChange: (dir: string, filename: string, eventType: string = "change") => {
      const callback = watchers.get(dir);
      if (callback) {
        callback(eventType, filename);
      }
    },
    getWatchers: () => Array.from(watchers.keys()),
  };
}

// Mock execSync for processors
export function mockProcessorExecSync() {
  mockExecSync.mockImplementation((command: string, options: any) => {
    // Mock successful execution for most commands
    if (command.includes("prettier")) {
      return Buffer.from("Formatted file");
    }
    if (command.includes("eslint")) {
      return Buffer.from("Fixed file");
    }
    if (command.includes("validate")) {
      return Buffer.from("Validation passed");
    }
    if (command.includes("python")) {
      return Buffer.from("Python validation passed");
    }
    return Buffer.from("Command executed");
  });
}

// Test data generators
export const testData = {
  markdownFile: {
    path: "/test/file.md",
    content: "# Test Markdown\n\nThis is a test markdown file with some content.",
  },
  pythonFile: {
    path: "/test/script.py",
    content: "def hello():\n    print('Hello, World!')\n\nhello()",
  },
  typescriptFile: {
    path: "/test/component.tsx",
    content: "import React from 'react';\n\nexport const Component = () => {\n  return <div>Hello</div>;\n};",
  },
  javascriptFile: {
    path: "/test/script.js",
    content: "function hello() {\n  console.log('Hello, World!');\n}\n\nhello();",
  },
};

// Wait helper for async operations
export function waitFor(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Assertion helpers
export function expectFileToBeProcessed(filePath: string, processors: string[]) {
  // This would be used in integration tests to verify file processing
  expect(mockExecSync).toHaveBeenCalledWith(expect.stringContaining(filePath), expect.any(Object));
}

export function expectQueueStatus(status: any) {
  expect(status).toHaveProperty("totalQueues");
  expect(status).toHaveProperty("processingFiles");
  expect(status).toHaveProperty("isProcessing");
  expect(status).toHaveProperty("queueDetails");
  expect(Array.isArray(status.processingFiles)).toBe(true);
  expect(typeof status.isProcessing).toBe("boolean");
}
