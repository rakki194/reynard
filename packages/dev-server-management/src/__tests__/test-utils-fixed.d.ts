import { Command } from "commander";
export declare const createMockFileSystem: () => {
    files: Map<string, string>;
    readFile: import("vitest").Mock<(...args: any[]) => any>;
    writeFile: import("vitest").Mock<(...args: any[]) => any>;
    access: import("vitest").Mock<(...args: any[]) => any>;
};
export declare const createMockProcess: () => {
    spawn: import("vitest").Mock<(...args: any[]) => any>;
    exec: import("vitest").Mock<(...args: any[]) => any>;
};
export declare const createMockNetwork: () => {
    createServer: import("vitest").Mock<(...args: any[]) => any>;
};
export declare const createMockLogger: () => {
    info: import("vitest").Mock<(...args: any[]) => any>;
    warn: import("vitest").Mock<(...args: any[]) => any>;
    error: import("vitest").Mock<(...args: any[]) => any>;
    debug: import("vitest").Mock<(...args: any[]) => any>;
};
export declare const createMockProjectConfig: (overrides?: {}) => {
    name: string;
    type: string;
    command: string;
    port: number;
    healthCheck: {
        type: string;
        path: string;
    };
};
export declare const createMockServerStatus: (overrides?: {}) => {
    project: string;
    status: string;
    port: number;
    pid: number;
    uptime: number;
    health: string;
};
export declare const createMockHealthResult: (overrides?: {}) => {
    project: string;
    healthy: boolean;
    responseTime: number;
    timestamp: number;
};
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
export declare const createMockDevServerConfig: (overrides?: {}) => {
    projects: {
        "test-project": {
            name: string;
            type: string;
            command: string;
            port: number;
            healthCheck: {
                type: string;
                path: string;
            };
        };
    };
};
export declare const createMockServerInfo: (overrides?: {}) => {
    name: string;
    description: string;
    type: string;
    status: string;
    port: number;
};
export declare const createMockHealthStatus: (overrides?: {}) => {
    project: string;
    healthy: boolean;
    responseTime: number;
    timestamp: number;
};
export declare const waitFor: (ms: number) => Promise<unknown>;
export declare const createMockEventEmitter: () => {
    on: import("vitest").Mock<(...args: any[]) => any>;
    off: import("vitest").Mock<(...args: any[]) => any>;
    emit: import("vitest").Mock<(...args: any[]) => any>;
    once: import("vitest").Mock<(...args: any[]) => any>;
    removeAllListeners: import("vitest").Mock<(...args: any[]) => any>;
};
export declare const createMockConsole: () => {
    log: import("vitest").Mock<(...args: any[]) => any>;
    error: import("vitest").Mock<(...args: any[]) => any>;
    warn: import("vitest").Mock<(...args: any[]) => any>;
    info: import("vitest").Mock<(...args: any[]) => any>;
    debug: import("vitest").Mock<(...args: any[]) => any>;
};
export declare const setupTestEnvironment: () => {
    mockFS: {
        files: Map<string, string>;
        readFile: import("vitest").Mock<(...args: any[]) => any>;
        writeFile: import("vitest").Mock<(...args: any[]) => any>;
        access: import("vitest").Mock<(...args: any[]) => any>;
    };
    mockProcess: {
        spawn: import("vitest").Mock<(...args: any[]) => any>;
        exec: import("vitest").Mock<(...args: any[]) => any>;
    };
    mockNetwork: {
        createServer: import("vitest").Mock<(...args: any[]) => any>;
    };
    mockLogger: {
        info: import("vitest").Mock<(...args: any[]) => any>;
        warn: import("vitest").Mock<(...args: any[]) => any>;
        error: import("vitest").Mock<(...args: any[]) => any>;
        debug: import("vitest").Mock<(...args: any[]) => any>;
    };
};
export declare const cleanupTestEnvironment: () => void;
