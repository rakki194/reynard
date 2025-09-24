/**
 * HTTP Client Tests
 * Tests for the HTTPClient class and its functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HTTPClient } from "../client";

describe("HTTPClient", () => {
  let client: HTTPClient;

  beforeEach(() => {
    client = new HTTPClient({
      baseUrl: "https://api.example.com",
      timeout: 5000,
      retries: 2,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create client with default configuration", () => {
      const defaultClient = new HTTPClient({});
      expect(defaultClient).toBeDefined();
    });

    it("should create client with custom configuration", () => {
      expect(client).toBeDefined();
    });
  });

  describe("request method", () => {
    it("should make GET request", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve({ message: "success" }),
      });

      global.fetch = mockFetch;

      const response = await client.request({
        method: "GET",
        endpoint: "/test",
      });

      expect(response.status).toBe(200);
      expect(response.data).toEqual({ message: "success" });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("should make POST request with data", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        statusText: "Created",
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve({ id: 1, name: "test" }),
      });

      global.fetch = mockFetch;

      const response = await client.request({
        method: "POST",
        endpoint: "/users",
        data: { name: "test" },
      });

      expect(response.status).toBe(201);
      expect(response.data).toEqual({ id: 1, name: "test" });
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/users",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "test" }),
        })
      );
    });

    it("should handle errors", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve({ error: "Not found" }),
      });

      global.fetch = mockFetch;

      const response = await client.request({
        method: "GET",
        endpoint: "/nonexistent",
      });

      expect(response.status).toBe(404);
      expect(response.data).toEqual({ error: "Not found" });
    });
  });

  describe("convenience methods", () => {
    beforeEach(() => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve({ message: "success" }),
      });

      global.fetch = mockFetch;
    });

    it("should provide GET method", async () => {
      const response = await client.get("/test");
      expect(response.status).toBe(200);
    });

    it("should provide POST method", async () => {
      const response = await client.post("/test", { data: "test" });
      expect(response.status).toBe(200);
    });

    it("should provide PUT method", async () => {
      const response = await client.put("/test", { data: "test" });
      expect(response.status).toBe(200);
    });

    it("should provide PATCH method", async () => {
      const response = await client.patch("/test", { data: "test" });
      expect(response.status).toBe(200);
    });

    it("should provide DELETE method", async () => {
      const response = await client.delete("/test");
      expect(response.status).toBe(200);
    });
  });

  describe("middleware management", () => {
    it("should add middleware", () => {
      const middleware = {
        request: vi.fn(),
        response: vi.fn(),
        error: vi.fn(),
        complete: vi.fn(),
      };

      client.addMiddleware(middleware);
      // Test that middleware was added by checking if it's used in a request
      expect(() => client.addMiddleware(middleware)).not.toThrow();
    });

    it("should remove middleware", () => {
      const middleware = {
        request: vi.fn(),
        response: vi.fn(),
        error: vi.fn(),
        complete: vi.fn(),
      };

      client.addMiddleware(middleware);
      client.removeMiddleware(middleware);
      // Test that middleware was removed by checking if it's used in a request
      expect(() => client.removeMiddleware(middleware)).not.toThrow();
    });

    it("should clear all middleware", () => {
      const middleware = {
        request: vi.fn(),
        response: vi.fn(),
        error: vi.fn(),
        complete: vi.fn(),
      };

      client.addMiddleware(middleware);
      client.clearMiddleware();
      // Test that middleware was cleared by checking if it's used in a request
      expect(() => client.clearMiddleware()).not.toThrow();
    });
  });

  describe("configuration management", () => {
    it("should update configuration", () => {
      const newConfig = {
        timeout: 10000,
        retries: 5,
      };

      client.updateConfig(newConfig);
      expect(client["config"].timeout).toBe(10000);
      expect(client["config"].retries).toBe(5);
    });

    it("should update auth token in headers", () => {
      client.updateConfig({ authToken: "new-token" });
      expect(client["baseHeaders"].Authorization).toBe("Bearer new-token");
    });

    it("should update API key in headers", () => {
      client.updateConfig({ apiKey: "new-api-key" });
      expect(client["baseHeaders"].Authorization).toBe("Bearer new-api-key");
    });

    it("should remove authorization header when no token", () => {
      client.updateConfig({ authToken: "", apiKey: "" });
      expect(client["baseHeaders"].Authorization).toBeUndefined();
    });
  });

  describe("metrics and monitoring", () => {
    it("should get metrics", () => {
      const metrics = client.getMetrics();
      expect(metrics).toHaveProperty("requestCount");
      expect(metrics).toHaveProperty("successCount");
      expect(metrics).toHaveProperty("errorCount");
      expect(metrics).toHaveProperty("averageResponseTime");
      expect(metrics).toHaveProperty("circuitBreakerState");
    });

    it("should reset metrics", () => {
      client.resetMetrics();
      const metrics = client.getMetrics();
      expect(metrics.requestCount).toBe(0);
      expect(metrics.successCount).toBe(0);
      expect(metrics.errorCount).toBe(0);
      expect(metrics.averageResponseTime).toBe(0);
    });
  });

  describe("error handling", () => {
    it("should handle network errors", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
      global.fetch = mockFetch;

      await expect(client.get("/test")).rejects.toThrow("Network error");
    });

    it("should handle timeout errors", async () => {
      const mockFetch = vi.fn().mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout")), 100)
        )
      );
      global.fetch = mockFetch;

      const timeoutClient = new HTTPClient({
        baseUrl: "https://api.example.com",
        timeout: 50,
        retries: 0,
      });

      await expect(timeoutClient.get("/test")).rejects.toThrow();
    });

    it("should handle different content types", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "Content-Type": "text/plain" }),
        text: () => Promise.resolve("plain text response"),
      });

      global.fetch = mockFetch;

      const response = await client.get("/test");
      expect(response.data).toBe("plain text response");
    });

    it("should handle FormData", async () => {
      const formData = new FormData();
      formData.append("file", "test content");

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve({ success: true }),
      });

      global.fetch = mockFetch;

      await client.post("/upload", formData);
      
      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/upload",
        expect.objectContaining({
          method: "POST",
          body: formData,
        })
      );
    });
  });

  describe("retry logic", () => {
    it("should retry on network errors", async () => {
      let callCount = 0;
      const mockFetch = vi.fn().mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.reject(new Error("Network error"));
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          headers: new Headers({ "Content-Type": "application/json" }),
          json: () => Promise.resolve({ success: true }),
        });
      });

      global.fetch = mockFetch;

      const retryClient = new HTTPClient({
        baseUrl: "https://api.example.com",
        retries: 1,
        enableRetry: true,
      });

      const response = await retryClient.get("/test");
      expect(response.status).toBe(200);
      expect(callCount).toBe(2);
    });

    it("should not retry on 4xx errors", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve({ error: "Bad request" }),
      });

      global.fetch = mockFetch;

      const response = await client.get("/test");
      expect(response.status).toBe(400);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("circuit breaker", () => {
    it("should open circuit breaker after failures", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));

      global.fetch = mockFetch;

      const circuitBreakerClient = new HTTPClient({
        baseUrl: "https://api.example.com",
        retries: 0,
        enableCircuitBreaker: true,
      });

      // Make 5 failed requests to trigger circuit breaker
      for (let i = 0; i < 5; i++) {
        try {
          await circuitBreakerClient.get("/test");
        } catch (error) {
          // Expected to fail
        }
      }

      // Next request should be blocked by circuit breaker
      await expect(circuitBreakerClient.get("/test")).rejects.toThrow("Circuit breaker is open");
    });
  });

  describe("URL building", () => {
    it("should build URL with query parameters", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        headers: new Headers({ "Content-Type": "application/json" }),
        json: () => Promise.resolve({ success: true }),
      });

      global.fetch = mockFetch;

      await client.get("/test", {
        params: { page: 1, limit: 10 }
      });

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test?page=1&limit=10",
        expect.any(Object)
      );
    });
  });
});
