/**
 * Segmentation Service Tests
 *
 * Comprehensive test suite for the SegmentationService class.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { SegmentationService } from "../services/SegmentationService.js";
import {
  SegmentationTask,
  SegmentationData,
  SegmentationSource,
} from "../types/index.js";
import { PolygonOps } from "reynard-algorithms";

// Mock dependencies
vi.mock("reynard-ai-shared", () => ({
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
  })),
}));

vi.mock("reynard-annotating-core", () => ({
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

describe("SegmentationService", () => {
  let service: SegmentationService;
  let mockConfig: any;

  beforeEach(async () => {
    mockConfig = {
      name: "test-segmentation",
      minArea: 100,
      maxArea: 1000000,
      validateGeometry: true,
      simplifyPolygons: true,
      simplificationTolerance: 2.0,
      timeout: 30000,
      retries: 3,
    };
    service = new SegmentationService(mockConfig);
    await service.initialize();
  });

  describe("Initialization", () => {
    it("should initialize successfully", async () => {
      await expect(service.initialize()).resolves.not.toThrow();
    });

    it("should handle initialization errors gracefully", async () => {
      // Mock initialization failure
      vi.spyOn(service as any, "backendService", "get").mockReturnValue({
        initialize: vi.fn().mockRejectedValue(new Error("Backend error")),
      });

      await expect(service.initialize()).rejects.toThrow(
        "Failed to initialize segmentation service",
      );
    });
  });

  describe("Segmentation Generation", () => {
    it("should generate segmentation successfully", async () => {
      const task: SegmentationTask = {
        type: "segmentation",
        imagePath: "/test/image.jpg",
        options: {
          minArea: 100,
          maxArea: 1000000,
          validateGeometry: true,
        },
      };

      const result = await service.generateSegmentation(task);

      expect(result.success).toBe(true);
      expect(result.type).toBe("segmentation");
      expect(result.segmentation).toBeDefined();
      expect(result.segmentation.id).toBeDefined();
      expect(result.segmentation.polygon).toBeDefined();
      expect(result.processingInfo).toBeDefined();
    });

    it("should validate segmentation task", async () => {
      const invalidTask = {
        type: "invalid",
        imagePath: "",
      } as any;

      await expect(service.generateSegmentation(invalidTask)).rejects.toThrow();
    });

    it("should handle batch segmentation", async () => {
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

      const results = await service.generateBatchSegmentations(tasks);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });
  });

  describe("Segmentation Refinement", () => {
    it("should refine segmentation successfully", async () => {
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
          source: SegmentationSource.MANUAL,
          confidence: 0.8,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await service.refineSegmentation(segmentation);

      expect(result.success).toBe(true);
      expect(result.segmentation.metadata?.source).toBe(
        SegmentationSource.REFINED,
      );
      expect(result.processingInfo?.algorithm).toBe("polygon_optimization");
    });

    it("should handle refinement with options", async () => {
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
          source: SegmentationSource.MANUAL,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const options = {
        simplify: true,
        simplificationTolerance: 1.0,
        validateGeometry: true,
      };

      const result = await service.refineSegmentation(segmentation, options);

      expect(result.success).toBe(true);
      expect(result.processingInfo?.qualityMetrics).toBeDefined();
    });
  });

  describe("Segmentation Validation", () => {
    it("should validate valid segmentation", () => {
      const validSegmentation: SegmentationData = {
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
          source: SegmentationSource.MANUAL,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(service.validateSegmentation(validSegmentation)).toBe(true);
    });

    it("should reject invalid segmentation", () => {
      const invalidSegmentation: SegmentationData = {
        id: "invalid-seg",
        polygon: {
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            // Missing points for valid polygon
          ],
        },
        metadata: {
          source: SegmentationSource.MANUAL,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(service.validateSegmentation(invalidSegmentation)).toBe(false);
    });

    it("should reject segmentation with zero area", () => {
      const zeroAreaSegmentation: SegmentationData = {
        id: "zero-area-seg",
        polygon: {
          points: [
            { x: 0, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: 0 },
          ],
        },
        metadata: {
          source: SegmentationSource.MANUAL,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(service.validateSegmentation(zeroAreaSegmentation)).toBe(false);
    });
  });

  describe("Export/Import", () => {
    it("should export to COCO format", () => {
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
          source: SegmentationSource.MANUAL,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const cocoData = service.exportSegmentation(segmentation, "coco");

      expect(cocoData).toBeDefined();
      expect(cocoData.id).toBe("export-test");
      expect(cocoData.area).toBe(10000);
      expect(cocoData.bbox).toBeDefined();
    });

    it("should export to YOLO format", () => {
      const segmentation: SegmentationData = {
        id: "yolo-test",
        polygon: {
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
          ],
        },
        metadata: {
          source: SegmentationSource.MANUAL,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const yoloData = service.exportSegmentation(segmentation, "yolo");

      expect(yoloData).toBeDefined();
      expect(yoloData.class_id).toBe(0);
      expect(yoloData.x_center).toBe(50);
      expect(yoloData.y_center).toBe(50);
      expect(yoloData.width).toBe(100);
      expect(yoloData.height).toBe(100);
    });

    it("should export to Reynard format", () => {
      const segmentation: SegmentationData = {
        id: "reynard-test",
        polygon: {
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            { x: 100, y: 100 },
            { x: 0, y: 100 },
          ],
        },
        metadata: {
          source: SegmentationSource.MANUAL,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const reynardData = service.exportSegmentation(segmentation, "reynard");

      expect(reynardData).toBeDefined();
      expect(reynardData.id).toBe("reynard-test");
      expect(reynardData.polygon).toEqual(segmentation.polygon);
      expect(reynardData.metadata).toEqual(segmentation.metadata);
    });

    it("should import segmentation data", () => {
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

      const segmentation = service.importSegmentation(importData);

      expect(segmentation.id).toBe("import-test");
      expect(segmentation.polygon).toEqual(importData.polygon);
      expect(segmentation.metadata?.source).toBe(SegmentationSource.IMPORTED);
    });

    it("should handle unsupported export format", () => {
      const segmentation: SegmentationData = {
        id: "test",
        polygon: { points: [] },
        metadata: { source: SegmentationSource.MANUAL },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() =>
        service.exportSegmentation(segmentation, "unsupported"),
      ).toThrow();
    });
  });

  describe("Health and Statistics", () => {
    it("should provide health information", async () => {
      const healthInfo = await service.getHealthInfo();

      expect(healthInfo).toBeDefined();
      expect(healthInfo.status).toBeDefined();
      expect(healthInfo.details).toBeDefined();
    });

    it("should track processing statistics", async () => {
      const task: SegmentationTask = {
        type: "segmentation",
        imagePath: "/test/image.jpg",
      };

      await service.generateSegmentation(task);

      const healthInfo = await service.getHealthInfo();
      expect(healthInfo.details.processingStats).toBeDefined();
      expect(healthInfo.details.processingStats.totalProcessed).toBeGreaterThan(
        0,
      );
    });
  });

  describe("Cleanup", () => {
    it("should cleanup resources", async () => {
      await expect(service.cleanup()).resolves.not.toThrow();
    });
  });
});
