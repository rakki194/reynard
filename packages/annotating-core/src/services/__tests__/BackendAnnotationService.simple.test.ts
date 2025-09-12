/**
 * BackendAnnotationService Simple Tests
 *
 * Basic test suite for the backend annotation service without complex mocking.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock all dependencies with simple implementations
vi.mock("../../clients", () => ({
  createCaptionApiClient: vi.fn(() => ({
    generateCaption: vi.fn(),
    generateBatchCaptions: vi.fn(),
    getAvailableGenerators: vi.fn(),
    getHealthStatus: vi.fn(),
  })),
}));

vi.mock("../EventManager", () => ({
  SimpleEventManager: vi.fn(() => ({
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  })),
}));

vi.mock("../BatchProcessor", () => ({
  BatchProcessor: vi.fn(() => ({
    processBatch: vi.fn(),
  })),
}));

vi.mock("../SingleCaptionProcessor", () => ({
  SingleCaptionProcessor: vi.fn(() => ({
    processSingle: vi.fn(),
  })),
}));

vi.mock("../GeneratorManager", () => ({
  GeneratorManager: vi.fn(() => ({
    initializeGenerators: vi.fn(),
    getAvailableGenerators: vi.fn(),
  })),
}));

vi.mock("../HealthStatsManager", () => ({
  HealthStatsManager: vi.fn(() => ({
    getStats: vi.fn(),
  })),
}));

describe("BackendAnnotationService Simple Tests", () => {
  let BackendAnnotationService: any;
  let config: any;

  beforeEach(async () => {
    // Import the service after mocks are set up
    const module = await import("../BackendAnnotationService");
    BackendAnnotationService = module.BackendAnnotationService;

    config = {
      baseUrl: "http://localhost:8000",
      timeout: 30000,
      retries: 3,
      apiKey: "test-api-key",
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Service Initialization", () => {
    it("should initialize with valid config", () => {
      const service = new BackendAnnotationService(config);
      expect(service).toBeDefined();
      expect(service).toBeInstanceOf(BackendAnnotationService);
    });

    it("should initialize with minimal config", () => {
      const minimalConfig = { baseUrl: "http://localhost:8000" };
      const service = new BackendAnnotationService(minimalConfig);

      expect(service).toBeDefined();
    });

    it("should handle invalid configuration", () => {
      const invalidConfig = { baseUrl: "" };

      expect(() => {
        new BackendAnnotationService(invalidConfig);
      }).not.toThrow();
    });
  });

  describe("Basic Functionality", () => {
    it("should have required methods", () => {
      const service = new BackendAnnotationService(config);

      expect(typeof service.generateCaption).toBe("function");
      expect(typeof service.generateBatchCaptions).toBe("function");
      expect(typeof service.getAvailableGenerators).toBe("function");
      expect(typeof service.getHealthStatus).toBe("function");
    });
  });
});
