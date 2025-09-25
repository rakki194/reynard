/**
 * HTTP System Types
 *
 * Type definitions for the Reynard HTTP system including client configuration,
 * request/response types, middleware interfaces, and error handling.
 */

// AbortSignal is available globally in modern browsers and Node.js
declare global {
  interface AbortSignal {
    readonly aborted: boolean;
    addEventListener(type: string, listener: (event: Event) => void): void;
    removeEventListener(type: string, listener: (event: Event) => void): void;
  }
}

// ============================================================================
// Core HTTP Types
// ============================================================================

export interface HTTPClientConfig {
  baseUrl: string;
  timeout?: number;
  retries?: number;
  apiKey?: string;
  headers?: Record<string, string>;
  authToken?: string;
  enableRetry?: boolean;
  enableCircuitBreaker?: boolean;
  enableMetrics?: boolean;
  middleware?: import("./middleware-types").HTTPMiddleware[];
  preset?: string;
}

export interface HTTPRequestOptions {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
  endpoint: string;
  data?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  signal?: globalThis.AbortSignal;
  params?: Record<string, string | number | boolean>;
}

export interface HTTPResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: HTTPRequestOptions;
  requestTime: number;
}

export interface HTTPError extends Error {
  status?: number;
  statusText?: string;
  response?: HTTPResponse;
  config: HTTPRequestOptions;
  requestTime?: number;
  retryCount?: number;
}

// ============================================================================
// Middleware Types
// ============================================================================

// ============================================================================
// Authentication Types
// ============================================================================

export interface AuthConfig {
  type: "bearer" | "basic" | "api-key" | "custom";
  token?: string;
  username?: string;
  password?: string;
  apiKey?: string;
  apiKeyHeader?: string;
  customHeaders?: Record<string, string>;
}

export interface TokenRefreshConfig {
  refreshEndpoint: string;
  refreshToken: string;
  onTokenRefresh: (newToken: string) => void;
  onTokenExpired: () => void;
}

// ============================================================================
// Retry Types
// ============================================================================

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryCondition: (error: HTTPError) => boolean;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
}

// ============================================================================
// Metrics Types
// ============================================================================

export interface HTTPMetrics {
  requestCount: number;
  successCount: number;
  errorCount: number;
  averageResponseTime: number;
  lastRequestTime?: number;
  circuitBreakerState: "closed" | "open" | "half-open";
}

export interface RequestMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  success?: boolean;
  retryCount: number;
}
