/**
 * HTTP Methods Implementation
 *
 * Comprehensive convenience methods for all HTTP operations including
 * GET, POST, PUT, PATCH, DELETE, HEAD, and OPTIONS.
 */

import { HTTPRequestOptions, HTTPResponse } from "./types";

export class HTTPMethods {
  constructor(private request: <T = unknown>(options: HTTPRequestOptions) => Promise<HTTPResponse<T>>) {}

  // ============================================================================
  // Standard HTTP Methods
  // ============================================================================

  async get<T = unknown>(endpoint: string, options: Partial<HTTPRequestOptions> = {}): Promise<HTTPResponse<T>> {
    return this.request<T>({ ...options, method: "GET", endpoint });
  }

  async post<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: Partial<HTTPRequestOptions> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>({ ...options, method: "POST", endpoint, data });
  }

  async put<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: Partial<HTTPRequestOptions> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>({ ...options, method: "PUT", endpoint, data });
  }

  async patch<T = unknown>(
    endpoint: string,
    data?: unknown,
    options: Partial<HTTPRequestOptions> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>({ ...options, method: "PATCH", endpoint, data });
  }

  async delete<T = unknown>(endpoint: string, options: Partial<HTTPRequestOptions> = {}): Promise<HTTPResponse<T>> {
    return this.request<T>({ ...options, method: "DELETE", endpoint });
  }

  async head<T = unknown>(endpoint: string, options: Partial<HTTPRequestOptions> = {}): Promise<HTTPResponse<T>> {
    return this.request<T>({ ...options, method: "HEAD", endpoint });
  }

  async options<T = unknown>(endpoint: string, options: Partial<HTTPRequestOptions> = {}): Promise<HTTPResponse<T>> {
    return this.request<T>({ ...options, method: "OPTIONS", endpoint });
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
    return this.request<T>({ ...options, method: "GET", endpoint, params });
  }

  /**
   * POST request with JSON data
   */
  async postJson<T = unknown>(
    endpoint: string,
    data: unknown,
    options: Partial<HTTPRequestOptions> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>({
      ...options,
      method: "POST",
      endpoint,
      data,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  }

  /**
   * PUT request with JSON data
   */
  async putJson<T = unknown>(
    endpoint: string,
    data: unknown,
    options: Partial<HTTPRequestOptions> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>({
      ...options,
      method: "PUT",
      endpoint,
      data,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  }

  /**
   * PATCH request with JSON data
   */
  async patchJson<T = unknown>(
    endpoint: string,
    data: unknown,
    options: Partial<HTTPRequestOptions> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>({
      ...options,
      method: "PATCH",
      endpoint,
      data,
      headers: { "Content-Type": "application/json", ...options.headers },
    });
  }

  /**
   * POST request with FormData
   */
  async postForm<T = unknown>(
    endpoint: string,
    formData: FormData,
    options: Partial<HTTPRequestOptions> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>({ ...options, method: "POST", endpoint, data: formData });
  }

  /**
   * PUT request with FormData
   */
  async putForm<T = unknown>(
    endpoint: string,
    formData: FormData,
    options: Partial<HTTPRequestOptions> = {}
  ): Promise<HTTPResponse<T>> {
    return this.request<T>({ ...options, method: "PUT", endpoint, data: formData });
  }
}
