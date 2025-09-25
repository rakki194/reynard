/**
 * API Client Simple Tests
 * Basic tests for the API client functionality
 */

import { describe, it, expect, vi } from "vitest";
import { createReynardApiClient } from "../client";

// Mock the HTTPClient
vi.mock("reynard-http-client", () => ({
  HTTPClient: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  })),
}));

describe("API Client", () => {
  it("should create API client with default configuration", () => {
    const client = createReynardApiClient();

    expect(client).toBeDefined();
    expect(client.httpClient).toBeDefined();
    expect(client.config).toBeDefined();
    expect(client.api).toBeDefined();
    expect(client.rag).toBeDefined();
    expect(client.caption).toBeDefined();
    expect(client.chat).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.email).toBeDefined();
    expect(client.health).toBeDefined();
  });

  it("should create API client with custom configuration", () => {
    const customConfig = {
      basePath: "https://custom-api.com",
      timeout: 5000,
    };

    const client = createReynardApiClient(customConfig);

    expect(client).toBeDefined();
    expect(client.httpClient).toBeDefined();
    expect(client.config).toBeDefined();
    expect(client.config.basePath).toBe("https://custom-api.com");
  });
});
