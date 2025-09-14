/**
 * Integration Tests
 *
 * Comprehensive integration tests for the segmentation system.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { SegmentationManager, initializeSegmentationManager } from "../services/SegmentationManager.js";
import { SegmentationService } from "../services/SegmentationService.js";
import { useSegmentationEditor } from "../composables/useSegmentationEditor.js";
import { usePolygonEditor } from "../composables/usePolygonEditor.js";
import type { 
  SegmentationData, 
  SegmentationTask, 
  SegmentationServiceConfig,
  SegmentationEditorConfig 
} from "../types/index.js";

// Mock dependencies
vi.mock("reynard-ai-shared", () => ({
  ServiceRegistry: class MockServiceRegistry {
    constructor() {}
    async register() {}
    async unregister() {}
    get() { return undefined; }
    getAll() { return []; }
    isRegistered() { return false; }
  },
  BaseAIService: class MockBaseAIService {
    constructor() {}
    async initialize() {}
    async getHealthInfo() { return { status: "healthy", details: {} }; }
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
  AnnotationServiceRegistry: class MockAnnotationServiceRegistry {
    constructor() {}
    async register() {}
    async unregister() {}
    get() { return undefined; }
    getAll() { return []; }
    isRegistered() { return false; }
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

describe("Segmentation System Integration", () => {
  let manager: SegmentationManager;
  let service: SegmentationService;

  beforeEach(async () => {
    manager = new SegmentationManager();
    await manager.initialize();

    service = new SegmentationService({
      name: "integration-test",
      minArea: 100,
      maxArea: 1000000,
      validateGeometry: true,
    });
    await service.initialize();
  });

  afterEach(async () => {
    await service.cleanup();
    await manager.cleanup();
  });

  describe("Service and Manager Integration", () => {
    it("should register service with manager", async () => {
      const config: SegmentationServiceConfig = {
        name: "test-service",
        minArea: 100,
        maxArea: 1000000,
        validateGeometry: true,
      };

      const registeredService = await manager.registerSegmentationService("test-service", config);

      expect(registeredService).toBeDefined();
      expect(manager.isServiceAvailable("test-service")).toBe(true);
    });

    it("should generate segmentation through manager", async () => {
      const config: SegmentationServiceConfig = {
        name: "test-service",
        minArea: 100,
        maxArea: 1000000,
        validateGeometry: true,
      };

      await manager.registerSegmentationService("test-service", config);

      const task: SegmentationTask = {
        type: "segmentation",
        imagePath: "/test/image.jpg",
        options: {
          minArea: 100,
          validateGeometry: true,
        },
      };

      const result = await manager.generateSegmentation(task);

      expect(result.success).toBe(true);
      expect(result.type).toBe("segmentation");
      expect(result.segmentation).toBeDefined();
    });

    it("should handle batch processing through manager", async () => {
      const config: SegmentationServiceConfig = {
        name: "test-service",
        minArea: 100,
        maxArea: 1000000,
        validateGeometry: true,
      };

      await manager.registerSegmentationService("test-service", config);

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
    });

    it("should refine segmentation through manager", async () => {
      const config: SegmentationServiceConfig = {
        name: "test-service",
        minArea: 100,
        maxArea: 1000000,
        validateGeometry: true,
      };

      await manager.registerSegmentationService("test-service", config);

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
      expect(result.segmentation.metadata?.source).toBe("refined");
    });
  });

  describe("Editor and Service Integration", () => {
    it("should integrate editor with service", () => {
      const editorConfig: SegmentationEditorConfig = {
        enabled: true,
        showGrid: true,
        gridSize: 20,
        snapToGrid: true,
        showVertices: true,
        vertexSize: 8,
        showEdges: true,
        edgeThickness: 2,
        showFill: true,
        fillOpacity: 0.3,
        showBoundingBox: false,
        allowVertexEdit: true,
        allowEdgeEdit: true,
        allowPolygonCreation: true,
        allowPolygonDeletion: true,
        maxPolygons: 50,
        minPolygonArea: 100,
        maxPolygonArea: 1000000,
      };

      const editor = useSegmentationEditor({
        config: editorConfig,
        state: {
          selectedSegmentation: undefined,
          isCreating: false,
          isEditing: false,
          zoom: 1,
          panOffset: { x: 0, y: 0 },
        },
        onSegmentationCreate: (segmentation) => {
          // Validate segmentation using service
          const isValid = service.validateSegmentation(segmentation);
          expect(isValid).toBe(true);
        },
        onSegmentationUpdate: (segmentation) => {
          // Validate updated segmentation
          const isValid = service.validateSegmentation(segmentation);
          expect(isValid).toBe(true);
        },
      });

      expect(editor).toBeDefined();
      expect(editor.state()).toBeDefined();
    });

    it("should handle polygon editing with validation", () => {
      const polygonEditor = usePolygonEditor({
        config: {
          enabled: true,
          minPolygonArea: 100,
          maxPolygonArea: 1000000,
        },
        onPolygonChange: (polygon) => {
          // Validate polygon using service
          const testSegmentation: SegmentationData = {
            id: "test",
            polygon,
            metadata: { source: "manual" },
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          const isValid = service.validateSegmentation(testSegmentation);
          expect(isValid).toBe(true);
        },
      });

      const polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      };

      // Test polygon operations
      const scaledPolygon = polygonEditor.scalePolygon(polygon, 2.0);
      expect(scaledPolygon.points[1].x).toBe(200);

      const rotatedPolygon = polygonEditor.rotatePolygon(polygon, Math.PI / 2);
      expect(rotatedPolygon).toBeDefined();

      const translatedPolygon = polygonEditor.translatePolygon(polygon, { x: 50, y: 50 });
      expect(translatedPolygon.points[0]).toEqual({ x: 50, y: 50 });
    });
  });

  describe("Export/Import Integration", () => {
    it("should export and import segmentation data", () => {
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

      // Export to different formats
      const cocoData = service.exportSegmentation(segmentation, "coco");
      const yoloData = service.exportSegmentation(segmentation, "yolo");
      const reynardData = service.exportSegmentation(segmentation, "reynard");

      expect(cocoData).toBeDefined();
      expect(yoloData).toBeDefined();
      expect(reynardData).toBeDefined();

      // Import back
      const importedSegmentation = service.importSegmentation(reynardData);
      expect(importedSegmentation.id).toBe("import-test");
      expect(importedSegmentation.polygon).toEqual(segmentation.polygon);
    });

    it("should handle export/import through manager", () => {
      const segmentation: SegmentationData = {
        id: "manager-export-test",
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

      // Export through manager
      const exportData = manager.exportSegmentation(segmentation, "coco");
      expect(exportData).toBeDefined();

      // Import through manager
      const importedSegmentation = manager.importSegmentation(exportData);
      expect(importedSegmentation.id).toBe("manager-export-test");
    });
  });

  describe("Performance Integration", () => {
    it("should handle multiple operations efficiently", async () => {
      const config: SegmentationServiceConfig = {
        name: "perf-test",
        minArea: 100,
        maxArea: 1000000,
        validateGeometry: true,
      };

      await manager.registerSegmentationService("perf-test", config);

      const startTime = performance.now();

      // Perform multiple operations
      const tasks: SegmentationTask[] = Array.from({ length: 10 }, (_, i) => ({
        type: "segmentation",
        imagePath: `/test/image${i}.jpg`,
      }));

      const results = await manager.generateBatchSegmentations(tasks);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(results).toHaveLength(10);
      expect(executionTime).toBeLessThan(1000); // Should complete in less than 1 second
    });

    it("should handle concurrent operations", async () => {
      const config: SegmentationServiceConfig = {
        name: "concurrent-test",
        minArea: 100,
        maxArea: 1000000,
        validateGeometry: true,
      };

      await manager.registerSegmentationService("concurrent-test", config);

      const startTime = performance.now();

      // Run operations concurrently
      const promises = Array.from({ length: 5 }, (_, i) => 
        manager.generateSegmentation({
          type: "segmentation",
          imagePath: `/test/image${i}.jpg`,
        })
      );

      const results = await Promise.all(promises);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(results).toHaveLength(5);
      expect(results.every(r => r.success)).toBe(true);
      expect(executionTime).toBeLessThan(500); // Should complete in less than 500ms
    });
  });

  describe("Error Handling Integration", () => {
    it("should handle service errors gracefully", async () => {
      const config: SegmentationServiceConfig = {
        name: "error-test",
        minArea: 100,
        maxArea: 1000000,
        validateGeometry: true,
      };

      await manager.registerSegmentationService("error-test", config);

      // Test with invalid task
      const invalidTask = {
        type: "invalid",
        imagePath: "",
      } as any;

      await expect(manager.generateSegmentation(invalidTask)).rejects.toThrow();
    });

    it("should handle validation errors", () => {
      const invalidSegmentation: SegmentationData = {
        id: "invalid-seg",
        polygon: {
          points: [
            { x: 0, y: 0 },
            { x: 100, y: 0 },
            // Missing third point
          ],
        },
        metadata: {
          source: "manual",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(service.validateSegmentation(invalidSegmentation)).toBe(false);
      expect(manager.validateSegmentation(invalidSegmentation)).toBe(false);
    });

    it("should handle export format errors", () => {
      const segmentation: SegmentationData = {
        id: "test",
        polygon: { points: [{ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 100, y: 100 }] },
        metadata: { source: "manual" },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => service.exportSegmentation(segmentation, "unsupported")).toThrow();
      expect(() => manager.exportSegmentation(segmentation, "unsupported")).toThrow();
    });
  });

  describe("Statistics Integration", () => {
    it("should track statistics across operations", async () => {
      const config: SegmentationServiceConfig = {
        name: "stats-test",
        minArea: 100,
        maxArea: 1000000,
        validateGeometry: true,
      };

      await manager.registerSegmentationService("stats-test", config);

      // Perform operations
      const task: SegmentationTask = {
        type: "segmentation",
        imagePath: "/test/image.jpg",
      };

      await manager.generateSegmentation(task);

      // Check statistics
      const stats = await manager.getStatistics();
      expect(stats.totalSegmentations).toBeGreaterThan(0);
      expect(stats.averageProcessingTime).toBeGreaterThan(0);
    });
  });

  describe("Global Manager Integration", () => {
    it("should work with global manager", async () => {
      const globalManager = await initializeSegmentationManager();

      expect(globalManager).toBeDefined();
      expect(globalManager).toBeInstanceOf(SegmentationManager);

      await globalManager.cleanup();
    });
  });
});
