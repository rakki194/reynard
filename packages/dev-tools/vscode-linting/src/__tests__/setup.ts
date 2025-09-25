/**
 * 🦊 Test Setup for VS Code Extension
 *
 * Global test setup and mocks for the VS Code extension package.
 */

import { vi } from "vitest";

// Apply mocks immediately to ensure they're available before any imports
vi.mock("vscode", () => ({
  window: {
    createStatusBarItem: vi.fn(() => ({
      text: "",
      tooltip: "",
      command: "",
      show: vi.fn(),
      hide: vi.fn(),
      dispose: vi.fn(),
    })),
    showInformationMessage: vi.fn(),
    showErrorMessage: vi.fn(),
    showWarningMessage: vi.fn(),
    createOutputChannel: vi.fn(() => ({
      appendLine: vi.fn(),
      show: vi.fn(),
      hide: vi.fn(),
      dispose: vi.fn(),
    })),
    activeTextEditor: null,
    onDidChangeActiveTextEditor: vi.fn(),
    onDidChangeTextDocument: vi.fn(),
  },
  workspace: {
    workspaceFolders: [
      {
        uri: { fsPath: "/test/workspace" },
        name: "test-workspace",
        index: 0,
      },
    ],
    getConfiguration: vi.fn(() => ({
      get: vi.fn(),
      update: vi.fn(),
      inspect: vi.fn(),
    })),
    onDidChangeConfiguration: vi.fn(),
    onDidSaveTextDocument: vi.fn(),
    onDidChangeTextDocument: vi.fn(),
    onDidOpenTextDocument: vi.fn(),
    onDidCloseTextDocument: vi.fn(),
    findFiles: vi.fn(),
    asRelativePath: vi.fn(),
    createFileSystemWatcher: vi.fn(() => ({
      onDidCreate: vi.fn(),
      onDidChange: vi.fn(),
      onDidDelete: vi.fn(),
      dispose: vi.fn(),
    })),
  },
  languages: {
    createDiagnosticCollection: vi.fn(() => ({
      set: vi.fn(),
      delete: vi.fn(),
      clear: vi.fn(),
      dispose: vi.fn(),
      has: vi.fn(),
      forEach: vi.fn(),
    })),
    registerCodeActionsProvider: vi.fn(),
    registerDocumentFormattingEditProvider: vi.fn(),
  },
  commands: {
    registerCommand: vi.fn(),
    executeCommand: vi.fn(),
  },
  Uri: {
    file: vi.fn((path: string) => ({ fsPath: path, scheme: "file" })),
    parse: vi.fn(),
  },
  Range: vi.fn((start, end) => ({ start, end })),
  Position: vi.fn((line, character) => ({ line, character })),
  Diagnostic: vi.fn((range, message, severity) => ({ range, message, severity })),
  DiagnosticSeverity: {
    Error: 0,
    Warning: 1,
    Information: 2,
    Hint: 3,
  },
  ConfigurationTarget: {
    Global: 1,
    Workspace: 2,
    WorkspaceFolder: 3,
  },
  StatusBarAlignment: {
    Left: 1,
    Right: 2,
  },
  Disposable: vi.fn(() => ({
    dispose: vi.fn(),
  })),
  EventEmitter: vi.fn(() => ({
    event: vi.fn(),
    fire: vi.fn(),
    dispose: vi.fn(),
  })),
  ExtensionContext: vi.fn(() => ({
    subscriptions: [],
    extensionPath: "/test/extension",
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
  })),
}));

// Mock vscode-languageclient
vi.mock("vscode-languageclient/node", () => ({
  LanguageClient: vi.fn(() => ({
    start: vi.fn(),
    stop: vi.fn(),
    sendRequest: vi.fn(),
    onRequest: vi.fn(),
    onNotification: vi.fn(),
    dispose: vi.fn(),
  })),
  LanguageClientOptions: {},
  ServerOptions: {},
  TransportKind: {
    stdio: "stdio",
    ipc: "ipc",
    pipe: "pipe",
    socket: "socket",
  },
}));

// Get the mocked vscode module for use in tests
const mockVSCode = await import("vscode");

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

// Additional mocks are already applied above

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
export { mockVSCode, mockConsole, mockExecSync, mockSpawn, mockFs, mockProcess };
