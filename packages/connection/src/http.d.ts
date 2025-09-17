import { BaseConnection } from "./base";
import { ConnectionConfig, HealthCheckResult } from "./types";
/**
 * HTTP Client with request handling
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
}
export interface HTTPRequestOptions {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    endpoint: string;
    data?: unknown;
    headers?: Record<string, string>;
    timeout?: number;
    retries?: number;
    signal?: AbortSignal;
}
export interface HTTPResponse<T = unknown> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: HTTPRequestOptions;
}
export interface HTTPError extends Error {
    status?: number;
    statusText?: string;
    response?: HTTPResponse;
    config: HTTPRequestOptions;
}
export declare class HTTPClient {
    private config;
    private baseHeaders;
    private requestCount;
    private errorCount;
    constructor(config: HTTPClientConfig);
    /**
     * Make HTTP request with retry logic and exponential backoff
     */
    request<T = unknown>(options: HTTPRequestOptions): Promise<HTTPResponse<T>>;
    /**
     * Convenience methods for common HTTP operations
     */
    get<T = unknown>(endpoint: string, options?: Partial<HTTPRequestOptions>): Promise<HTTPResponse<T>>;
    post<T = unknown>(endpoint: string, data?: unknown, options?: Partial<HTTPRequestOptions>): Promise<HTTPResponse<T>>;
    put<T = unknown>(endpoint: string, data?: unknown, options?: Partial<HTTPRequestOptions>): Promise<HTTPResponse<T>>;
    delete<T = unknown>(endpoint: string, options?: Partial<HTTPRequestOptions>): Promise<HTTPResponse<T>>;
    patch<T = unknown>(endpoint: string, data?: unknown, options?: Partial<HTTPRequestOptions>): Promise<HTTPResponse<T>>;
    /**
     * Upload file with multipart form data
     */
    upload<T = unknown>(endpoint: string, file: File, options?: Partial<HTTPRequestOptions>): Promise<HTTPResponse<T>>;
    /**
     * Get client metrics
     */
    getMetrics(): {
        requestCount: number;
        errorCount: number;
        errorRate: number;
    };
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<HTTPClientConfig>): void;
}
export declare class HTTPConnection extends BaseConnection {
    private controller?;
    private httpClient?;
    constructor(config: ConnectionConfig);
    connect(): Promise<boolean>;
    disconnect(): Promise<boolean>;
    isConnected(): Promise<boolean>;
    healthCheck(): Promise<HealthCheckResult>;
    protected sendImpl(data: unknown): Promise<boolean>;
    protected receiveImpl(): Promise<unknown>;
}
