/**
 * 🦊 Tests for VS Code Extension
 *
 * Test the main extension functionality.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock vscode at the top level
vi.mock("vscode", () => ({
  commands: {
    registerCommand: vi.fn(),
  },
  window: {
    createStatusBarItem: vi.fn(() => ({
      text: "", tooltip: "", command: "", show: vi.fn(), hide: vi.fn(), dispose: vi.fn(),
    })),
    showInformationMessage: vi.fn(),
    showErrorMessage: vi.fn(),
    createOutputChannel: vi.fn(() => ({
      appendLine: vi.fn(), show: vi.fn(), hide: vi.fn(), dispose: vi.fn(),
    })),
    activeTextEditor: null,
    onDidChangeActiveTextEditor: vi.fn(),
    onDidChangeTextDocument: vi.fn(),
  },
  workspace: {
    workspaceFolders: [
      { uri: { fsPath: "/test/workspace" }, name: "test-workspace", index: 0 }
    ],
    getConfiguration: vi.fn(() => ({ get: vi.fn(), update: vi.fn(), inspect: vi.fn() })),
    onDidChangeConfiguration: vi.fn(),
    onDidSaveTextDocument: vi.fn(),
    onDidChangeTextDocument: vi.fn(),
    onDidOpenTextDocument: vi.fn(),
    onDidCloseTextDocument: vi.fn(),
    findFiles: vi.fn(),
    asRelativePath: vi.fn(),
    createFileSystemWatcher: vi.fn(() => ({
      onDidCreate: vi.fn(), onDidChange: vi.fn(), onDidDelete: vi.fn(), dispose: vi.fn(),
    })),
  },
  languages: {
    createDiagnosticCollection: vi.fn(() => ({
      set: vi.fn(), delete: vi.fn(), clear: vi.fn(), dispose: vi.fn(), has: vi.fn(), forEach: vi.fn(),
    })),
    registerCodeActionsProvider: vi.fn(),
    registerDocumentFormattingEditProvider: vi.fn(),
  },
  Uri: {
    file: vi.fn((path: string) => ({ fsPath: path, scheme: "file" })),
    parse: vi.fn(),
  },
  Range: vi.fn((start, end) => ({ start, end })),
  Position: vi.fn((line, character) => ({ line, character })),
  Diagnostic: vi.fn((range, message, severity) => ({ range, message, severity })),
  DiagnosticSeverity: { Error: 0, Warning: 1, Information: 2, Hint: 3 },
  ConfigurationTarget: { Global: 1, Workspace: 2, WorkspaceFolder: 3 },
  StatusBarAlignment: { Left: 1, Right: 2 },
  Disposable: vi.fn(() => ({ dispose: vi.fn() })),
  EventEmitter: vi.fn(() => ({ event: vi.fn(), fire: vi.fn(), dispose: vi.fn() })),
  ExtensionContext: vi.fn(() => ({
    subscriptions: [], extensionPath: "/test/extension",
    globalState: { get: vi.fn(), update: vi.fn() },
    workspaceState: { get: vi.fn(), update: vi.fn() },
    secrets: { get: vi.fn(), store: vi.fn(), delete: vi.fn() },
  })),
}));

// Mock vscode-languageclient
vi.mock("vscode-languageclient/node", () => ({
  LanguageClient: vi.fn(() => ({
    start: vi.fn(), stop: vi.fn(), sendRequest: vi.fn(), onRequest: vi.fn(), onNotification: vi.fn(), dispose: vi.fn(),
  })),
  LanguageClientOptions: {}, ServerOptions: {},
  TransportKind: { stdio: "stdio", ipc: "ipc", pipe: "pipe", socket: "socket" },
}));

import { activate, deactivate } from "../extension.js";
import {
  setupMocks,
  cleanupMocks,
  createMockExtensionContext,
  createMockWorkspaceFolder,
  createMockConfiguration,
  waitFor
} from "./test-utils.js";

// Get the mocked vscode module
const vscode = await import("vscode");

describe("VS Code Extension", () => {
  let mockContext: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockContext = {
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
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("activation", () => {
    it("should activate the extension", async () => {
      const result = await activate(mockContext);

      expect(result).toBeDefined();
      expect(mockContext.subscriptions.length).toBeGreaterThan(0);
    });

    it("should register commands", async () => {
      await activate(mockContext);

      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "reynard-linting.toggle",
        expect.any(Function)
      );
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "reynard-linting.lintFile",
        expect.any(Function)
      );
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "reynard-linting.lintWorkspace",
        expect.any(Function)
      );
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "reynard-linting.clearIssues",
        expect.any(Function)
      );
      expect(vscode.commands.registerCommand).toHaveBeenCalledWith(
        "reynard-linting.showConfig",
        expect.any(Function)
      );
    });

    it("should create diagnostic collection", async () => {
      await activate(mockContext);

      expect(vscode.languages.createDiagnosticCollection).toHaveBeenCalledWith(
        "reynard-linting"
      );
    });

    it("should create status bar item", async () => {
      await activate(mockContext);

      expect(vscode.window.createStatusBarItem).toHaveBeenCalled();
    });

    it("should create output channel", async () => {
      await activate(mockContext);

      expect(vscode.window.createOutputChannel).toHaveBeenCalledWith(
        "Reynard Linting"
      );
    });

    it("should handle missing workspace folders", async () => {
      mockContext.workspaceFolders = undefined;

      const result = await activate(mockContext);

      expect(result).toBeDefined();
      expect(mockContext.subscriptions.length).toBeGreaterThan(0);
    });

    it("should handle empty workspace folders", async () => {
      mockContext.workspaceFolders = [];

      const result = await activate(mockContext);

      expect(result).toBeDefined();
      expect(mockContext.subscriptions.length).toBeGreaterThan(0);
    });
  });

  describe("deactivation", () => {
    it("should deactivate the extension", async () => {
      await activate(mockContext);
      await deactivate();

      // Should not throw any errors
      expect(true).toBe(true);
    });

    it("should handle deactivation without activation", async () => {
      await deactivate();

      // Should not throw any errors
      expect(true).toBe(true);
    });
  });

  describe("command registration", () => {
    let registeredCommands: Map<string, Function> = new Map();

    beforeEach(async () => {
      vi.clearAllMocks();
      
      // Capture registered commands
      vscode.commands.registerCommand.mockImplementation((name: string, callback: Function) => {
        registeredCommands.set(name, callback);
        return { dispose: vi.fn() };
      });
      
      await activate(mockContext);
    });

    it("should register toggle command", () => {
      expect(registeredCommands.has("reynard-linting.toggle")).toBe(true);
    });

    it("should register lintFile command", () => {
      expect(registeredCommands.has("reynard-linting.lintFile")).toBe(true);
    });

    it("should register lintWorkspace command", () => {
      expect(registeredCommands.has("reynard-linting.lintWorkspace")).toBe(true);
    });

    it("should register clearIssues command", () => {
      expect(registeredCommands.has("reynard-linting.clearIssues")).toBe(true);
    });

    it("should register showConfig command", () => {
      expect(registeredCommands.has("reynard-linting.showConfig")).toBe(true);
    });
  });

  describe("event handling", () => {
    beforeEach(async () => {
      await activate(mockContext);
    });

    it("should handle document save events", async () => {
      expect(vscode.workspace.onDidSaveTextDocument).toHaveBeenCalled();
    });

    it("should handle document change events", async () => {
      expect(vscode.workspace.onDidChangeTextDocument).toHaveBeenCalled();
    });

    it("should handle active editor change events", async () => {
      expect(vscode.window.onDidChangeActiveTextEditor).toHaveBeenCalled();
    });

    it("should handle configuration change events", async () => {
      expect(vscode.workspace.onDidChangeConfiguration).toHaveBeenCalled();
    });
  });

  describe("error handling", () => {
    it("should handle activation errors gracefully", async () => {
      // Mock an error during activation
      vscode.languages.createDiagnosticCollection.mockImplementationOnce(() => {
        throw new Error("Activation error");
      });

      // Should not throw
      await expect(activate(mockContext)).resolves.toBeDefined();
    });

    it("should handle missing dependencies gracefully", async () => {
      // Mock a scenario where a dependency (e.g., lintingService) is not initialized
      // This is implicitly tested by ensuring activate doesn't crash
      const result = await activate(mockContext);

      expect(result).toBeDefined();
    });
  });
});