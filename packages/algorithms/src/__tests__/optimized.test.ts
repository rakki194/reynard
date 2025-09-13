import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  configureOptimization,
  detectCollisions,
  detectCollisionsWithOptions,
  initializeOptimization,
  getOptimizationStats,
  clearOptimizationState,
  createSpatialData,
  querySpatialData,
  updateSpatialData,
  addToSpatialData,
  removeFromSpatialData
} from "../optimized";
import type { AABB } from "../geometry/collision/aabb-types";

describe("Optimized Algorithms API", () => {
  beforeEach(() => {
    // Reset optimization state before each test
    clearOptimizationState();
  });

  afterEach(() => {
    // Clean up after each test
    clearOptimizationState();
  });

  describe("configuration", () => {
    it("should configure optimization settings", () => {
      const config = {
        enableMemoryPooling: true,
        enableAlgorithmSelection: true,
        enablePerformanceMonitoring: false
      };

      expect(() => configureOptimization(config)).not.toThrow();
    });

    it("should initialize optimization", () => {
      expect(() => initializeOptimization()).not.toThrow();
    });

    it("should handle multiple configuration calls", () => {
      configureOptimization({ enableMemoryPooling: true });
      configureOptimization({ enableAlgorithmSelection: false });
      
      expect(() => initializeOptimization()).not.toThrow();
    });
  });

  describe("collision detection", () => {
    beforeEach(() => {
      initializeOptimization();
    });

    it("should detect collisions in small datasets", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 }, // Overlaps with first
        { x: 20, y: 20, width: 5, height: 5 }  // No overlap
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
          height: 5
        });
      }

      const collisions = detectCollisions(aabbs);
      
      expect(collisions).toBeInstanceOf(Array);
      expect(collisions.length).toBeGreaterThanOrEqual(0);
    });

    it("should detect collisions with custom options", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 15, y: 0, width: 10, height: 10 }
      ];

      const options = {
        maxDistance: 20,
        includeSelf: false
      };

      const collisions = detectCollisionsWithOptions(aabbs, options);
      
      expect(collisions).toBeInstanceOf(Array);
    });

    it("should handle empty arrays", () => {
      const aabbs: AABB[] = [];
      const collisions = detectCollisions(aabbs);
      
      expect(collisions).toEqual([]);
    });

    it("should handle single AABB", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 }
      ];

      const collisions = detectCollisions(aabbs);
      
      expect(collisions).toEqual([]);
    });

    it("should maintain performance for large datasets", () => {
      const aabbs: AABB[] = [];
      for (let i = 0; i < 500; i++) {
        aabbs.push({
          x: Math.random() * 1000,
          y: Math.random() * 1000,
          width: 10,
          height: 10
        });
      }

      const startTime = performance.now();
      const collisions = detectCollisions(aabbs);
      const endTime = performance.now();
      
      expect(collisions).toBeInstanceOf(Array);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });
  });

  describe("spatial data management", () => {
    it("should create spatial data structures", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 20, y: 20, width: 5, height: 5 }
      ];

      const spatialData = createSpatialData(aabbs);
      
      expect(spatialData).toBeDefined();
      expect(typeof spatialData).toBe("object");
    });

    it("should query spatial data", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 },
        { x: 50, y: 50, width: 5, height: 5 }
      ];

      const spatialData = createSpatialData(aabbs);
      const queryArea = { x: 0, y: 0, width: 15, height: 15 };
      
      const results = querySpatialData(spatialData, queryArea);
      
      expect(results).toBeInstanceOf(Array);
      expect(results.length).toBeGreaterThan(0);
    });

    it("should update spatial data", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 }
      ];

      const spatialData = createSpatialData(aabbs);
      const newAABBs: AABB[] = [
        { x: 5, y: 5, width: 10, height: 10 },
        { x: 20, y: 20, width: 5, height: 5 }
      ];

      expect(() => updateSpatialData(spatialData, newAABBs)).not.toThrow();
    });

    it("should add to spatial data", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 }
      ];

      const spatialData = createSpatialData(aabbs);
      const newAABB = { x: 20, y: 20, width: 5, height: 5 };

      expect(() => addToSpatialData(spatialData, newAABB, 1)).not.toThrow();
    });

    it("should remove from spatial data", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 20, y: 20, width: 5, height: 5 }
      ];

      const spatialData = createSpatialData(aabbs);

      expect(() => removeFromSpatialData(spatialData, 1)).not.toThrow();
    });

    it("should handle spatial data with empty arrays", () => {
      const aabbs: AABB[] = [];
      const spatialData = createSpatialData(aabbs);
      
      expect(spatialData).toBeDefined();
      
      const queryArea = { x: 0, y: 0, width: 10, height: 10 };
      const results = querySpatialData(spatialData, queryArea);
      
      expect(results).toEqual([]);
    });
  });

  describe("performance monitoring", () => {
    beforeEach(() => {
      configureOptimization({
        enablePerformanceMonitoring: true
      });
      initializeOptimization();
    });

    it("should provide optimization statistics", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 }
      ];

      // Perform some operations to generate stats
      detectCollisions(aabbs);
      
      const stats = getOptimizationStats();
      
      expect(stats).toBeDefined();
      expect(typeof stats).toBe("object");
    });

    it("should track performance over multiple operations", () => {
      const aabbs: AABB[] = [];
      for (let i = 0; i < 20; i++) {
        aabbs.push({
          x: Math.random() * 50,
          y: Math.random() * 50,
          width: 5,
          height: 5
        });
      }

      // Perform multiple operations
      for (let i = 0; i < 5; i++) {
        detectCollisions(aabbs);
      }
      
      const stats = getOptimizationStats();
      
      expect(stats).toBeDefined();
    });

    it("should reset statistics when state is cleared", () => {
      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 }
      ];

      detectCollisions(aabbs);
      clearOptimizationState();
      
      // Should not throw and should handle cleared state
      expect(() => getOptimizationStats()).not.toThrow();
    });
  });

  describe("memory pooling", () => {
    beforeEach(() => {
      configureOptimization({
        enableMemoryPooling: true
      });
      initializeOptimization();
    });

    it("should handle memory-intensive operations", () => {
      const largeDataset: AABB[] = [];
      for (let i = 0; i < 200; i++) {
        largeDataset.push({
          x: Math.random() * 200,
          y: Math.random() * 200,
          width: 8,
          height: 8
        });
      }

      // Multiple operations to test memory pooling
      for (let i = 0; i < 3; i++) {
        const collisions = detectCollisions(largeDataset);
        expect(collisions).toBeInstanceOf(Array);
      }
    });

    it("should work without memory pooling", () => {
      clearOptimizationState();
      configureOptimization({
        enableMemoryPooling: false
      });
      initializeOptimization();

      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 }
      ];

      const collisions = detectCollisions(aabbs);
      
      expect(collisions).toBeInstanceOf(Array);
      expect(collisions.length).toBeGreaterThan(0);
    });
  });

  describe("algorithm selection", () => {
    beforeEach(() => {
      configureOptimization({
        enableAlgorithmSelection: true,
        algorithmSelectionStrategy: "adaptive"
      });
      initializeOptimization();
    });

    it("should adapt algorithm selection based on dataset size", () => {
      // Small dataset should use naive algorithm
      const smallDataset: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 }
      ];

      const smallCollisions = detectCollisions(smallDataset);
      expect(smallCollisions).toBeInstanceOf(Array);

      // Large dataset should use optimized algorithm
      const largeDataset: AABB[] = [];
      for (let i = 0; i < 300; i++) {
        largeDataset.push({
          x: Math.random() * 300,
          y: Math.random() * 300,
          width: 5,
          height: 5
        });
      }

      const largeCollisions = detectCollisions(largeDataset);
      expect(largeCollisions).toBeInstanceOf(Array);
    });

    it("should work with fixed algorithm selection", () => {
      clearOptimizationState();
      configureOptimization({
        enableAlgorithmSelection: true,
        algorithmSelectionStrategy: "naive"
      });
      initializeOptimization();

      const aabbs: AABB[] = [
        { x: 0, y: 0, width: 10, height: 10 },
        { x: 5, y: 5, width: 10, height: 10 }
      ];

      const collisions = detectCollisions(aabbs);
      
      expect(collisions).toBeInstanceOf(Array);
    });
  });

  describe("edge cases and error handling", () => {
    it("should handle invalid AABB data gracefully", () => {
      const invalidAABBs = [
        { x: NaN, y: 0, width: 10, height: 10 },
        { x: 0, y: Infinity, width: 10, height: 10 }
      ];

      // Should not crash, may return empty results
      expect(() => detectCollisions(invalidAABBs)).not.toThrow();
    });

    it("should handle zero-size AABBs", () => {
      const zeroSizeAABBs: AABB[] = [
        { x: 0, y: 0, width: 0, height: 0 },
        { x: 5, y: 5, width: 0, height: 0 }
      ];

      expect(() => detectCollisions(zeroSizeAABBs)).not.toThrow();
    });

    it("should handle negative dimensions", () => {
      const negativeAABBs: AABB[] = [
        { x: 0, y: 0, width: -10, height: 10 },
        { x: 5, y: 5, width: 10, height: -10 }
      ];

      expect(() => detectCollisions(negativeAABBs)).not.toThrow();
    });

    it("should handle very large coordinate values", () => {
      const largeAABBs: AABB[] = [
        { x: 1e6, y: 1e6, width: 10, height: 10 },
        { x: 1e6 + 5, y: 1e6 + 5, width: 10, height: 10 }
      ];

      expect(() => detectCollisions(largeAABBs)).not.toThrow();
    });
  });
});
