/**
 * HTTP System Types
 *
 * Type definitions for the Reynard HTTP system including client configuration,
 * request/response types, middleware interfaces, and error handling.
 */
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
    middleware?: HTTPMiddleware[];
    preset?: string;
}
export interface HTTPRequestOptions {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
    endpoint: string;
    data?: unknown;
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
    signal?: AbortSignal;
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
export interface HTTPMiddleware {
    /**
     * Process request before sending
     */
    request?: (config: HTTPRequestOptions) => HTTPRequestOptions | Promise<HTTPRequestOptions>;
    /**
     * Process response after receiving
     */
    response?: (response: HTTPResponse) => HTTPResponse | Promise<HTTPResponse>;
    /**
     * Process errors
     */
    error?: (error: HTTPError) => HTTPError | Promise<HTTPError>;
    /**
     * Process request completion (success or error)
     */
    complete?: (config: HTTPRequestOptions, response?: HTTPResponse, error?: HTTPError) => void | Promise<void>;
}
export interface HTTPMiddlewareContext {
    config: HTTPRequestOptions;
    response?: HTTPResponse;
    error?: HTTPError;
    retryCount: number;
    startTime: number;
}
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
export interface HTTPInterceptor {
    request?: (config: HTTPRequestOptions) => HTTPRequestOptions | Promise<HTTPRequestOptions>;
    response?: (response: HTTPResponse) => HTTPResponse | Promise<HTTPResponse>;
    error?: (error: HTTPError) => HTTPError | Promise<HTTPError>;
}
export interface HTTPAdapter {
    request(config: HTTPRequestOptions): Promise<HTTPResponse>;
}
export interface HTTPLogger {
    log(level: "info" | "warn" | "error", message: string, data?: unknown): void;
}
export interface HTTPPreset {
    name: string;
    config: Partial<HTTPClientConfig>;
    middleware: HTTPMiddleware[];
}
export declare const HTTP_PRESETS: Record<string, HTTPPreset>;
