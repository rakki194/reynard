/**
 * Segmentation Manager Tests
 *
 * Comprehensive test suite for the SegmentationManager class.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { SegmentationManager } from "../services/SegmentationManager.js";
import { SegmentationService } from "../services/SegmentationService.js";
import type {
  SegmentationTask,
  SegmentationData,
  SegmentationServiceConfig,
  SegmentationStatistics,
} from "../types/index.js";

// Mock dependencies
vi.mock("reynard-ai-shared", () => ({
  ServiceRegistry: class MockServiceRegistry {
    constructor() {}
    async register() {}
    async unregister() {}
    get() {
      return undefined;
    }
    getAll() {
      return [];
    }
    isRegistered() {
      return false;
    }
  },
  BaseAIService: class MockBaseAIService {
    constructor() {}
    async initialize() {}
    async getHealthInfo() {
      return { status: "healthy", details: {} };
    }
    async cleanup() {}
    setStatus() {}
  },
  ServiceError: class MockServiceError extends Error {
    constructor(message: string, code: string) {
      super(message);
      this.name = "ServiceError";
    }
  },
  ServiceStatus: {
    INITIALIZING: "initializing",
    HEALTHY: "healthy",
    UNHEALTHY: "unhealthy",
    STOPPED: "stopped",
  },
  ServiceHealth: {
    HEALTHY: "healthy",
    UNHEALTHY: "unhealthy",
    DEGRADED: "degraded",
  },
  getServiceRegistry: vi.fn(() => ({
    register: vi.fn(),
    unregister: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(() => []),
    isRegistered: vi.fn(() => false),
    initialize: vi.fn(),
  })),
}));

vi.mock("reynard-annotating-core", () => ({
  AnnotationServiceRegistry: class MockAnnotationServiceRegistry {
    constructor() {}
    async register() {}
    async unregister() {}
    get() {
      return undefined;
    }
    getAll() {
      return [];
    }
    isRegistered() {
      return false;
    }
    async initialize() {}
  },
  BackendAnnotationService: class MockBackendAnnotationService {
    constructor() {}
    async initialize() {}
    async cleanup() {}
    async generateCaption() {
      return {
        success: true,
        type: "caption",
        caption: { type: "caption", content: "Test caption" },
        timestamp: new Date(),
      };
    }
  },
}));

vi.mock("../services/SegmentationService.js", () => ({
  SegmentationService: class MockSegmentationService {
    constructor(config: any) {
      this.config = config;
    }
    config: any;
    async initialize() {}
    async cleanup() {}
    async generateSegmentation() {
      return {
        success: true,
        type: "segmentation",
        segmentation: {
          id: "test-seg",
          polygon: {
            points: [
              { x: 0, y: 0 },
              { x: 100, y: 0 },
              { x: 100, y: 100 },
            ],
          },
          metadata: { source: "manual" },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        timestamp: new Date(),
      };
    }
    async generateBatchSegmentations() {
      return [
        {
          success: true,
          type: "segmentation",
          segmentation: {
            id: "test-seg-1",
            polygon: {
              points: [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
              ],
            },
            metadata: { source: "manual" },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          timestamp: new Date(),
        },
        {
          success: true,
          type: "segmentation",
          segmentation: {
            id: "test-seg-2",
            polygon: {
              points: [
                { x: 0, y: 0 },
                { x: 100, y: 0 },
                { x: 100, y: 100 },
              ],
            },
            metadata: { source: "manual" },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          timestamp: new Date(),
        },
      ];
    }
    async refineSegmentation() {
      return {
        success: true,
        type: "segmentation",
        segmentation: {
          id: "refined-seg",
          polygon: {
            points: [
              { x: 0, y: 0 },
              { x: 100, y: 0 },
              { x: 100, y: 100 },
            ],
          },
          metadata: { source: "refined" },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        timestamp: new Date(),
      };
    }
    validateSegmentation() {
      return true;
    }
    exportSegmentation() {
      return { id: "exported", format: "test" };
    }
    importSegmentation() {
      return {
        id: "imported",
        polygon: {
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
          ],
        },
        metadata: { source: "imported" },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }
    async getHealthInfo() {
      return { status: "healthy", details: {} };
    }
  },
}));

describe("SegmentationManager", () => {
  let manager: SegmentationManager;

  beforeEach(() => {
    manager = new SegmentationManager();
  });

  afterEach(async () => {
    await manager.cleanup();
  });

  describe("Initialization", () => {
    it("should initialize successfully", async () => {
      await expect(manager.initialize()).resolves.not.toThrow();
    });

    it("should handle initialization errors gracefully", async () => {
      // Mock initialization failure
      vi.spyOn(manager as any, "serviceRegistry", "get").mockReturnValue({
        register: vi.fn().mockRejectedValue(new Error("Registry error")),
      });

      await expect(manager.initialize()).rejects.toThrow(
        "Failed to initialize segmentation manager",
      );
    });
  });

  describe("Service Management", () => {
    it("should register segmentation service", async () => {
      await manager.initialize();

      const config: SegmentationServiceConfig = {
        name: "test-service",
        minArea: 100,
        maxArea: 1000000,
        validateGeometry: true,
      };

      const service = await manager.registerSegmentationService(
        "test-service",
        config,
      );

      expect(service).toBeDefined();
      expect(service.config.name).toBe("test-service");
    });

    it("should unregister segmentation service", async () => {
      await manager.initialize();

      const config: SegmentationServiceConfig = {
        name: "test-service",
        minArea: 100,
        maxArea: 1000000,
        validateGeometry: true,
      };

      await manager.registerSegmentationService("test-service", config);
      await expect(
        manager.unregisterSegmentationService("test-service"),
      ).resolves.not.toThrow();
    });

    it("should get available services", async () => {
      await manager.initialize();

      const config: SegmentationServiceConfig = {
        name: "test-service",
        minArea: 100,
        maxArea: 1000000,
        validateGeometry: true,
      };

      await manager.registerSegmentationService("test-service", config);
      const services = await manager.getAvailableServices();

      expect(services).toContain("test-service");
    });

    it("should check if service is available", async () => {
      await manager.initialize();

      const config: SegmentationServiceConfig = {
        name: "test-service",
        minArea: 100,
        maxArea: 1000000,
        validateGeometry: true,
      };

      await manager.registerSegmentationService("test-service", config);

      expect(manager.isServiceAvailable("test-service")).toBe(true);
      expect(manager.isServiceAvailable("non-existent")).toBe(false);
    });

    it("should get service by name", async () => {
      await manager.initialize();

      const config: SegmentationServiceConfig = {
        name: "test-service",
        minArea: 100,
        maxArea: 1000000,
        validateGeometry: true,
      };

      await manager.registerSegmentationService("test-service", config);
      const service = manager.getService("test-service");

      expect(service).toBeDefined();
      expect(service?.config.name).toBe("test-service");
    });
  });

  describe("Segmentation Operations", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it("should generate segmentation", async () => {
      const task: SegmentationTask = {
        type: "segmentation",
        imagePath: "/test/image.jpg",
        options: {
          minArea: 100,
          maxArea: 1000000,
          validateGeometry: true,
        },
      };

      const result = await manager.generateSegmentation(task);

      expect(result.success).toBe(true);
      expect(result.type).toBe("segmentation");
      expect(result.segmentation).toBeDefined();
      expect(result.segmentation.id).toBe("test-seg");
    });

    it("should handle batch segmentation generation", async () => {
      const tasks: SegmentationTask[] = [
        {
          type: "segmentation",
          imagePath: "/test/image1.jpg",
        },
        {
          type: "segmentation",
          imagePath: "/test/image2.jpg",
        },
      ];

      const results = await manager.generateBatchSegmentations(tasks);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
      expect(results[0].segmentation.id).toBe("test-seg-1");
      expect(results[1].segmentation.id).toBe("test-seg-2");
    });

    it("should handle batch segmentation with progress callback", async () => {
      const tasks: SegmentationTask[] = [
        {
          type: "segmentation",
          imagePath: "/test/image1.jpg",
        },
        {
          type: "segmentation",
          imagePath: "/test/image2.jpg",
        },
      ];

      const progressCallback = vi.fn();
      const results = await manager.generateBatchSegmentations(
        tasks,
        progressCallback,
      );

      expect(results).toHaveLength(2);
      expect(progressCallback).toHaveBeenCalled();
    });

    it("should refine segmentation", async () => {
      const segmentation: SegmentationData = {
        id: "test-seg",
        polygon: {
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
          ],
        },
        metadata: {
          source: "manual",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await manager.refineSegmentation(segmentation);

      expect(result.success).toBe(true);
      expect(result.segmentation.id).toBe("refined-seg");
    });

    it("should refine segmentation with options", async () => {
      const segmentation: SegmentationData = {
        id: "test-seg",
        polygon: {
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
          ],
        },
        metadata: {
          source: "manual",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const options = {
        simplify: true,
        simplificationTolerance: 1.0,
        validateGeometry: true,
      };

      const result = await manager.refineSegmentation(segmentation, options);

      expect(result.success).toBe(true);
      expect(result.segmentation.metadata?.source).toBe("refined");
    });
  });

  describe("Validation and Utilities", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it("should validate segmentation", () => {
      const segmentation: SegmentationData = {
        id: "valid-seg",
        polygon: {
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
          ],
        },
        metadata: {
          source: "manual",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(manager.validateSegmentation(segmentation)).toBe(true);
    });

    it("should export segmentation", () => {
      const segmentation: SegmentationData = {
        id: "export-test",
        polygon: {
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
          ],
        },
        metadata: {
          source: "manual",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const exportData = manager.exportSegmentation(segmentation, "coco");

      expect(exportData).toBeDefined();
      expect(exportData.id).toBe("exported");
      expect(exportData.format).toBe("test");
    });

    it("should import segmentation", () => {
      const importData = {
        id: "import-test",
        polygon: {
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
          ],
        },
        metadata: {
          source: "manual",
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const segmentation = manager.importSegmentation(importData);

      expect(segmentation.id).toBe("imported");
      expect(segmentation.polygon).toBeDefined();
    });
  });

  describe("Statistics", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it("should get statistics", async () => {
      const stats = await manager.getStatistics();

      expect(stats).toBeDefined();
      expect(stats.totalSegmentations).toBeDefined();
      expect(stats.averageProcessingTime).toBeDefined();
      expect(stats.qualityMetrics).toBeDefined();
    });

    it("should track processing statistics", async () => {
      const task: SegmentationTask = {
        type: "segmentation",
        imagePath: "/test/image.jpg",
      };

      await manager.generateSegmentation(task);

      const stats = await manager.getStatistics();
      expect(stats.totalSegmentations).toBeGreaterThan(0);
    });
  });

  describe("Error Handling", () => {
    beforeEach(async () => {
      await manager.initialize();
    });

    it("should handle service not found error", async () => {
      const task: SegmentationTask = {
        type: "segmentation",
        imagePath: "/test/image.jpg",
      };

      // Mock no available services
      vi.spyOn(manager, "getAvailableServices").mockResolvedValue([]);

      await expect(manager.generateSegmentation(task)).rejects.toThrow(
        "No segmentation services available",
      );
    });

    it("should handle service generation error", async () => {
      const task: SegmentationTask = {
        type: "segmentation",
        imagePath: "/test/image.jpg",
      };

      // Mock service generation failure
      const mockService = {
        generateSegmentation: vi
          .fn()
          .mockRejectedValue(new Error("Service error")),
      };
      vi.spyOn(manager, "getService").mockReturnValue(mockService as any);

      await expect(manager.generateSegmentation(task)).rejects.toThrow(
        "Failed to generate segmentation",
      );
    });

    it("should handle batch processing errors", async () => {
      const tasks: SegmentationTask[] = [
        {
          type: "segmentation",
          imagePath: "/test/image1.jpg",
        },
        {
          type: "segmentation",
          imagePath: "/test/image2.jpg",
        },
      ];

      // Mock service generation failure
      const mockService = {
        generateBatchSegmentations: vi
          .fn()
          .mockRejectedValue(new Error("Batch error")),
      };
      vi.spyOn(manager, "getService").mockReturnValue(mockService as any);

      await expect(manager.generateBatchSegmentations(tasks)).rejects.toThrow(
        "Failed to generate batch segmentations",
      );
    });
  });

  describe("Cleanup", () => {
    it("should cleanup resources", async () => {
      await manager.initialize();
      await expect(manager.cleanup()).resolves.not.toThrow();
    });

    it("should handle cleanup errors gracefully", async () => {
      await manager.initialize();

      // Mock cleanup failure
      vi.spyOn(manager as any, "serviceRegistry", "get").mockReturnValue({
        unregister: vi.fn().mockRejectedValue(new Error("Cleanup error")),
      });

      await expect(manager.cleanup()).resolves.not.toThrow();
    });
  });
});
