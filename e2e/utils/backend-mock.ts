/**
 * Mock Backend Server for E2E Authentication Testing
 *
 * Provides a comprehensive mock backend server that simulates the Reynard backend
 * and Gatekeeper authentication endpoints for testing purposes.
 */

// import { mockFetch } from "reynard-testing";

/**
 * Mock Backend Server Configuration
 */
export interface MockBackendConfig {
  port: number;
  baseUrl: string;
  delay?: number;
  debug?: boolean;
}

/**
 * Mock API Response
 */
export interface MockResponse {
  status: number;
  body: any;
  headers?: Record<string, string>;
  delay?: number;
}

/**
 * Mock Backend Server Class
 */
export class MockBackendServer {
  private config: MockBackendConfig;
  private responses: Map<string, MockResponse> = new Map();
  private requestLog: any[] = [];
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
    // Default successful responses
    this.mockResponse("/api/auth/register", {
      status: 201,
      body: { message: "User created successfully" },
    });

    this.mockResponse("/api/auth/login", {
      status: 200,
      body: {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        token_type: "bearer",
      },
    });

    this.mockResponse("/api/auth/refresh", {
      status: 200,
      body: {
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
        token_type: "bearer",
      },
    });

    this.mockResponse("/api/auth/logout", {
      status: 200,
      body: { message: "Successfully logged out" },
    });

    this.mockResponse("/api/auth/me", {
      status: 200,
      body: {
        id: "123",
        username: "testuser",
        email: "test@example.com",
        is_active: true,
        role: "user",
      },
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
    // Setup authentication-specific endpoints
    this.mockResponse("/auth/login", {
      status: 200,
      body: {
        access_token: "gatekeeper-access-token",
        refresh_token: "gatekeeper-refresh-token",
        token_type: "bearer",
      },
    });

    this.mockResponse("/auth/refresh", {
      status: 200,
      body: {
        access_token: "new-gatekeeper-access-token",
        refresh_token: "new-gatekeeper-refresh-token",
        token_type: "bearer",
      },
    });

    this.mockResponse("/auth/logout", {
      status: 200,
      body: { message: "Successfully logged out" },
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
  getRequestLog(): any[] {
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

/**
 * Create a mock backend server instance
 */
export async function createMockBackendServer(
  port: number = 8000,
): Promise<MockBackendServer> {
  const server = new MockBackendServer({
    port,
    baseUrl: `http://localhost:${port}`,
    debug: true,
  });

  await server.start();
  return server;
}

/**
 * Mock API client for testing
 */
export class MockApiClient {
  private _baseUrl: string;
  private responses: Map<string, MockResponse> = new Map();

  constructor(baseUrl: string = "http://localhost:8000") {
    this._baseUrl = baseUrl;
  }

  /**
   * Mock a GET request
   */
  async get(
    endpoint: string,
    headers?: Record<string, string>,
  ): Promise<Response> {
    return this.mockRequest("GET", endpoint, undefined, headers);
  }

  /**
   * Mock a POST request
   */
  async post(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>,
  ): Promise<Response> {
    return this.mockRequest("POST", endpoint, body, headers);
  }

  /**
   * Mock a PUT request
   */
  async put(
    endpoint: string,
    body?: any,
    headers?: Record<string, string>,
  ): Promise<Response> {
    return this.mockRequest("PUT", endpoint, body, headers);
  }

  /**
   * Mock a DELETE request
   */
  async delete(
    endpoint: string,
    headers?: Record<string, string>,
  ): Promise<Response> {
    return this.mockRequest("DELETE", endpoint, undefined, headers);
  }

  /**
   * Mock a generic request
   */
  private async mockRequest(
    _method: string,
    endpoint: string,
    _body?: any,
    _headers?: Record<string, string>,
  ): Promise<Response> {
    const response = this.responses.get(endpoint) || {
      status: 404,
      body: { detail: "Not found" },
    };

    // Simulate delay
    if (response.delay) {
      await new Promise((resolve) => setTimeout(resolve, response.delay));
    }

    return new Response(JSON.stringify(response.body), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        ...response.headers,
      },
    });
  }

  /**
   * Set mock response for an endpoint
   */
  setMockResponse(endpoint: string, response: MockResponse): void {
    this.responses.set(endpoint, response);
  }

  /**
   * Clear all mock responses
   */
  clearMockResponses(): void {
    this.responses.clear();
  }
}

/**
 * Authentication-specific mock helpers
 */
export class AuthMockHelpers {
  private apiClient: MockApiClient;

  constructor(apiClient: MockApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Mock successful user registration
   */
  mockSuccessfulRegistration(userData: any): void {
    this.apiClient.setMockResponse("/api/auth/register", {
      status: 201,
      body: {
        user: {
          id: "123",
          username: userData.username,
          email: userData.email,
          is_active: true,
          created_at: new Date().toISOString(),
        },
      },
    });
  }

  /**
   * Mock successful user login
   */
  mockSuccessfulLogin(_userData: any): void {
    this.apiClient.setMockResponse("/api/auth/login", {
      status: 200,
      body: {
        access_token: "mock-access-token",
        refresh_token: "mock-refresh-token",
        token_type: "bearer",
      },
    });
  }

  /**
   * Mock authentication failure
   */
  mockAuthenticationFailure(): void {
    this.apiClient.setMockResponse("/api/auth/login", {
      status: 401,
      body: { detail: "Incorrect username or password" },
    });
  }

  /**
   * Mock rate limiting
   */
  mockRateLimit(): void {
    this.apiClient.setMockResponse("/api/auth/login", {
      status: 429,
      body: { detail: "Too many login attempts" },
    });
  }

  /**
   * Mock token refresh
   */
  mockTokenRefresh(): void {
    this.apiClient.setMockResponse("/api/auth/refresh", {
      status: 200,
      body: {
        access_token: "new-access-token",
        refresh_token: "new-refresh-token",
        token_type: "bearer",
      },
    });
  }

  /**
   * Mock invalid refresh token
   */
  mockInvalidRefreshToken(): void {
    this.apiClient.setMockResponse("/api/auth/refresh", {
      status: 401,
      body: { detail: "Invalid refresh token" },
    });
  }

  /**
   * Mock successful logout
   */
  mockSuccessfulLogout(): void {
    this.apiClient.setMockResponse("/api/auth/logout", {
      status: 200,
      body: { message: "Successfully logged out" },
    });
  }

  /**
   * Mock user profile data
   */
  mockUserProfile(userData: any): void {
    this.apiClient.setMockResponse("/api/auth/me", {
      status: 200,
      body: {
        id: "123",
        username: userData.username,
        email: userData.email,
        is_active: true,
        role: userData.role || "user",
        permissions: userData.permissions || [],
      },
    });
  }
}
