/**
 * 🦊 Test Utilities for VS Code Extension
 *
 * Common utilities and test helpers for the VS Code extension package.
 */

import { vi, expect } from "vitest";
import { mockVSCode } from "./setup.js";

// Mock types for testing
interface LintResult {
  filePath: string;
  issues: LintIssue[];
  duration: number;
  timestamp: Date;
  linter: string;
  success: boolean;
}

interface LintIssue {
  id: string;
  filePath: string;
  message: string;
  severity: "error" | "warning" | "info" | "hint";
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
  rule?: string;
  source: string;
}

// Re-export mockVSCode from setup
export { mockVSCode };

// Setup mocks (simplified as vscode is mocked globally)
export function setupMocks() {
  // No need to mock vscode here, it's done globally in setup.ts
  vi.clearAllMocks();
}

// Cleanup mocks
export function cleanupMocks() {
  vi.clearAllMocks();
  vi.resetAllMocks();
  vi.restoreAllMocks();
}

// Mock VS Code document
export function createMockDocument(filePath: string, content: string = "test content") {
  return {
    uri: mockVSCode.Uri.file(filePath),
    fileName: filePath,
    languageId: "typescript",
    version: 1,
    isDirty: false,
    isUntitled: false,
    isClosed: false,
    lineCount: content.split("\n").length,
    encoding: "utf8" as const,
    eol: 1 as const, // EndOfLine.LF
    getText: vi.fn(() => content),
    getTextInRange: vi.fn(),
    lineAt: vi.fn(),
    offsetAt: vi.fn(),
    positionAt: vi.fn(),
    getWordRangeAtPosition: vi.fn(),
    validateRange: vi.fn(),
    validatePosition: vi.fn(),
    save: vi.fn(),
  };
}

// Mock VS Code text editor
export function createMockTextEditor(document: any) {
  return {
    document,
    selection: {
      start: { line: 0, character: 0 },
      end: { line: 0, character: 0 },
    },
    selections: [],
    visibleRanges: [],
    options: {},
    viewColumn: 1,
    edit: vi.fn(),
    insertSnippet: vi.fn(),
    setDecorations: vi.fn(),
    revealRange: vi.fn(),
    show: vi.fn(),
    hide: vi.fn(),
  };
}

// Mock VS Code workspace folder
export function createMockWorkspaceFolder(fsPath: string, name: string = "test-workspace") {
  return {
    uri: mockVSCode.Uri.file(fsPath),
    name,
    index: 0,
  };
}

export function createMockExtensionContext() {
  return {
    subscriptions: [],
    extensionPath: "/test/extension",
    asAbsolutePath: vi.fn((relativePath: string) => `/test/extension/${relativePath}`),
    globalState: {
      get: vi.fn(),
      update: vi.fn(),
    },
    workspaceState: {
      get: vi.fn(),
      update: vi.fn(),
    },
    secrets: {
      get: vi.fn(),
      store: vi.fn(),
      delete: vi.fn(),
    },
  };
}

// Mock linting results
export function createMockLintResult(filePath: string, issues: LintIssue[] = []): LintResult {
  return {
    filePath,
    issues,
    duration: 100,
    timestamp: new Date(),
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

// Mock diagnostic collection
export function createMockDiagnosticCollection() {
  return {
    set: vi.fn(),
    delete: vi.fn(),
    clear: vi.fn(),
    dispose: vi.fn(),
    has: vi.fn(),
    forEach: vi.fn(),
  };
}

// Mock configuration
export function createMockConfiguration(config: Record<string, any> = {}) {
  return {
    get: vi.fn((key: string, defaultValue?: any) => {
      return config[key] !== undefined ? config[key] : defaultValue;
    }),
    update: vi.fn(),
    inspect: vi.fn(),
  };
}

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
  expect(typeof result.filePath).toBe("string");
  expect(Array.isArray(result.issues)).toBe(true);
  expect(typeof result.duration).toBe("number");
  expect(result.timestamp).toBeInstanceOf(Date);
  expect(typeof result.linter).toBe("string");
  expect(typeof result.success).toBe("boolean");
}

export function expectLintIssue(issue: LintIssue) {
  expect(issue).toHaveProperty("id");
  expect(issue).toHaveProperty("filePath");
  expect(issue).toHaveProperty("message");
  expect(issue).toHaveProperty("severity");
  expect(issue).toHaveProperty("line");
  expect(issue).toHaveProperty("column");
  expect(issue).toHaveProperty("endLine");
  expect(issue).toHaveProperty("endColumn");
  expect(issue).toHaveProperty("rule");
  expect(issue).toHaveProperty("source");
  expect(typeof issue.message).toBe("string");
  expect(["error", "warning", "info", "hint"]).toContain(issue.severity);
  expect(typeof issue.line).toBe("number");
  expect(typeof issue.column).toBe("number");
}
