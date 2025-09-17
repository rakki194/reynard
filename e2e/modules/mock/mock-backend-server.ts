/**
 * Mock Backend Server for E2E Testing
 *
 * Provides a comprehensive mock backend server that simulates the Reynard backend
 * and Gatekeeper authentication endpoints for testing purposes.
 */

import type { MockBackendConfig, MockResponse } from "./mock-types.js";
import { DEFAULT_AUTH_ENDPOINTS, GATEKEEPER_AUTH_ENDPOINTS } from "./mock-endpoint-configs.js";

/**
 * Mock Backend Server Class
 */
export class MockBackendServer {
  private config: MockBackendConfig;
  private responses: Map<string, MockResponse> = new Map();
  private requestLog: unknown[] = [];
  private isRunning: boolean = false;

  constructor(config: MockBackendConfig) {
    this.config = {
      delay: 100,
      debug: false,
      ...config,
    };
  }

  /**
   * Start the mock server
   */
  async start(): Promise<void> {
    this.isRunning = true;
    this.setupDefaultEndpoints();

    if (this.config.debug) {
      console.log(`🦊 Mock Backend Server started on port ${this.config.port}`);
    }
  }

  /**
   * Stop the mock server
   */
  async stop(): Promise<void> {
    this.isRunning = false;
    this.responses.clear();
    this.requestLog = [];

    if (this.config.debug) {
      console.log("🦊 Mock Backend Server stopped");
    }
  }

  /**
   * Reset server state
   */
  async reset(): Promise<void> {
    this.responses.clear();
    this.requestLog = [];
    this.setupDefaultEndpoints();
  }

  /**
   * Setup default authentication endpoints
   */
  private setupDefaultEndpoints(): void {
    Object.entries(DEFAULT_AUTH_ENDPOINTS).forEach(([endpoint, response]) => {
      this.mockResponse(endpoint, response);
    });
  }

  /**
   * Mock a specific endpoint response
   */
  mockResponse(endpoint: string, response: MockResponse): void {
    this.responses.set(endpoint, response);

    if (this.config.debug) {
      console.log(`🦊 Mocked endpoint: ${endpoint} -> ${response.status}`);
    }
  }

  /**
   * Mock authentication endpoints with specific responses
   */
  async setupAuthEndpoints(): Promise<void> {
    Object.entries(GATEKEEPER_AUTH_ENDPOINTS).forEach(([endpoint, response]) => {
      this.mockResponse(endpoint, response);
    });
  }

  /**
   * Mock network error for an endpoint
   */
  mockNetworkError(endpoint: string): void {
    this.responses.set(endpoint, {
      status: 0,
      body: null,
    });
  }

  /**
   * Get request log
   */
  getRequestLog(): unknown[] {
    return [...this.requestLog];
  }

  /**
   * Clear request log
   */
  clearRequestLog(): void {
    this.requestLog = [];
  }

  /**
   * Check if server is running
   */
  get isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Get server configuration
   */
  getConfig(): MockBackendConfig {
    return { ...this.config };
  }
}
