/**
 * HTTP Client Implementation
 *
 * Main HTTP client class with comprehensive functionality including
 * middleware support, retry logic, circuit breaker, and error handling.
 * This is the primary interface for the Reynard HTTP system.
 */

import {
  HTTPClientConfig,
  HTTPRequestOptions,
  HTTPResponse,
  HTTPMetrics,
} from "./types";
import { HTTPMiddleware } from "./middleware-types";
import { HTTPClientCore } from "./client-core";
import { HTTPMethods } from "./http-methods";

// ============================================================================
// HTTP Client Implementation
// ============================================================================

export class HTTPClient {
  private core: HTTPClientCore;
  private httpMethods: HTTPMethods;

  constructor(config: HTTPClientConfig) {
    // Initialize core functionality
    this.core = new HTTPClientCore(config);
    
    // Initialize HTTP methods with bound request method
    this.httpMethods = new HTTPMethods(this.core.request.bind(this.core));
  }

  // ============================================================================
  // Core Request Method
  // ============================================================================

  /**
   * Make HTTP request with retry logic and middleware
   */
  async request<T = unknown>(options: HTTPRequestOptions): Promise<HTTPResponse<T>> {
    return this.core.request<T>(options);
  }

  // ============================================================================
  // Standard HTTP Methods
  // ============================================================================

  async get<T = unknown>(endpoint: string, options: Partial<HTTPRequestOptions> = {}): Promise<HTTPResponse<T>> {
    return this.httpMethods.get<T>(endpoint, options);
  }

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: Partial<HTTPRequestOptions> = {}
  ): Promise<HTTPResponse<T>> {
    return this.httpMethods.post<T>(endpoint, data, options);
  }

  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: Partial<HTTPRequestOptions> = {}
  ): Promise<HTTPResponse<T>> {
    return this.httpMethods.put<T>(endpoint, data, options);
  }

  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: Partial<HTTPRequestOptions> = {}
  ): Promise<HTTPResponse<T>> {
    return this.httpMethods.patch<T>(endpoint, data, options);
  }

  async delete<T = unknown>(endpoint: string, options: Partial<HTTPRequestOptions> = {}): Promise<HTTPResponse<T>> {
    return this.httpMethods.delete<T>(endpoint, options);
  }

  async head<T = unknown>(endpoint: string, options: Partial<HTTPRequestOptions> = {}): Promise<HTTPResponse<T>> {
    return this.httpMethods.head<T>(endpoint, options);
  }

  async options<T = unknown>(endpoint: string, options: Partial<HTTPRequestOptions> = {}): Promise<HTTPResponse<T>> {
    return this.httpMethods.options<T>(endpoint, options);
  }

  // ============================================================================
  // Convenience Methods with Common Patterns
  // ============================================================================

  /**
   * GET request with query parameters
   */
  async getWithParams<T = unknown>(
    endpoint: string,
    params: Record<string, string | number | boolean>,
    options: Partial<HTTPRequestOptions> = {}
  ): Promise<HTTPResponse<T>> {
    return this.httpMethods.getWithParams<T>(endpoint, params, options);
  }

  /**
   * POST request with JSON data
   */
  async postJson<T = unknown>(
    endpoint: string,
    data: unknown,
    options: Partial<HTTPRequestOptions> = {}
  ): Promise<HTTPResponse<T>> {
    return this.httpMethods.postJson<T>(endpoint, data, options);
  }

  /**
   * PUT request with JSON data
   */
  async putJson<T = unknown>(
    endpoint: string,
    data: unknown,
    options: Partial<HTTPRequestOptions> = {}
  ): Promise<HTTPResponse<T>> {
    return this.httpMethods.putJson<T>(endpoint, data, options);
  }

  /**
   * PATCH request with JSON data
   */
  async patchJson<T = unknown>(
    endpoint: string,
    data: unknown,
    options: Partial<HTTPRequestOptions> = {}
  ): Promise<HTTPResponse<T>> {
    return this.httpMethods.patchJson<T>(endpoint, data, options);
  }

  /**
   * POST request with FormData
   */
  async postForm<T = unknown>(
    endpoint: string,
    formData: FormData,
    options: Partial<HTTPRequestOptions> = {}
  ): Promise<HTTPResponse<T>> {
    return this.httpMethods.postForm<T>(endpoint, formData, options);
  }

  /**
   * PUT request with FormData
   */
  async putForm<T = unknown>(
    endpoint: string,
    formData: FormData,
    options: Partial<HTTPRequestOptions> = {}
  ): Promise<HTTPResponse<T>> {
    return this.httpMethods.putForm<T>(endpoint, formData, options);
  }

  // ============================================================================
  // Middleware Management
  // ============================================================================

  addMiddleware(middleware: HTTPMiddleware): void {
    this.core.addMiddleware(middleware);
  }

  removeMiddleware(middleware: HTTPMiddleware): void {
    this.core.removeMiddleware(middleware);
  }

  clearMiddleware(): void {
    this.core.clearMiddleware();
  }

  // ============================================================================
  // Configuration Management
  // ============================================================================

  updateConfig(newConfig: Partial<HTTPClientConfig>): void {
    this.core.updateConfig(newConfig);
  }

  // ============================================================================
  // Metrics and Monitoring
  // ============================================================================

  getMetrics(): HTTPMetrics {
    return this.core.getMetrics();
  }

  resetMetrics(): void {
    this.core.resetMetrics();
  }
}
