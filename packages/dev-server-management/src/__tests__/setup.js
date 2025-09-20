/**
 * 🦊 Test Setup for Dev Server Management
 *
 * Global setup file for Vitest that configures mocks and test environment.
 */
import { vi } from "vitest";
// ============================================================================
// Global Mocks Setup
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
// Test Environment Setup
// ============================================================================
// Global test timeout
vi.setConfig({
    testTimeout: 10000,
    hookTimeout: 10000,
});
// ============================================================================
// Mock Utilities
// ============================================================================
// Create a simple mock file system
export const createMockFileSystem = () => {
    const files = new Map();
    return {
        files,
        setFile: (path, content) => {
            files.set(path, content);
        },
        getFile: (path) => {
            return files.get(path);
        },
        hasFile: (path) => {
            return files.has(path);
        },
        clear: () => {
            files.clear();
        },
    };
};
// Create a simple mock process
export const createMockProcess = () => {
    const processes = new Map();
    let nextPid = 1000;
    return {
        processes,
        spawn: vi.fn().mockImplementation((command, args, options) => {
            const pid = nextPid++;
            const mockChildProcess = {
                pid,
                kill: vi.fn(),
                on: vi.fn(),
                stdout: { on: vi.fn() },
                stderr: { on: vi.fn() },
            };
            processes.set(options.project, mockChildProcess);
            return mockChildProcess;
        }),
        exec: vi
            .fn()
            .mockImplementation((command, callback) => {
            // Mock exec for commands like 'lsof'
            if (command.includes("lsof -i :")) {
                callback(null, "", ""); // No process found on port
            }
            else {
                callback(null, "mock stdout", "");
            }
        }),
    };
};
// Create a simple mock network
export const createMockNetwork = () => ({
    createServer: vi.fn().mockImplementation(callback => ({
        listen: vi.fn().mockImplementation((port, callback) => {
            callback?.();
            return { close: vi.fn() };
        }),
        close: vi.fn(),
    })),
});
// ============================================================================
// Test Data Factories
// ============================================================================
export const createMockProjectConfig = (overrides = {}) => ({
    name: "test-project",
    description: "A test project",
    path: "/test/project",
    command: "node server.js",
    port: 3000,
    category: "frontend",
    healthCheck: {
        url: "http://localhost:3000/health",
        interval: 1000,
        timeout: 5000,
    },
    ...overrides,
});
export const createMockDevServerConfig = (overrides = {}) => ({
    version: "1.0.0",
    global: {
        maxConcurrentServers: 10,
        defaultStartupTimeout: 30000,
        defaultShutdownTimeout: 5000,
        healthCheckInterval: 5000,
        autoRestart: true,
        maxRestartAttempts: 3,
        restartDelay: 1000,
    },
    projects: {
        "test-project": createMockProjectConfig(),
    },
    portRanges: {
        package: { start: 3000, end: 3099 },
        example: { start: 3100, end: 3199 },
        backend: { start: 3200, end: 3299 },
        e2e: { start: 3300, end: 3399 },
        template: { start: 3400, end: 3499 },
    },
    healthCheck: {
        endpoint: "/health",
        timeout: 5000,
        interval: 5000,
    },
    logging: {
        level: "info",
        format: "text",
    },
    ...overrides,
});
// ============================================================================
// Test Helpers
// ============================================================================
export const waitForEvent = (emitter, event, timeout = 5000) => {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`Event '${event}' did not fire within ${timeout}ms`));
        }, timeout);
        emitter.once(event, (data) => {
            clearTimeout(timer);
            resolve(data);
        });
    });
};
// ============================================================================
// CLI Command Factories (for testing)
// ============================================================================
import { Command } from "commander";
export const createStartCommand = () => {
    const command = new Command("start");
    command
        .description("Start a development server")
        .argument("<project>", "Project name to start")
        .option("--detached", "Run in detached mode")
        .action(async (project, options) => {
        // Mock implementation for testing
    });
    return command;
};
export const createStopCommand = () => {
    const command = new Command("stop");
    command
        .description("Stop a development server")
        .argument("<project>", "Project name to stop")
        .action(async (project) => {
        // Mock implementation for testing
    });
    return command;
};
export const createRestartCommand = () => {
    const command = new Command("restart");
    command
        .description("Restart a development server")
        .argument("<project>", "Project name to restart")
        .action(async (project) => {
        // Mock implementation for testing
    });
    return command;
};
export const createStatusCommand = () => {
    const command = new Command("status");
    command
        .description("Show server status")
        .argument("[project]", "Project name (optional)")
        .action(async (project) => {
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
        .action(async (project) => {
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
        .action(async (projects) => {
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
export const createMockServerInfo = (overrides = {}) => ({
    name: "test-project",
    status: "running",
    health: "healthy",
    port: 3000,
    pid: 12345,
    startTime: new Date(),
    lastHealthCheck: new Date(),
    lastError: undefined,
    metadata: {
        category: "package",
        autoReload: true,
        hotReload: true,
    },
    ...overrides,
});
export const createMockHealthStatus = (overrides = {}) => ({
    project: "test-project",
    health: "healthy",
    lastCheck: new Date(),
    checkDuration: 50,
    error: undefined,
    metrics: {},
    responseTime: 50,
    statusCode: 200,
    ...overrides,
});
