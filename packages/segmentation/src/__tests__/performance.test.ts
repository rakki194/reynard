/**
 * Performance Benchmarks
 *
 * Comprehensive performance testing suite for the segmentation system.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { SegmentationService } from "../services/SegmentationService.js";
import { SegmentationManager } from "../services/SegmentationManager.js";
import { usePolygonEditor } from "../composables/usePolygonEditor.js";
import { PolygonOps, type Polygon } from "reynard-algorithms";
import type {
  SegmentationData,
  SegmentationTask,
  SegmentationSource,
} from "../types/index.js";

// Mock dependencies for performance testing
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

describe("Performance Benchmarks", () => {
  let service: SegmentationService;
  let manager: SegmentationManager;
  let polygonEditor: ReturnType<typeof usePolygonEditor>;

  beforeEach(() => {
    service = new SegmentationService({
      name: "perf-test",
      minArea: 100,
      maxArea: 1000000,
      validateGeometry: true,
    });

    manager = new SegmentationManager();
    polygonEditor = usePolygonEditor({
      config: {
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
      },
      onPolygonChange: vi.fn(),
    });
  });

  describe("Segmentation Service Performance", () => {
    it("should generate segmentation within 16ms", async () => {
      const task: SegmentationTask = {
        type: "segmentation",
        imagePath: "/test/image.jpg",
      };

      const startTime = performance.now();
      await service.generateSegmentation(task);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(16); // Target: <16ms
    });

    it("should handle batch processing efficiently", async () => {
      const tasks: SegmentationTask[] = Array.from({ length: 10 }, (_, i) => ({
        type: "segmentation",
        imagePath: `/test/image${i}.jpg`,
      }));

      const startTime = performance.now();
      const results = await service.generateBatchSegmentations(tasks);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      const averageTime = executionTime / tasks.length;

      expect(results).toHaveLength(10);
      expect(averageTime).toBeLessThan(16); // Target: <16ms per segmentation
    });

    it("should validate segmentation quickly", () => {
      const segmentation: SegmentationData = {
        id: "perf-test",
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

      const startTime = performance.now();
      const isValid = service.validateSegmentation(segmentation);
      const endTime = performance.now();

      const executionTime = endTime - startTime;
      expect(isValid).toBe(true);
      expect(executionTime).toBeLessThan(1); // Target: <1ms for validation
    });

    it("should export data efficiently", () => {
      const segmentation: SegmentationData = {
        id: "export-perf-test",
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

      const formats = ["coco", "yolo", "pascal_voc", "reynard"];

      formats.forEach((format) => {
        const startTime = performance.now();
        const exportData = service.exportSegmentation(segmentation, format);
        const endTime = performance.now();

        const executionTime = endTime - startTime;
        expect(exportData).toBeDefined();
        expect(executionTime).toBeLessThan(5); // Target: <5ms for export
      });
    });
  });

  describe("Polygon Editor Performance", () => {
    it("should perform vertex operations quickly", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      };

      const startTime = performance.now();

      // Perform multiple vertex operations
      for (let i = 0; i < 100; i++) {
        polygonEditor.addVertex(polygon, { x: i, y: i });
        polygonEditor.removeVertex(polygon, 0);
        polygonEditor.moveVertex(polygon, 0, { x: i * 2, y: i * 2 });
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;
      const averageTime = executionTime / 300; // 100 operations × 3 types

      expect(averageTime).toBeLessThan(0.1); // Target: <0.1ms per operation
    });

    it("should perform geometric transformations efficiently", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      };

      const startTime = performance.now();

      // Perform multiple transformations
      for (let i = 0; i < 50; i++) {
        polygonEditor.scalePolygon(polygon, 1.1);
        polygonEditor.rotatePolygon(polygon, 0.1);
        polygonEditor.translatePolygon(polygon, { x: 1, y: 1 });
        polygonEditor.simplifyPolygon(polygon, 1.0);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;
      const averageTime = executionTime / 200; // 50 iterations × 4 operations

      expect(averageTime).toBeLessThan(0.5); // Target: <0.5ms per transformation
    });

    it("should validate polygons quickly", () => {
      const polygons: Polygon[] = Array.from({ length: 100 }, (_, i) => ({
        points: [
          { x: i, y: i },
          { x: i + 100, y: i },
          { x: i + 100, y: i + 100 },
          { x: i, y: i + 100 },
        ],
      }));

      const startTime = performance.now();

      polygons.forEach((polygon) => {
        polygonEditor.validatePolygon(polygon);
      });

      const endTime = performance.now();
      const executionTime = endTime - startTime;
      const averageTime = executionTime / polygons.length;

      expect(averageTime).toBeLessThan(0.1); // Target: <0.1ms per validation
    });

    it("should calculate geometric properties efficiently", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      };

      const startTime = performance.now();

      // Perform multiple calculations
      for (let i = 0; i < 1000; i++) {
        polygonEditor.getPolygonCenter(polygon);
        polygonEditor.getPolygonBounds(polygon);
        polygonEditor.isPointInPolygon(polygon, { x: 50, y: 50 });
        polygonEditor.getClosestVertex(polygon, { x: 25, y: 25 });
        polygonEditor.getClosestEdge(polygon, { x: 75, y: 75 });
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;
      const averageTime = executionTime / 5000; // 1000 iterations × 5 operations

      expect(averageTime).toBeLessThan(0.05); // Target: <0.05ms per calculation
    });
  });

  describe("Memory Usage", () => {
    it("should not leak memory during operations", async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

      // Perform many operations
      for (let i = 0; i < 1000; i++) {
        const task: SegmentationTask = {
          type: "segmentation",
          imagePath: `/test/image${i}.jpg`,
        };

        await service.generateSegmentation(task);
      }

      // Force garbage collection if available
      if ((global as any).gc) {
        (global as any).gc();
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const memoryIncrease = finalMemory - initialMemory;

      // Memory increase should be reasonable (less than 10MB)
      expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
    });

    it("should handle large polygons efficiently", () => {
      // Create a large polygon with many vertices
      const largePolygon: Polygon = {
        points: Array.from({ length: 1000 }, (_, i) => ({
          x: Math.cos(i * 0.01) * 100,
          y: Math.sin(i * 0.01) * 100,
        })),
      };

      const startTime = performance.now();

      // Perform operations on large polygon
      polygonEditor.validatePolygon(largePolygon);
      polygonEditor.getPolygonCenter(largePolygon);
      polygonEditor.getPolygonBounds(largePolygon);
      polygonEditor.simplifyPolygon(largePolygon, 5.0);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(100); // Target: <100ms for large polygon
    });
  });

  describe("Concurrent Operations", () => {
    it("should handle concurrent segmentation generation", async () => {
      const tasks: SegmentationTask[] = Array.from({ length: 10 }, (_, i) => ({
        type: "segmentation",
        imagePath: `/test/image${i}.jpg`,
      }));

      const startTime = performance.now();

      // Run all tasks concurrently
      const promises = tasks.map((task) => service.generateSegmentation(task));
      const results = await Promise.all(promises);

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(results).toHaveLength(10);
      expect(executionTime).toBeLessThan(50); // Target: <50ms for 10 concurrent operations
    });

    it("should handle concurrent polygon operations", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      };

      const startTime = performance.now();

      // Run multiple operations concurrently
      const operations = [
        () => polygonEditor.scalePolygon(polygon, 1.1),
        () => polygonEditor.rotatePolygon(polygon, 0.1),
        () => polygonEditor.translatePolygon(polygon, { x: 1, y: 1 }),
        () => polygonEditor.simplifyPolygon(polygon, 1.0),
        () => polygonEditor.validatePolygon(polygon),
        () => polygonEditor.getPolygonCenter(polygon),
        () => polygonEditor.getPolygonBounds(polygon),
        () => polygonEditor.isPointInPolygon(polygon, { x: 50, y: 50 }),
      ];

      operations.forEach((operation) => operation());

      const endTime = performance.now();
      const executionTime = endTime - startTime;

      expect(executionTime).toBeLessThan(10); // Target: <10ms for concurrent operations
    });
  });

  describe("Stress Testing", () => {
    it("should handle high-frequency operations", async () => {
      const startTime = performance.now();

      // Perform many operations in rapid succession
      for (let i = 0; i < 100; i++) {
        const task: SegmentationTask = {
          type: "segmentation",
          imagePath: `/test/image${i}.jpg`,
        };

        await service.generateSegmentation(task);
      }

      const endTime = performance.now();
      const executionTime = endTime - startTime;
      const averageTime = executionTime / 100;

      expect(averageTime).toBeLessThan(16); // Target: <16ms average
    });

    it("should maintain performance under load", () => {
      const polygon: Polygon = {
        points: [
          { x: 0, y: 0 },
          { x: 100, y: 0 },
          { x: 100, y: 100 },
          { x: 0, y: 100 },
        ],
      };

      const times: number[] = [];

      // Measure performance over many iterations
      for (let i = 0; i < 1000; i++) {
        const startTime = performance.now();
        polygonEditor.validatePolygon(polygon);
        const endTime = performance.now();

        times.push(endTime - startTime);
      }

      const averageTime =
        times.reduce((sum, time) => sum + time, 0) / times.length;
      const maxTime = Math.max(...times);
      const minTime = Math.min(...times);

      expect(averageTime).toBeLessThan(0.1); // Target: <0.1ms average
      expect(maxTime).toBeLessThan(1); // Target: <1ms maximum
      expect(minTime).toBeGreaterThanOrEqual(0); // Sanity check
    });
  });
});
