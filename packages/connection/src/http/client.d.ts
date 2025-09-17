/**
 * HTTP Client Implementation
 *
 * Main HTTP client class with middleware support, retry logic, circuit breaker,
 * and comprehensive error handling. This is the core of the Reynard HTTP system.
 */
import { BaseConnection } from "../base";
import { ConnectionConfig, HealthCheckResult } from "../types";
import { HTTPClientConfig, HTTPRequestOptions, HTTPResponse, HTTPMiddleware, HTTPMetrics } from "./types";
export declare class HTTPClient {
    private config;
    private baseHeaders;
    private middleware;
    private metrics;
    private circuitBreakerState;
    private circuitBreakerFailures;
    private circuitBreakerLastFailure;
    constructor(config: HTTPClientConfig);
    /**
     * Make HTTP request with retry logic and middleware
     */
    request<T = unknown>(options: HTTPRequestOptions): Promise<HTTPResponse<T>>;
    get<T = unknown>(endpoint: string, options?: Partial<HTTPRequestOptions>): Promise<HTTPResponse<T>>;
    post<T = unknown>(endpoint: string, data?: unknown, options?: Partial<HTTPRequestOptions>): Promise<HTTPResponse<T>>;
    put<T = unknown>(endpoint: string, data?: unknown, options?: Partial<HTTPRequestOptions>): Promise<HTTPResponse<T>>;
    patch<T = unknown>(endpoint: string, data?: unknown, options?: Partial<HTTPRequestOptions>): Promise<HTTPResponse<T>>;
    delete<T = unknown>(endpoint: string, options?: Partial<HTTPRequestOptions>): Promise<HTTPResponse<T>>;
    addMiddleware(middleware: HTTPMiddleware): void;
    removeMiddleware(middleware: HTTPMiddleware): void;
    clearMiddleware(): void;
    updateConfig(newConfig: Partial<HTTPClientConfig>): void;
    getMetrics(): HTTPMetrics;
    resetMetrics(): void;
    private buildUrl;
    private createError;
    private shouldRetry;
    private calculateRetryDelay;
    private updateMetrics;
    private updateCircuitBreaker;
}
export declare class HTTPConnection extends BaseConnection {
    private client;
    private controller?;
    constructor(config: ConnectionConfig);
    connect(): Promise<boolean>;
    disconnect(): Promise<boolean>;
    isConnected(): Promise<boolean>;
    healthCheck(): Promise<HealthCheckResult>;
    protected sendImpl(data: unknown): Promise<boolean>;
    protected receiveImpl(): Promise<unknown>;
}
