/**
 * HTTP Utility Types
 *
 * Utility types and interfaces for the HTTP client system.
 */

import { HTTPRequestOptions, HTTPResponse, HTTPError } from "./types";

// ============================================================================
// Utility Types
// ============================================================================

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

export interface HTTPCache {
  get(key: string): Promise<HTTPResponse | null>;
  set(key: string, response: HTTPResponse, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

export interface HTTPRateLimiter {
  canMakeRequest(identifier: string): Promise<boolean>;
  recordRequest(identifier: string): Promise<void>;
  getRemainingRequests(identifier: string): Promise<number>;
  getResetTime(identifier: string): Promise<number>;
}

export interface HTTPRetryPolicy {
  shouldRetry(error: HTTPError, attempt: number): boolean;
  getDelay(attempt: number): number;
  getMaxRetries(): number;
}

export interface HTTPTimeoutPolicy {
  getTimeout(attempt: number): number;
  shouldExtendTimeout(error: HTTPError): boolean;
}

export interface HTTPCircuitBreakerPolicy {
  shouldOpen(error: HTTPError, failureCount: number): boolean;
  shouldClose(failureCount: number, lastFailureTime: number): boolean;
  getRecoveryTimeout(): number;
}

export interface HTTPMetricsCollector {
  recordRequest(options: HTTPRequestOptions): void;
  recordResponse(response: HTTPResponse, duration: number): void;
  recordError(error: HTTPError, duration: number): void;
  getMetrics(): Record<string, unknown>;
  reset(): void;
}

export interface HTTPRequestValidator {
  validateRequest(options: HTTPRequestOptions): Promise<boolean>;
  validateResponse(response: HTTPResponse): Promise<boolean>;
}

export interface HTTPResponseTransformer {
  transformRequest(options: HTTPRequestOptions): Promise<HTTPRequestOptions>;
  transformResponse(response: HTTPResponse): Promise<HTTPResponse>;
}

export interface HTTPErrorHandler {
  handleError(error: HTTPError): Promise<HTTPError>;
  shouldRetry(error: HTTPError): boolean;
  getRetryDelay(error: HTTPError, attempt: number): number;
}

export interface HTTPRequestBuilder {
  buildRequest(options: HTTPRequestOptions): Promise<RequestInit>;
  buildUrl(endpoint: string, baseUrl: string, params?: Record<string, unknown>): string;
}

export interface HTTPResponseParser {
  parseResponse(response: Response): Promise<HTTPResponse>;
  parseError(error: Error, request: HTTPRequestOptions): HTTPError;
}

export interface HTTPRequestSigner {
  signRequest(options: HTTPRequestOptions): Promise<HTTPRequestOptions>;
  getSignature(options: HTTPRequestOptions): Promise<string>;
}

export interface HTTPRequestCompressor {
  compressRequest(options: HTTPRequestOptions): Promise<HTTPRequestOptions>;
  decompressResponse(response: HTTPResponse): Promise<HTTPResponse>;
}

export interface HTTPRequestEncryptor {
  encryptRequest(options: HTTPRequestOptions): Promise<HTTPRequestOptions>;
  decryptResponse(response: HTTPResponse): Promise<HTTPResponse>;
}
