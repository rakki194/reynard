import { describe, it, expect } from "vitest";
import type {
  ReynardApiConfig,
  ApiModule,
  RAGModule,
  CaptionModule,
  ChatModule,
  AuthModule,
  EmailModule,
  HealthModule,
  ReynardApiClient,
} from "../types";

describe("API Client Types", () => {
  describe("ReynardApiConfig", () => {
    it("should have correct default values", () => {
      const config: ReynardApiConfig = {
        basePath: "/api",
        timeout: 30000,
      };

      expect(config.basePath).toBe("/api");
      expect(config.timeout).toBe(30000);
    });

    it("should accept custom configuration", () => {
      const config: ReynardApiConfig = {
        basePath: "https://custom-api.com",
        timeout: 5000,
        retries: 3,
        enableRetry: true,
        enableCircuitBreaker: true,
        enableMetrics: true,
      };

      expect(config.basePath).toBe("https://custom-api.com");
      expect(config.timeout).toBe(5000);
      expect(config.retries).toBe(3);
      expect(config.enableRetry).toBe(true);
      expect(config.enableCircuitBreaker).toBe(true);
      expect(config.enableMetrics).toBe(true);
    });
  });

  describe("ApiModule", () => {
    it("should have all required methods", () => {
      const apiModule: ApiModule = {
        get: async () => ({ data: {}, status: 200 }),
        post: async () => ({ data: {}, status: 200 }),
        put: async () => ({ data: {}, status: 200 }),
        delete: async () => ({ data: {}, status: 200 }),
      };

      expect(typeof apiModule.get).toBe("function");
      expect(typeof apiModule.post).toBe("function");
      expect(typeof apiModule.put).toBe("function");
      expect(typeof apiModule.delete).toBe("function");
    });
  });

  describe("RAGModule", () => {
    it("should have all required methods", () => {
      const ragModule: RAGModule = {
        search: async () => ({ data: {}, status: 200 }),
        index: async () => ({ data: {}, status: 200 }),
        delete: async () => ({ data: {}, status: 200 }),
      };

      expect(typeof ragModule.search).toBe("function");
      expect(typeof ragModule.index).toBe("function");
      expect(typeof ragModule.delete).toBe("function");
    });
  });

  describe("CaptionModule", () => {
    it("should have all required methods", () => {
      const captionModule: CaptionModule = {
        generate: async () => ({ data: {}, status: 200 }),
        batch: async () => ({ data: {}, status: 200 }),
      };

      expect(typeof captionModule.generate).toBe("function");
      expect(typeof captionModule.batch).toBe("function");
    });
  });

  describe("ChatModule", () => {
    it("should have all required methods", () => {
      const chatModule: ChatModule = {
        send: async () => ({ data: {}, status: 200 }),
        history: async () => ({ data: {}, status: 200 }),
      };

      expect(typeof chatModule.send).toBe("function");
      expect(typeof chatModule.history).toBe("function");
    });
  });

  describe("AuthModule", () => {
    it("should have all required methods", () => {
      const authModule: AuthModule = {
        login: async () => ({ data: {}, status: 200 }),
        register: async () => ({ data: {}, status: 200 }),
        logout: async () => ({ data: {}, status: 200 }),
        refresh: async () => ({ data: {}, status: 200 }),
        profile: async () => ({ data: {}, status: 200 }),
      };

      expect(typeof authModule.login).toBe("function");
      expect(typeof authModule.register).toBe("function");
      expect(typeof authModule.logout).toBe("function");
      expect(typeof authModule.refresh).toBe("function");
      expect(typeof authModule.profile).toBe("function");
    });
  });

  describe("EmailModule", () => {
    it("should have all required methods", () => {
      const emailModule: EmailModule = {
        send: async () => ({ data: {}, status: 200 }),
        templates: async () => ({ data: {}, status: 200 }),
      };

      expect(typeof emailModule.send).toBe("function");
      expect(typeof emailModule.templates).toBe("function");
    });
  });

  describe("HealthModule", () => {
    it("should have all required methods", () => {
      const healthModule: HealthModule = {
        check: async () => ({ data: {}, status: 200 }),
        status: async () => ({ data: {}, status: 200 }),
      };

      expect(typeof healthModule.check).toBe("function");
      expect(typeof healthModule.status).toBe("function");
    });
  });

  describe("ReynardApiClient", () => {
    it("should have all required properties", () => {
      const client: ReynardApiClient = {
        httpClient: {} as any,
        config: {} as ReynardApiConfig,
        api: {} as ApiModule,
        rag: {} as RAGModule,
        caption: {} as CaptionModule,
        chat: {} as ChatModule,
        auth: {} as AuthModule,
        email: {} as EmailModule,
        health: {} as HealthModule,
      };

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
  });
});
