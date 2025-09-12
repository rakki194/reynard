/**
 * Tests for HttpClient
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  HttpClient,
  HttpClientConfig,
  RequestOptions,
  UploadOptions,
} from "./http-client";
import { i18n } from "reynard-i18n";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("HttpClient", () => {
  let httpClient: HttpClient;
  let config: HttpClientConfig;

  beforeEach(() => {
    config = {
      baseUrl: "https://api.example.com",
      timeout: 30000,
      retries: 3,
      apiKey: "test-key",
      headers: { "X-Custom": "value" },
    };

    httpClient = new HttpClient(config);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create HttpClient with default config", () => {
      const defaultConfig: HttpClientConfig = {
        baseUrl: "https://api.example.com",
      };

      const client = new HttpClient(defaultConfig);

      expect((client as any).config).toEqual({
        baseUrl: "https://api.example.com",
        timeout: 30000,
        retries: 3,
        headers: {},
      });
    });

    it("should create HttpClient with custom config", () => {
      expect((httpClient as any).config).toEqual({
        baseUrl: "https://api.example.com",
        timeout: 30000,
        retries: 3,
        apiKey: "test-key",
        headers: { "X-Custom": "value" },
      });
    });

    it("should set up base headers with API key", () => {
      const baseHeaders = (httpClient as any).baseHeaders;

      expect(baseHeaders).toEqual({
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Custom": "value",
        Authorization: i18n.t("core.bearer.test-key"),
      });
    });

    it("should set up base headers without API key", () => {
      const configWithoutKey: HttpClientConfig = {
        baseUrl: "https://api.example.com",
        headers: { "X-Custom": "value" },
      };

      const client = new HttpClient(configWithoutKey);
      const baseHeaders = (client as any).baseHeaders;

      expect(baseHeaders).toEqual({
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Custom": "value",
      });
    });
  });

  describe("request", () => {
    it("should make successful GET request", async () => {
      const mockResponse = { data: "test" };
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      mockFetch.mockResolvedValue(mockFetchResponse);

      const options: RequestOptions = {
        method: "GET",
        endpoint: "/test",
      };

      const result = await httpClient.request(options);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: i18n.t("core.bearer.test-key"),
            "X-Custom": "value",
          }),
          signal: expect.any(AbortSignal),
        }),
      );

      expect(result).toEqual(mockResponse);
    });

    it("should make successful POST request with data", async () => {
      const mockResponse = { success: true };
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      mockFetch.mockResolvedValue(mockFetchResponse);

      const options: RequestOptions = {
        method: "POST",
        endpoint: "/test",
        data: { name: "test" },
      };

      const result = await httpClient.request(options);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ name: "test" }),
        }),
      );

      expect(result).toEqual(mockResponse);
    });

    it("should make successful PUT request with data", async () => {
      const mockResponse = { updated: true };
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      mockFetch.mockResolvedValue(mockFetchResponse);

      const options: RequestOptions = {
        method: "PUT",
        endpoint: "/test/1",
        data: { name: "updated" },
      };

      const result = await httpClient.request(options);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test/1",
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify({ name: "updated" }),
        }),
      );

      expect(result).toEqual(mockResponse);
    });

    it("should make successful PATCH request with data", async () => {
      const mockResponse = { patched: true };
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      mockFetch.mockResolvedValue(mockFetchResponse);

      const options: RequestOptions = {
        method: "PATCH",
        endpoint: "/test/1",
        data: { name: "patched" },
      };

      const result = await httpClient.request(options);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test/1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ name: "patched" }),
        }),
      );

      expect(result).toEqual(mockResponse);
    });

    it("should not include body for GET request", async () => {
      const mockResponse = { data: "test" };
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      mockFetch.mockResolvedValue(mockFetchResponse);

      const options: RequestOptions = {
        method: "GET",
        endpoint: "/test",
        data: { shouldNotBeIncluded: true },
      };

      await httpClient.request(options);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.not.objectContaining({
          body: expect.anything(),
        }),
      );
    });

    it("should not include body for DELETE request", async () => {
      const mockResponse = { deleted: true };
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      mockFetch.mockResolvedValue(mockFetchResponse);

      const options: RequestOptions = {
        method: "DELETE",
        endpoint: "/test/1",
        data: { shouldNotBeIncluded: true },
      };

      await httpClient.request(options);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test/1",
        expect.not.objectContaining({
          body: expect.anything(),
        }),
      );
    });

    it("should handle request timeout", async () => {
      // Mock AbortController
      const mockAbortController = {
        signal: {},
        abort: vi.fn(),
      };
      global.AbortController = vi.fn(() => mockAbortController) as any;

      // Mock setTimeout to immediately trigger timeout
      vi.spyOn(global, "setTimeout").mockImplementation((callback: any) => {
        callback();
        return 1 as any;
      });

      mockFetch.mockRejectedValue(new Error(i18n.t("core.request.aborted")));

      const options: RequestOptions = {
        method: "GET",
        endpoint: "/test",
        timeout: 1000,
      };

      await expect(httpClient.request(options)).rejects.toThrow();
    });

    it("should retry on failure with exponential backoff", async () => {
      const mockError = new Error(i18n.t("core.network.error"));
      mockFetch.mockRejectedValue(mockError);

      const options: RequestOptions = {
        method: "GET",
        endpoint: "/test",
      };

      // Mock setTimeout to resolve immediately
      vi.spyOn(global, "setTimeout").mockImplementation((callback: any) => {
        callback();
        return 1 as any;
      });

      await expect(httpClient.request(options)).rejects.toThrow(
        i18n.t("core.network.error"),
      );

      // Should have been called 4 times (initial + 3 retries)
      expect(mockFetch).toHaveBeenCalledTimes(4);
    });

    it("should handle HTTP error responses", async () => {
      const mockFetchResponse = {
        ok: false,
        status: 404,
        text: vi.fn().mockResolvedValue("Not Found"),
      };

      mockFetch.mockResolvedValue(mockFetchResponse);

      const options: RequestOptions = {
        method: "GET",
        endpoint: "/nonexistent",
      };

      await expect(httpClient.request(options)).rejects.toThrow(
        "HTTP 404: Not Found",
      );
    });

    it("should use custom headers", async () => {
      const mockResponse = { data: "test" };
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      mockFetch.mockResolvedValue(mockFetchResponse);

      const options: RequestOptions = {
        method: "GET",
        endpoint: "/test",
        headers: { "X-Custom-Request": "custom-value" },
      };

      await httpClient.request(options);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/test",
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Custom-Request": "custom-value",
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: i18n.t("core.bearer.test-key"),
            "X-Custom": "value",
          }),
        }),
      );
    });

    it("should use custom timeout", async () => {
      const mockResponse = { data: "test" };
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      mockFetch.mockResolvedValue(mockFetchResponse);

      const options: RequestOptions = {
        method: "GET",
        endpoint: "/test",
        timeout: 5000,
      };

      await httpClient.request(options);

      // Verify that setTimeout was called with the custom timeout
      expect(global.setTimeout).toHaveBeenCalledWith(
        expect.any(Function),
        5000,
      );
    });
  });

  describe("upload", () => {
    it("should upload file successfully", async () => {
      const mockResponse = { uploaded: true };
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      mockFetch.mockResolvedValue(mockFetchResponse);

      const formData = new FormData();
      formData.append("file", new Blob(["test content"]));

      const options: UploadOptions = {
        endpoint: "/upload",
        formData,
      };

      const result = await httpClient.upload(options);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/upload",
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            Accept: "application/json",
            Authorization: i18n.t("core.bearer.test-key"),
          }),
          body: formData,
        }),
      );

      expect(result).toEqual(mockResponse);
    });

    it("should upload file without API key", async () => {
      const clientWithoutKey = new HttpClient({
        baseUrl: "https://api.example.com",
      });

      const mockResponse = { uploaded: true };
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      mockFetch.mockResolvedValue(mockFetchResponse);

      const formData = new FormData();
      formData.append("file", new Blob(["test content"]));

      const options: UploadOptions = {
        endpoint: "/upload",
        formData,
      };

      await clientWithoutKey.upload(options);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/upload",
        expect.objectContaining({
          headers: expect.not.objectContaining({
            Authorization: expect.anything(),
          }),
        }),
      );
    });

    it("should handle upload failure", async () => {
      const mockFetchResponse = {
        ok: false,
        status: 413,
        statusText: "Payload Too Large",
      };

      mockFetch.mockResolvedValue(mockFetchResponse);

      const formData = new FormData();
      formData.append("file", new Blob(["test content"]));

      const options: UploadOptions = {
        endpoint: "/upload",
        formData,
      };

      await expect(httpClient.upload(options)).rejects.toThrow(
        "HTTP 413: Payload Too Large",
      );
    });

    it("should use custom headers for upload", async () => {
      const mockResponse = { uploaded: true };
      const mockFetchResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue(mockResponse),
      };

      mockFetch.mockResolvedValue(mockFetchResponse);

      const formData = new FormData();
      formData.append("file", new Blob(["test content"]));

      const options: UploadOptions = {
        endpoint: "/upload",
        formData,
        headers: { "X-Upload-Type": "image" },
      };

      await httpClient.upload(options);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://api.example.com/upload",
        expect.objectContaining({
          headers: expect.objectContaining({
            "X-Upload-Type": "image",
            Accept: "application/json",
            Authorization: i18n.t("core.bearer.test-key"),
          }),
        }),
      );
    });
  });

  describe("configuration management", () => {
    it("should get current configuration", () => {
      const currentConfig = httpClient.getConfig();

      expect(currentConfig).toEqual({
        baseUrl: "https://api.example.com",
        timeout: 30000,
        retries: 3,
        apiKey: "test-key",
        headers: { "X-Custom": "value" },
      });
    });

    it("should return a copy of configuration", () => {
      const config1 = httpClient.getConfig();
      const config2 = httpClient.getConfig();

      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });

    it("should update configuration", () => {
      const updates = {
        timeout: 10000,
        retries: 2,
        apiKey: "new-key",
        headers: { "X-New": "new-value" },
      };

      httpClient.updateConfig(updates);

      expect((httpClient as any).config).toEqual({
        baseUrl: "https://api.example.com",
        timeout: 10000,
        retries: 2,
        apiKey: "new-key",
        headers: { "X-New": "new-value" },
      });
    });

    it("should update base headers when API key changes", () => {
      httpClient.updateConfig({ apiKey: "new-key" });

      expect((httpClient as any).baseHeaders).toEqual(
        expect.objectContaining({
          Authorization: i18n.t("core.bearer.new-key"),
        }),
      );
    });

    it.skip("should remove authorization header when API key is removed", () => {
      // Check initial state
      expect((httpClient as any).baseHeaders).toHaveProperty("Authorization");

      httpClient.updateConfig({ apiKey: undefined });

      expect((httpClient as any).baseHeaders).not.toHaveProperty(
        "Authorization",
      );
    });

    it("should update base headers when headers change", () => {
      httpClient.updateConfig({ headers: { "X-Updated": "updated-value" } });

      expect((httpClient as any).baseHeaders).toEqual(
        expect.objectContaining({
          "X-Custom": "value",
          "X-Updated": "updated-value",
        }),
      );
    });
  });
});
