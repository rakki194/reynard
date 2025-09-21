import { vi } from "vitest";
import { Command } from "commander";

// ============================================================================
// Global Mocks (must be at top level for hoisting)
// ============================================================================

// Mock Node.js modules
vi.mock("node:fs/promises", () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  access: vi.fn(),
}));

vi.mock("node:child_process", () => ({
  spawn: vi.fn(),
  exec: vi.fn(),
}));

vi.mock("node:net", () => ({
  createServer: vi.fn(),
}));

// ============================================================================
// Mock Factories
// ============================================================================

export const createMockFileSystem = () => {
  const files = new Map<string, string>();

  // Set up default config file
  files.set(
    "dev-server.config.json",
    JSON.stringify({
      projects: {
        "test-project": {
          name: "Test Project",
          type: "package",
          command: "npm run dev",
          port: 3000,
          healthCheck: {
            type: "http",
            path: "/api/health",
          },
        },
      },
    })
  );

  return {
    files,
    setFile: (path: string, content: string) => {
      files.set(path, content);
    },
    readFile: vi.fn().mockImplementation(async (path: string) => {
      const content = files.get(path);
      if (content === undefined) {
        throw new Error(`File not found: ${path}`);
      }
      return content;
    }),
    writeFile: vi.fn().mockImplementation(async (path: string, data: string) => {
      files.set(path, data);
    }),
    access: vi.fn().mockImplementation(async (path: string) => {
      if (files.has(path)) {
        return undefined;
      }
      throw new Error(`File not accessible: ${path}`);
    }),
  };
};

export const createMockProcess = () => ({
  spawn: vi.fn().mockReturnValue({
    pid: 12345,
    kill: vi.fn(),
    on: vi.fn(),
    stdout: { on: vi.fn() },
    stderr: { on: vi.fn() },
  }),
  exec: vi.fn().mockImplementation((command, callback) => {
    callback?.(null, "output", "");
  }),
});

export const createMockNetwork = () => ({
  createServer: vi.fn().mockImplementation(callback => ({
    listen: vi.fn().mockImplementation((port, callback) => {
      callback?.();
      return { close: vi.fn() };
    }),
    close: vi.fn(),
  })),
  setPortInUse: vi.fn(),
  isPortInUse: vi.fn().mockReturnValue(false),
});

export const createMockLogger = () => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
});

// ============================================================================
// Test Data Factories
// ============================================================================

export const createMockProjectConfig = (overrides = {}) => ({
  name: "Test Project",
  type: "package",
  command: "npm run dev",
  port: 3000,
  healthCheck: {
    type: "http",
    path: "/api/health",
  },
  ...overrides,
});

export const createMockServerStatus = (overrides = {}) => ({
  project: "test-project",
  status: "running",
  port: 3000,
  pid: 12345,
  uptime: 1000,
  health: "healthy",
  ...overrides,
});

export const createMockHealthResult = (overrides = {}) => ({
  project: "test-project",
  healthy: true,
  responseTime: 50,
  timestamp: Date.now(),
  ...overrides,
});

// ============================================================================
// CLI Command Factories (for testing)
// ============================================================================

export const createStartCommand = () => {
  const command = new Command("start");
  command
    .description("Start a development server")
    .argument("<project>", "Project name to start")
    .option("--detached", "Run in detached mode")
    .action(async (project: string, options: { detached?: boolean }) => {
      // Mock implementation for testing
    });
  return command;
};

export const createStopCommand = () => {
  const command = new Command("stop");
  command
    .description("Stop a development server")
    .argument("<project>", "Project name to stop")
    .action(async (project: string) => {
      // Mock implementation for testing
    });
  return command;
};

export const createRestartCommand = () => {
  const command = new Command("restart");
  command
    .description("Restart a development server")
    .argument("<project>", "Project name to restart")
    .action(async (project: string) => {
      // Mock implementation for testing
    });
  return command;
};

export const createStatusCommand = () => {
  const command = new Command("status");
  command
    .description("Show server status")
    .argument("[project]", "Project name (optional)")
    .action(async (project?: string) => {
      // Mock implementation for testing
    });
  return command;
};

export const createListCommand = () => {
  const command = new Command("list");
  command.description("List available projects").action(async () => {
    // Mock implementation for testing
  });
  return command;
};

export const createHealthCommand = () => {
  const command = new Command("health");
  command
    .description("Check project health")
    .argument("[project]", "Project name (optional)")
    .action(async (project?: string) => {
      // Mock implementation for testing
    });
  return command;
};

export const createConfigCommand = () => {
  const command = new Command("config");
  command.description("Show configuration").action(async () => {
    // Mock implementation for testing
  });
  return command;
};

export const createStatsCommand = () => {
  const command = new Command("stats");
  command.description("Show server statistics").action(async () => {
    // Mock implementation for testing
  });
  return command;
};

export const createStartMultipleCommand = () => {
  const command = new Command("start-multiple");
  command
    .description("Start multiple development servers")
    .argument("<projects...>", "Project names to start")
    .action(async (projects: string[]) => {
      // Mock implementation for testing
    });
  return command;
};

export const createStopAllCommand = () => {
  const command = new Command("stop-all");
  command.description("Stop all development servers").action(async () => {
    // Mock implementation for testing
  });
  return command;
};

// ============================================================================
// Additional Mock Factories
// ============================================================================

export const createMockDevServerConfig = (overrides = {}) => ({
  projects: {
    "test-project": createMockProjectConfig(),
  },
  ...overrides,
});

export const createMockServerInfo = (overrides = {}) => ({
  name: "test-project",
  description: "Test Project",
  type: "package",
  status: "running",
  port: 3000,
  ...overrides,
});

export const createMockHealthStatus = (overrides = {}) => ({
  project: "test-project",
  healthy: true,
  responseTime: 50,
  timestamp: Date.now(),
  ...overrides,
});

// ============================================================================
// Utility Functions
// ============================================================================

export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const createMockEventEmitter = () => ({
  on: vi.fn(),
  off: vi.fn(),
  emit: vi.fn(),
  once: vi.fn(),
  removeAllListeners: vi.fn(),
});

export const createMockConsole = () => ({
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
});

// ============================================================================
// Test Environment Management
// ============================================================================

export const setupTestEnvironment = () => {
  const mockFS = createMockFileSystem();
  const mockProcess = createMockProcess();
  const mockNetwork = createMockNetwork();
  const mockLogger = createMockLogger();

  return {
    mockFS,
    mockProcess,
    mockNetwork,
    mockLogger,
  };
};

export const cleanupTestEnvironment = () => {
  vi.clearAllMocks();
};

// ============================================================================
// Test Utility Functions
// ============================================================================

export const waitForEvent = (emitter: any, event: string, timeout = 5000): Promise<any> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for event: ${event}`));
    }, timeout);

    emitter.once(event, (data: any) => {
      clearTimeout(timer);
      resolve(data);
    });
  });
};

export const waitForEvents = (emitter: any, events: string[], timeout = 5000): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for events: ${events.join(", ")}`));
    }, timeout);

    const results: any[] = [];
    let completed = 0;

    events.forEach(event => {
      emitter.once(event, (data: any) => {
        results.push({ event, data });
        completed++;
        if (completed === events.length) {
          clearTimeout(timer);
          resolve(results);
        }
      });
    });
  });
};

export const expectEventEmitted = (emitter: any, event: string, data?: any) => {
  const events = emitter.eventNames();
  expect(events).toContain(event);
  if (data !== undefined) {
    const listeners = emitter.listeners(event);
    expect(listeners.length).toBeGreaterThan(0);
  }
};

export const expectNoEventEmitted = (emitter: any, event: string) => {
  const events = emitter.eventNames();
  expect(events).not.toContain(event);
};

export const expectConfigValid = (config: any) => {
  expect(config).toBeDefined();
  expect(config.projects).toBeDefined();
  expect(typeof config.projects).toBe("object");
};

export const expectProjectConfigValid = (project: any) => {
  expect(project).toBeDefined();
  expect(project.name).toBeDefined();
  expect(project.type).toBeDefined();
  expect(project.command).toBeDefined();
  expect(project.port).toBeDefined();
};
