import { describe, it, expect, vi, beforeEach } from "vitest";
import { createReynardApiClient } from "../client";
import { HTTPClient } from "reynard-http-client";

// Mock the HTTPClient
vi.mock("reynard-http-client", () => ({
  HTTPClient: vi.fn().mockImplementation(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    request: vi.fn(),
  })),
}));

describe("Reynard API Client", () => {
  let mockHttpClient: any;

  beforeEach(() => {
    mockHttpClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      request: vi.fn(),
    };
    (HTTPClient as any).mockImplementation(() => mockHttpClient);
  });

  describe("createReynardApiClient", () => {
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

    it("should have all required API modules", () => {
      const client = createReynardApiClient();

      // Test API module (healthApi)
      expect(client.api).toBeDefined();

      // Test RAG module
      expect(client.rag).toBeDefined();
      expect(typeof client.rag.query).toBe("function");
      expect(typeof client.rag.ingest).toBe("function");
      expect(typeof client.rag.stats).toBe("function");
      expect(typeof client.rag.documents).toBe("function");

      // Test Caption module
      expect(client.caption).toBeDefined();
      expect(typeof client.caption.generate).toBe("function");
      expect(typeof client.caption.batchGenerate).toBe("function");
      expect(typeof client.caption.generators).toBe("function");
      expect(typeof client.caption.upload).toBe("function");

      // Test Chat module
      expect(client.chat).toBeDefined();
      expect(typeof client.chat.send).toBe("function");
      expect(typeof client.chat.stream).toBe("function");
      expect(typeof client.chat.assistant).toBe("function");
      expect(typeof client.chat.assistantStream).toBe("function");

      // Test Auth module
      expect(client.auth).toBeDefined();
      expect(typeof client.auth.login).toBe("function");
      expect(typeof client.auth.register).toBe("function");
      expect(typeof client.auth.logout).toBe("function");
      expect(typeof client.auth.refresh).toBe("function");
      expect(typeof client.auth.me).toBe("function");

      // Test Email module
      expect(client.email).toBeDefined();
      expect(typeof client.email.send).toBe("function");
      expect(typeof client.email.sendBulk).toBe("function");
      expect(typeof client.email.getStatus).toBe("function");

      // Test AgentEmail module
      expect(client.agentEmail).toBeDefined();
      expect(typeof client.agentEmail.send).toBe("function");
      expect(typeof client.agentEmail.sendBulk).toBe("function");
      expect(typeof client.agentEmail.getConfig).toBe("function");

      // Test IMAP module
      expect(client.imap).toBeDefined();
      expect(typeof client.imap.testConnection).toBe("function");
      expect(typeof client.imap.getStatus).toBe("function");
      expect(typeof client.imap.getEmailsSummary).toBe("function");

      // Test Health module
      expect(typeof client.health).toBe("function");
    });
  });

  describe("Client configuration", () => {
    let client: any;

    beforeEach(() => {
      client = createReynardApiClient();
    });

    it("should have correct default configuration", () => {
      expect(client.config).toBeDefined();
      expect(client.config.basePath).toBe("http://localhost:8000");
      expect(client.httpClient).toBeDefined();
    });

    it("should accept custom HTTP client", () => {
      const customHttpClient = new HTTPClient();
      const client = createReynardApiClient({ httpClient: customHttpClient });
      
      expect(client.httpClient).toBe(customHttpClient);
    });

    it("should accept custom base path", () => {
      const client = createReynardApiClient({ basePath: "https://api.example.com" });
      
      expect(client.config.basePath).toBe("https://api.example.com");
    });

    it("should accept custom timeout", () => {
      const client = createReynardApiClient({ timeout: 5000 });
      
      expect(client.httpClient).toBeDefined();
    });
  });

  describe("Module structure validation", () => {
    let client: any;

    beforeEach(() => {
      client = createReynardApiClient();
    });

    it("should have all required modules", () => {
      expect(client.rag).toBeDefined();
      expect(client.caption).toBeDefined();
      expect(client.chat).toBeDefined();
      expect(client.auth).toBeDefined();
      expect(client.email).toBeDefined();
      expect(client.agentEmail).toBeDefined();
      expect(client.imap).toBeDefined();
      expect(client.health).toBeDefined();
    });

    it("should have proper method bindings", () => {
      // Test that methods are properly bound (they should be functions)
      expect(typeof client.rag.query).toBe("function");
      expect(typeof client.caption.generate).toBe("function");
      expect(typeof client.chat.send).toBe("function");
      expect(typeof client.auth.login).toBe("function");
      expect(typeof client.email.send).toBe("function");
      expect(typeof client.agentEmail.send).toBe("function");
      expect(typeof client.imap.testConnection).toBe("function");
      expect(typeof client.health).toBe("function");
    });

    it("should have HTTP client integration", () => {
      expect(client.httpClient).toBeDefined();
      expect(typeof client.httpClient.request).toBe("function");
    });
  });
});