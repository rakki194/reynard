/**
 * E2E Test Setup for Authentication Testing
 *
 * This module provides comprehensive setup for end-to-end authentication testing
 * across the Reynard ecosystem, including gatekeeper, backend, and auth package.
 */

import { beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import {
  setupBrowserMocks,
  resetBrowserMocks,
  mockFetch,
} from "reynard-testing";
import { createMockBackendServer } from "./backend-mock";
import { setupAuthTestEnvironment } from "./auth-helpers";

/**
 * E2E Test Configuration
 */
export interface E2ETestConfig {
  /** Backend server port for testing */
  backendPort?: number;
  /** Frontend server port for testing */
  frontendPort?: number;
  /** Enable real backend server (vs mock) */
  useRealBackend?: boolean;
  /** Test timeout in milliseconds */
  testTimeout?: number;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Default E2E test configuration
 */
const DEFAULT_CONFIG: Required<E2ETestConfig> = {
  backendPort: 8000,
  frontendPort: 3000,
  useRealBackend: false,
  testTimeout: 30000,
  debug: false,
};

/**
 * Global test state
 */
let testConfig: Required<E2ETestConfig>;
let mockBackend: any;
let authEnvironment: any;

/**
 * Setup E2E test environment
 */
export function setupE2ETests(config: E2ETestConfig = {}) {
  testConfig = { ...DEFAULT_CONFIG, ...config };

  beforeAll(async () => {
    // Setup browser mocks
    setupBrowserMocks();

    // Setup mock backend server if not using real backend
    if (!testConfig.useRealBackend) {
      mockBackend = await createMockBackendServer(testConfig.backendPort);
    }

    // Setup authentication test environment
    authEnvironment = await setupAuthTestEnvironment(testConfig);

    if (testConfig.debug) {
      console.log("🦊 E2E Test Environment Setup Complete");
      console.log(
        `Backend: ${testConfig.useRealBackend ? "Real" : "Mock"} (port ${testConfig.backendPort})`,
      );
      console.log(`Frontend: port ${testConfig.frontendPort}`);
    }
  }, testConfig.testTimeout);

  beforeEach(async () => {
    // Reset browser mocks before each test
    resetBrowserMocks();

    // Clear authentication state
    if (authEnvironment) {
      await authEnvironment.clearAuthState();
    }

    // Reset mock backend state
    if (mockBackend) {
      await mockBackend.reset();
    }
  });

  afterEach(() => {
    // Clean up after each test
    if (testConfig.debug) {
      console.log("🧹 E2E Test Cleanup Complete");
    }
  });

  afterAll(async () => {
    // Cleanup test environment
    if (mockBackend) {
      await mockBackend.stop();
    }

    if (authEnvironment) {
      await authEnvironment.cleanup();
    }

    if (testConfig.debug) {
      console.log("🦊 E2E Test Environment Cleanup Complete");
    }
  }, 10000);
}

/**
 * Get current test configuration
 */
export function getTestConfig(): Required<E2ETestConfig> {
  return testConfig;
}

/**
 * Get mock backend instance
 */
export function getMockBackend() {
  return mockBackend;
}

/**
 * Get authentication environment
 */
export function getAuthEnvironment() {
  return authEnvironment;
}

/**
 * Helper to wait for authentication state
 */
export async function waitForAuthState(
  expectedState: "authenticated" | "unauthenticated",
  timeout: number = 5000,
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const currentState = authEnvironment?.getAuthState();
    if (currentState === expectedState) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error(`Timeout waiting for auth state: ${expectedState}`);
}

/**
 * Helper to simulate network conditions
 */
export function simulateNetworkConditions(
  condition: "online" | "offline" | "slow" | "fast",
) {
  switch (condition) {
    case "offline":
      mockFetch.mockRejectedValue(new Error("Network error"));
      break;
    case "slow":
      mockFetch.mockImplementation(async (_url: any, _options: any) => {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return new Response(JSON.stringify({}), { status: 200 });
      });
      break;
    case "fast":
      mockFetch.mockImplementation(async (_url: any, _options: any) => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return new Response(JSON.stringify({}), { status: 200 });
      });
      break;
    case "online":
    default:
      // Reset to default behavior
      resetBrowserMocks();
      break;
  }
}

/**
 * Helper to capture test artifacts
 */
export function captureTestArtifacts(testName: string) {
  const artifacts = {
    screenshots: [] as Array<{ name: string; data: string; timestamp: number }>,
    networkLogs: [] as Array<{
      request: any;
      response: any;
      timestamp: number;
    }>,
    consoleLogs: [] as Array<{
      level: string;
      message: string;
      timestamp: number;
    }>,
    errors: [] as Array<{ error: Error; timestamp: number }>,

    addScreenshot: (name: string, data: string) => {
      artifacts.screenshots.push({ name, data, timestamp: Date.now() });
    },

    addNetworkLog: (request: any, response: any) => {
      artifacts.networkLogs.push({ request, response, timestamp: Date.now() });
    },

    addConsoleLog: (level: string, message: string) => {
      artifacts.consoleLogs.push({ level, message, timestamp: Date.now() });
    },

    addError: (error: Error) => {
      artifacts.errors.push({ error, timestamp: Date.now() });
    },

    save: async () => {
      if (testConfig.debug) {
        console.log(`📸 Test artifacts captured for: ${testName}`);
        console.log(`Screenshots: ${artifacts.screenshots.length}`);
        console.log(`Network logs: ${artifacts.networkLogs.length}`);
        console.log(`Console logs: ${artifacts.consoleLogs.length}`);
        console.log(`Errors: ${artifacts.errors.length}`);
      }
    },
  };

  return artifacts;
}
