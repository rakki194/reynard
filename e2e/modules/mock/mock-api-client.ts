/**
 * Mock API Client for E2E Testing
 *
 * Provides a mock HTTP client that simulates API requests for testing purposes.
 */

import type { MockResponse } from "./mock-types.js";

/**
 * Mock API client for testing
 */
export class MockApiClient {
  private responses: Map<string, MockResponse> = new Map();

  constructor(_baseUrl: string = "http://localhost:8000") {
    // Base URL is available for future use if needed
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
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<Response> {
    return this.mockRequest("POST", endpoint, body, headers);
  }

  /**
   * Mock a PUT request
   */
  async put(
    endpoint: string,
    body?: unknown,
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
    _body?: unknown,
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
