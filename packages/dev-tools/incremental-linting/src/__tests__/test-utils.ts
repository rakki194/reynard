/**
 * 🦊 Test Utilities for Incremental Linting
 *
 * Common utilities and mocks for testing the incremental linting package.
 */

import { vi, expect } from "vitest";
import type { LintResult, LintIssue, LinterConfig } from "../types.js";

// Mock file system operations
export const mockFs = {
  existsSync: vi.fn(),
  watch: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  rmSync: vi.fn(),
  statSync: vi.fn(),
  readdirSync: vi.fn(),
};

// Mock fs/promises
export const mockFsPromises = {
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
};

// Mock child_process
export const mockExecSync = vi.fn();
export const mockSpawn = vi.fn();

// Mock console methods
export const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
};

// Mock process
export const mockProcess = {
  cwd: vi.fn(() => "/test/workspace"),
  exit: vi.fn(),
  on: vi.fn(),
  env: {},
};

// Mock path
export const mockPath = {
  join: vi.fn((...args: string[]) => args.join("/")),
  dirname: vi.fn((path: string) => path.split("/").slice(0, -1).join("/") || "/"),
  resolve: vi.fn((path: string) => path.startsWith("/") ? path : "/test/workspace/" + path),
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
    statSync: mockFs.statSync,
    readdirSync: mockFs.readdirSync,
  }));

  // Mock fs/promises
  vi.mock("fs/promises", () => ({
    default: {
      readFile: mockFsPromises.readFile,
      writeFile: mockFsPromises.writeFile,
      mkdir: mockFsPromises.mkdir,
    },
    readFile: mockFsPromises.readFile,
    writeFile: mockFsPromises.writeFile,
    mkdir: mockFsPromises.mkdir,
  }));

  // Mock child_process
  vi.mock("child_process", () => ({
    default: {
      execSync: mockExecSync,
      spawn: mockSpawn,
    },
    execSync: mockExecSync,
    spawn: mockSpawn,
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

  // Mock path
  vi.mock("path", () => ({
    default: mockPath,
    join: mockPath.join,
    dirname: mockPath.dirname,
    resolve: mockPath.resolve,
  }));

  // Set default mock implementations
  mockFs.existsSync.mockReturnValue(true);
  mockFs.statSync.mockReturnValue({ mtime: new Date(), size: 1024 });
  mockFs.readdirSync.mockReturnValue([]);
  mockExecSync.mockReturnValue(Buffer.from("Mock command output"));
  mockSpawn.mockImplementation((_command: string, _args: string[]) => {
    const mockChild = {
      stdout: { on: vi.fn() },
      stderr: { on: vi.fn() },
      on: vi.fn((event: string, callback: Function) => {
        // Simulate the linter execution
        if (event === "close") {
          // Simulate a failed linter execution (non-zero exit code)
          setTimeout(() => callback(1), 10);
        }
        if (event === "error") {
          // Simulate an error
          setTimeout(() => callback(new Error("Mock linter error")), 10);
        }
      }),
      kill: vi.fn(),
    };
    return mockChild;
  });
}

// Cleanup mocks
export function cleanupMocks() {
  vi.clearAllMocks();
  vi.resetAllMocks();
  vi.restoreAllMocks();
}

// Test file helpers
export function createTestFile(filePath: string, content: string = "test content") {
  const fullPath = filePath.startsWith("/") ? filePath : "/test/workspace/" + filePath;
  mockFs.existsSync.mockImplementation((path: string) => {
    return path === fullPath;
  });
  mockFs.readFileSync.mockImplementation((path: string) => {
    if (path === fullPath) {
      return Buffer.from(content);
    }
    throw new Error("File not found");
  });
  mockFs.statSync.mockImplementation((path: string) => {
    if (path === fullPath) {
      return { mtime: new Date(), size: content.length };
    }
    throw new Error("File not found");
  });
  return fullPath;
}

// Test directory helpers
export function createTestDirectory(dirPath: string) {
  const fullPath = dirPath.startsWith("/") ? dirPath : "/test/workspace/" + dirPath;
  mockFs.existsSync.mockImplementation((path: string) => {
    return path === fullPath || path.startsWith(fullPath);
  });
  mockFs.statSync.mockImplementation((path: string) => {
    if (path === fullPath) {
      return { isDirectory: () => true, mtime: new Date(), size: 0 };
    }
    throw new Error("Directory not found");
  });
  return fullPath;
}

// Mock linting results
export function createMockLintResult(filePath: string, issues: LintIssue[] = []): LintResult {
  return {
    filePath,
    issues,
    duration: 100,
    timestamp: Date.now(),
    linter: "test-linter",
    success: issues.length === 0,
  };
}

export function createMockLintIssue(
  message: string = "Test issue",
  severity: "error" | "warning" | "info" | "hint" = "error",
  line: number = 1,
  column: number = 1
): LintIssue {
  return {
    id: `test-issue-${Date.now()}`,
    filePath: "/test/file.ts",
    message,
    severity,
    line,
    column,
    endLine: line,
    endColumn: column + 10,
    rule: "test-rule",
    source: "test-linter",
  };
}

// Mock linter configurations
export function createMockLinterConfig(
  name: string = "test-linter",
  patterns: string[] = ["**/*.ts"]
): LinterConfig {
  return {
    name,
    enabled: true,
    command: "test-command",
    args: ["--format", "json"],
    patterns,
    excludePatterns: ["**/node_modules/**"],
    maxFileSize: 1048576,
    timeout: 30000,
    parallel: true,
    priority: 10,
  };
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

// Mock execSync for linters
export function mockLinterExecSync() {
  mockExecSync.mockImplementation((command: string) => {
    // Mock ESLint output
    if (command.includes("eslint")) {
      return Buffer.from(JSON.stringify([
        {
          filePath: "/test/file.ts",
          messages: [
            {
              ruleId: "no-unused-vars",
              severity: 2,
              message: "Variable is defined but never used",
              line: 1,
              column: 1,
              endLine: 1,
              endColumn: 5,
            }
          ],
          errorCount: 1,
          warningCount: 0,
          fixableErrorCount: 0,
          fixableWarningCount: 0,
        }
      ]));
    }

    // Mock Ruff output
    if (command.includes("ruff")) {
      return Buffer.from(JSON.stringify([
        {
          code: "F401",
          message: "Imported but unused",
          location: {
            row: 1,
            column: 1,
          },
          end_location: {
            row: 1,
            column: 10,
          },
          filename: "/test/file.py",
        }
      ]));
    }

    // Mock MyPy output
    if (command.includes("mypy")) {
      return Buffer.from(JSON.stringify([
        {
          path: "/test/file.py",
          line: 1,
          column: 1,
          severity: "error",
          message: "Missing return type annotation",
          code: "missing-return-type",
        }
      ]));
    }

    // Mock Markdownlint output
    if (command.includes("markdownlint")) {
      return Buffer.from(JSON.stringify([
        {
          fileName: "/test/file.md",
          lineNumber: 1,
          ruleNames: ["MD013"],
          ruleDescription: "Line length",
          ruleInformation: "https://github.com/DavidAnson/markdownlint/blob/main/doc/Rules.md#md013",
          errorDetail: "Expected: 80; Actual: 120",
          errorContext: "This is a very long line that exceeds the maximum line length",
          errorRange: [1, 120],
        }
      ]));
    }

    // Mock Shellcheck output
    if (command.includes("shellcheck")) {
      return Buffer.from(JSON.stringify([
        {
          file: "/test/script.sh",
          line: 1,
          column: 1,
          level: "error",
          code: 2086,
          message: "Double quote to prevent globbing and word splitting",
          fix: {
            replacements: [
              {
                line: 1,
                column: 1,
                length: 1,
                replacement: '"',
              }
            ],
          },
        }
      ]));
    }

    return Buffer.from("Mock command output");
  });
}

// Test data generators
export const testData = {
  typescriptFile: {
    path: "/test/file.ts",
    content: "import React from 'react';\n\nexport const Component = () => {\n  return <div>Hello</div>;\n};",
  },
  pythonFile: {
    path: "/test/script.py",
    content: "def hello():\n    print('Hello, World!')\n\nhello()",
  },
  markdownFile: {
    path: "/test/file.md",
    content: "# Test Markdown\n\nThis is a test markdown file with some content.",
  },
  shellFile: {
    path: "/test/script.sh",
    content: "#!/bin/bash\n\necho 'Hello, World!'",
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
export function expectLintResult(result: LintResult) {
  expect(result).toHaveProperty("filePath");
  expect(result).toHaveProperty("issues");
  expect(result).toHaveProperty("duration");
  expect(result).toHaveProperty("timestamp");
  expect(result).toHaveProperty("linter");
  expect(result).toHaveProperty("success");
  expect(Array.isArray(result.issues)).toBe(true);
  expect(typeof result.duration).toBe("number");
  expect(typeof result.timestamp).toBe("number");
  expect(typeof result.linter).toBe("string");
  expect(typeof result.success).toBe("boolean");
}

export function expectLintIssue(issue: LintIssue) {
  expect(issue).toHaveProperty("message");
  expect(issue).toHaveProperty("severity");
  expect(issue).toHaveProperty("line");
  expect(issue).toHaveProperty("column");
  expect(issue).toHaveProperty("endLine");
  expect(issue).toHaveProperty("endColumn");
  expect(issue).toHaveProperty("id");
  expect(issue).toHaveProperty("filePath");
  expect(issue).toHaveProperty("rule");
  expect(issue).toHaveProperty("source");
  expect(typeof issue.message).toBe("string");
  expect(["error", "warning", "info", "hint"]).toContain(issue.severity);
  expect(typeof issue.line).toBe("number");
  expect(typeof issue.column).toBe("number");
}

export function expectLinterConfig(config: LinterConfig) {
  expect(config).toHaveProperty("name");
  expect(config).toHaveProperty("enabled");
  expect(config).toHaveProperty("command");
  expect(config).toHaveProperty("args");
  expect(config).toHaveProperty("patterns");
  expect(config).toHaveProperty("excludePatterns");
  expect(config).toHaveProperty("maxFileSize");
  expect(config).toHaveProperty("timeout");
  expect(config).toHaveProperty("parallel");
  expect(config).toHaveProperty("priority");
  expect(typeof config.name).toBe("string");
  expect(typeof config.enabled).toBe("boolean");
  expect(typeof config.command).toBe("string");
  expect(Array.isArray(config.args)).toBe(true);
  expect(Array.isArray(config.patterns)).toBe(true);
  expect(Array.isArray(config.excludePatterns)).toBe(true);
  expect(typeof config.maxFileSize).toBe("number");
  expect(typeof config.timeout).toBe("number");
  expect(typeof config.parallel).toBe("boolean");
  expect(typeof config.priority).toBe("number");
}
