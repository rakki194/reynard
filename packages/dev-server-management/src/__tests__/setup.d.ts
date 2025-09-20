/**
 * 🦊 Test Setup for Dev Server Management
 *
 * Global setup file for Vitest that configures mocks and test environment.
 */
export declare const createMockFileSystem: () => {
    files: Map<string, string>;
    setFile: (path: string, content: string) => void;
    getFile: (path: string) => string | undefined;
    hasFile: (path: string) => boolean;
    clear: () => void;
};
export declare const createMockProcess: () => {
    processes: Map<string, any>;
    spawn: import("vitest").Mock<(...args: any[]) => any>;
    exec: import("vitest").Mock<(...args: any[]) => any>;
};
export declare const createMockNetwork: () => {
    createServer: import("vitest").Mock<(...args: any[]) => any>;
};
export declare const createMockProjectConfig: (overrides?: {}) => {
    name: string;
    description: string;
    path: string;
    command: string;
    port: number;
    category: string;
    healthCheck: {
        url: string;
        interval: number;
        timeout: number;
    };
};
export declare const createMockDevServerConfig: (overrides?: {}) => {
    version: string;
    global: {
        maxConcurrentServers: number;
        defaultStartupTimeout: number;
        defaultShutdownTimeout: number;
        healthCheckInterval: number;
        autoRestart: boolean;
        maxRestartAttempts: number;
        restartDelay: number;
    };
    projects: {
        "test-project": {
            name: string;
            description: string;
            path: string;
            command: string;
            port: number;
            category: string;
            healthCheck: {
                url: string;
                interval: number;
                timeout: number;
            };
        };
    };
    portRanges: {
        package: {
            start: number;
            end: number;
        };
        example: {
            start: number;
            end: number;
        };
        backend: {
            start: number;
            end: number;
        };
        e2e: {
            start: number;
            end: number;
        };
        template: {
            start: number;
            end: number;
        };
    };
    healthCheck: {
        endpoint: string;
        timeout: number;
        interval: number;
    };
    logging: {
        level: string;
        format: string;
    };
};
export declare const waitForEvent: (emitter: any, event: string, timeout?: number) => Promise<unknown>;
import { Command } from "commander";
export declare const createStartCommand: () => Command;
export declare const createStopCommand: () => Command;
export declare const createRestartCommand: () => Command;
export declare const createStatusCommand: () => Command;
export declare const createListCommand: () => Command;
export declare const createHealthCommand: () => Command;
export declare const createConfigCommand: () => Command;
export declare const createStatsCommand: () => Command;
export declare const createStartMultipleCommand: () => Command;
export declare const createStopAllCommand: () => Command;
export declare const createMockServerInfo: (overrides?: {}) => {
    name: string;
    status: string;
    health: string;
    port: number;
    pid: number;
    startTime: Date;
    lastHealthCheck: Date;
    lastError: undefined;
    metadata: {
        category: string;
        autoReload: boolean;
        hotReload: boolean;
    };
};
export declare const createMockHealthStatus: (overrides?: {}) => {
    project: string;
    health: string;
    lastCheck: Date;
    checkDuration: number;
    error: undefined;
    metrics: {};
    responseTime: number;
    statusCode: number;
};
