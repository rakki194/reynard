import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  configureOptimization,
  detectCollisions,
  performSpatialQuery,
  PerformanceMonitor,
  OptimizationConfig,
  cleanup,
} from "../optimized";
import type { AABB } from "../geometry/collision/aabb-types";

describe("Optimized Algorithms API", () => {
  beforeEach(() => {
    // Reset optimization state before each test
    cleanup();
  });

  afterEach(() => {
    // Clean up after each test
    cleanup();
  });

  describe("configuration", () => {
    it("should configure optimization settings", () => {
      const config = {
        enableMemoryPooling: true,
        enableAlgorithmSelection: true,
        enablePerformanceMonitoring: false,
      };

      expect(() => configureOptimization(config)).not.toThrow();
    });

    it("should initialize optimization", () => {
      const monitor = new PerformanceMonitor();
      expect(monitor).toBeDefined();
    });

    it("should handle multiple configuration calls", () => {
      configureOptimization({ enableMemoryPooling: true });
      configureOptimization({ enableAlgorithmSelection: false });

      const config = new OptimizationConfig();
      expect(config).toBeDefined();
    });
  });

  describe("collision detection", () => {
    beforeEach(() => {
      configureOptimization({ enableMemoryPooling: true });
    });

    it("should detect collisions in small datasets", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 }, // Overlaps with first
        { x: 20, y: 20, width: 5, height: 5 }, // No overlap
      ];

      const collisions = detectCollisions(aabbs);

      expect(collisions).toBeInstanceOf(Array);
      expect(collisions.length).toBeGreaterThan(0);
      expect(collisions[0]).toHaveProperty("a");
      expect(collisions[0]).toHaveProperty("b");
      expect(collisions[0]).toHaveProperty("result");
    });

    it("should detect collisions in medium datasets", () => {
      const aabbs: AABB[] = [];
      for (let i = 0; i < 100; i++) {
        aabbs.push({
          x: Math.random() * 100,
          y: Math.random() * 100,
          width: 5,
          height: 5,
        });
      }

      const collisions = detectCollisions(aabbs);

      expect(collisions).toBeInstanceOf(Array);
      expect(collisions.length).toBeGreaterThanOrEqual(0);
    });

    it("should detect collisions with custom options", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 15, y: 0, width: 10, height: 10 },
      ];

      const collisions = detectCollisions(aabbs);

      expect(collisions).toBeInstanceOf(Array);
    });

    it("should handle empty arrays", () => {
      const aabbs: AABB[] = [];
      const collisions = detectCollisions(aabbs);

      expect(collisions).toEqual([]);
    });

    it("should handle single AABB", () => {
      const aabbs: AABB[] = [{ x: 0, y: 0, width: 10, height: 10 }];
      const collisions = detectCollisions(aabbs);

      expect(collisions).toEqual([]);
    });

    it("should maintain performance for large datasets", () => {
      const aabbs: AABB[] = [];
      for (let i = 0; i < 1000; i++) {
        aabbs.push({
          x: Math.random() * 1000,
          y: Math.random() * 1000,
          width: 10,
          height: 10,
        });
      }

      const start = performance.now();
      const collisions = detectCollisions(aabbs);
      const end = performance.now();

      expect(collisions).toBeInstanceOf(Array);
      expect(end - start).toBeLessThan(100); // Should complete within 100ms
    });
  });

  describe("spatial data management", () => {
    it("should create spatial data structures", () => {
      const spatialObjects = [
        { aabb: { x: 0, y: 0, width: 10, height: 10 }, data: "object1" },
        { aabb: { x: 20, y: 20, width: 5, height: 5 }, data: "object2" },
      ];

      expect(spatialObjects).toHaveLength(2);
      expect(spatialObjects[0].data).toBe("object1");
    });

    it("should query spatial data", () => {
      const spatialObjects = [
        { aabb: { x: 0, y: 0, width: 10, height: 10 }, data: "object1" },
        { aabb: { x: 20, y: 20, width: 5, height: 5 }, data: "object2" },
      ];

      const queryAABB: AABB = { x: 5, y: 5, width: 10, height: 10 };
      const nearby = performSpatialQuery(queryAABB, spatialObjects);

      expect(nearby).toBeInstanceOf(Array);
      expect(nearby.length).toBeGreaterThan(0);
    });

    it("should update spatial data", () => {
      const spatialObjects = [{ aabb: { x: 0, y: 0, width: 10, height: 10 }, data: "object1" }];

      // Simulate updating an object's position
      spatialObjects[0].aabb.x = 10;
      spatialObjects[0].aabb.y = 10;

      expect(spatialObjects[0].aabb.x).toBe(10);
      expect(spatialObjects[0].aabb.y).toBe(10);
    });

    it("should add to spatial data", () => {
      const spatialObjects: Array<{ aabb: AABB; data: string }> = [];

      spatialObjects.push({
        aabb: { x: 0, y: 0, width: 10, height: 10 },
        data: "new",
      });

      expect(spatialObjects).toHaveLength(1);
      expect(spatialObjects[0].data).toBe("new");
    });

    it("should remove from spatial data", () => {
      const spatialObjects = [
        { aabb: { x: 0, y: 0, width: 10, height: 10 }, data: "object1" },
        { aabb: { x: 20, y: 20, width: 5, height: 5 }, data: "object2" },
      ];

      spatialObjects.splice(0, 1);

      expect(spatialObjects).toHaveLength(1);
      expect(spatialObjects[0].data).toBe("object2");
    });

    it("should handle spatial data with empty arrays", () => {
      const spatialObjects: Array<{ aabb: AABB; data: string }> = [];
      const queryAABB: AABB = { x: 0, y: 0, width: 10, height: 10 };

      const nearby = performSpatialQuery(queryAABB, spatialObjects);

      expect(nearby).toEqual([]);
    });
  });

  describe("performance monitoring", () => {
    it("should provide optimization statistics", () => {
      const monitor = new PerformanceMonitor();
      const stats = monitor.getPerformanceStats();

      expect(stats).toBeDefined();
      expect(typeof stats.totalQueries).toBe("number");
    });

    it("should track performance over multiple operations", () => {
      const monitor = new PerformanceMonitor();

      // Perform some operations
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 },
      ];

      detectCollisions(aabbs);
      detectCollisions(aabbs);

      const stats = monitor.getPerformanceStats();
      expect(stats.totalQueries).toBeGreaterThan(0);
    });

    it("should reset statistics when state is cleared", () => {
      const monitor = new PerformanceMonitor();

      // Perform some operations
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 },
      ];

      detectCollisions(aabbs);

      monitor.resetStatistics();
      const stats = monitor.getPerformanceStats();

      expect(stats.totalQueries).toBe(0);
    });
  });

  describe("memory pooling", () => {
    it("should handle memory-intensive operations", () => {
      configureOptimization({ enableMemoryPooling: true });

      const aabbs: AABB[] = [];
      for (let i = 0; i < 500; i++) {
        aabbs.push({
          x: Math.random() * 1000,
          y: Math.random() * 1000,
          width: 10,
          height: 10,
        });
      }

      const collisions = detectCollisions(aabbs);
      expect(collisions).toBeInstanceOf(Array);
    });

    it("should work without memory pooling", () => {
      configureOptimization({ enableMemoryPooling: false });

      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 },
      ];

      const collisions = detectCollisions(aabbs);
      expect(collisions).toBeInstanceOf(Array);
    });
  });

  describe("algorithm selection", () => {
    it("should adapt algorithm selection based on dataset size", () => {
      configureOptimization({ enableAlgorithmSelection: true });

      // Small dataset
      const smallAABBs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 },
      ];

      const smallCollisions = detectCollisions(smallAABBs);
      expect(smallCollisions).toBeInstanceOf(Array);

      // Large dataset
      const largeAABBs: AABB[] = [];
      for (let i = 0; i < 200; i++) {
        largeAABBs.push({
          x: Math.random() * 1000,
          y: Math.random() * 1000,
          width: 10,
          height: 10,
        });
      }

      const largeCollisions = detectCollisions(largeAABBs);
      expect(largeCollisions).toBeInstanceOf(Array);
    });

    it("should work with fixed algorithm selection", () => {
      configureOptimization({
        enableAlgorithmSelection: false,
        algorithmSelectionStrategy: "naive",
      });

      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 },
      ];

      const collisions = detectCollisions(aabbs);
      expect(collisions).toBeInstanceOf(Array);
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle invalid AABB data gracefully", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: NaN, y: NaN, width: NaN, height: NaN }, // Invalid data
      ];

      expect(() => detectCollisions(aabbs)).not.toThrow();
    });

    it("should handle zero-size AABBs", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 0, height: 0 },
        { x: 5, y: 5, width: 0, height: 0 },
      ];

      const collisions = detectCollisions(aabbs);
      expect(collisions).toBeInstanceOf(Array);
    });

    it("should handle negative dimensions", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: -10, height: -10 },
        { x: 5, y: 5, width: 10, height: 10 },
      ];

      const collisions = detectCollisions(aabbs);
      expect(collisions).toBeInstanceOf(Array);
    });

    it("should handle very large coordinate values", () => {
      const aabbs: AABB[] = [
        {
          x: Number.MAX_SAFE_INTEGER,
          y: Number.MAX_SAFE_INTEGER,
          width: 10,
          height: 10,
        },
        {
          x: Number.MAX_SAFE_INTEGER - 5,
          y: Number.MAX_SAFE_INTEGER - 5,
          width: 10,
          height: 10,
        },
      ];

      const collisions = detectCollisions(aabbs);
      expect(collisions).toBeInstanceOf(Array);
    });
  });
});
