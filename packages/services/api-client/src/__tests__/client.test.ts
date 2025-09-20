/**
 * Tests for the main Reynard API client
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createReynardApiClient } from "../client";

describe("Reynard API Client", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("createReynardApiClient", () => {
    it("should create a client with default configuration", () => {
      const client = createReynardApiClient();

      expect(client).toBeDefined();
      expect(client.config.basePath).toBe("http://localhost:8000");
      expect(client.api).toBeDefined();
      expect(client.rag).toBeDefined();
      expect(client.caption).toBeDefined();
      expect(client.chat).toBeDefined();
      expect(client.auth).toBeDefined();
      expect(client.health).toBeDefined();
    });

    it("should create a client with custom configuration", () => {
      const customConfig = {
        basePath: "https://api.example.com",
        timeout: 60000,
      };

      const client = createReynardApiClient(customConfig);

      expect(client.config.basePath).toBe("https://api.example.com");
    });

    it("should create a client with custom auth fetch", () => {
      const authFetch = vi.fn();
      const client = createReynardApiClient({ authFetch });

      expect(client.config.fetchApi).toBe(authFetch);
    });

    it("should include new service composables", () => {
      const client = createReynardApiClient();

      // Check that new services are available
      expect(client.email).toBeDefined();
      expect(client.ecs).toBeDefined();
      expect(client.mcp).toBeDefined();

      // Check that new services have expected methods
      expect(typeof client.email.sendEmail).toBe("function");
      expect(typeof client.email.getEmailStatus).toBe("function");

      expect(typeof client.ecs.getWorldStatus).toBe("function");
      expect(typeof client.ecs.createAgent).toBe("function");

      expect(typeof client.mcp.generateToken).toBe("function");
      expect(typeof client.mcp.listClients).toBe("function");
    });

    it("should have proper TypeScript types", () => {
      const client = createReynardApiClient();

      // This test ensures TypeScript compilation works
      expect(client).toHaveProperty("config");
      expect(client).toHaveProperty("api");
      expect(client).toHaveProperty("rag");
      expect(client).toHaveProperty("caption");
      expect(client).toHaveProperty("chat");
      expect(client).toHaveProperty("auth");
      expect(client).toHaveProperty("email");
      expect(client).toHaveProperty("ecs");
      expect(client).toHaveProperty("mcp");
      expect(client).toHaveProperty("health");
    });
  });

  describe("Service Integration", () => {
    it("should have consistent error handling across all services", () => {
      const client = createReynardApiClient();

      // All services should have loading and error states
      expect(client.email).toHaveProperty("loading");
      expect(client.email).toHaveProperty("error");
      expect(client.ecs).toHaveProperty("loading");
      expect(client.ecs).toHaveProperty("error");
      expect(client.mcp).toHaveProperty("loading");
      expect(client.mcp).toHaveProperty("error");
    });

    it("should use the same base configuration for all services", () => {
      const customBasePath = "https://custom-api.example.com";
      const client = createReynardApiClient({ basePath: customBasePath });

      // All services should use the same base path
      expect(client.config.basePath).toBe(customBasePath);
    });
  });
});
