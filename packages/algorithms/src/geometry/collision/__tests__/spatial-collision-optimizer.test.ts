/**
 * Spatial Collision Optimizer Tests
 *
 * Tests for spatial collision optimization functionality
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  SpatialCollisionOptimizer,
  AABB,
} from "../spatial-collision-optimizer";

describe("SpatialCollisionOptimizer", () => {
  let optimizer: SpatialCollisionOptimizer;

  beforeEach(() => {
    optimizer = new SpatialCollisionOptimizer({
      cellSize: 100,
      hybridThreshold: 10,
      enableCaching: true,
    });
  });

  it("should detect collisions in small datasets", () => {
    const aabbs: AABB[] = [
      { x: 0, y: 0, width: 50, height: 50 },
      { x: 25, y: 25, width: 50, height: 50 },
      { x: 100, y: 100, width: 50, height: 50 },
    ];

    const collisions = optimizer.detectCollisions(aabbs);

    expect(collisions).toHaveLength(1);
    expect(collisions[0].a).toBe(0);
    expect(collisions[0].b).toBe(1);
    expect(collisions[0].result.colliding).toBe(true);
  });

  it("should use spatial optimization for large datasets", () => {
    const aabbs: AABB[] = [];

    // Create 20 AABBs (above hybrid threshold)
    for (let i = 0; i < 20; i++) {
      aabbs.push({
        x: i * 10,
        y: i * 10,
        width: 50,
        height: 50,
      });
    }

    const collisions = optimizer.detectCollisions(aabbs);
    const stats = optimizer.getStats();

    expect(stats.spatialQueries).toBe(1);
    expect(stats.naiveQueries).toBe(0);
  });

  it("should use naive algorithm for small datasets", () => {
    const aabbs: AABB[] = [
      { x: 0, y: 0, width: 50, height: 50 },
      { x: 25, y: 25, width: 50, height: 50 },
    ];

    optimizer.detectCollisions(aabbs);
    const stats = optimizer.getStats();

    expect(stats.naiveQueries).toBe(1);
    expect(stats.spatialQueries).toBe(0);
  });

  it("should cache collision results", () => {
    const aabbs: AABB[] = [
      { x: 0, y: 0, width: 50, height: 50 },
      { x: 25, y: 25, width: 50, height: 50 },
    ];

    // First query
    optimizer.detectCollisions(aabbs);

    // Second query (should use cache)
    optimizer.detectCollisions(aabbs);

    const stats = optimizer.getStats();
    expect(stats.cacheHits).toBeGreaterThan(0);
  });

  it("should track performance statistics", () => {
    const aabbs: AABB[] = [
      { x: 0, y: 0, width: 50, height: 50 },
      { x: 25, y: 25, width: 50, height: 50 },
    ];

    optimizer.detectCollisions(aabbs);

    const stats = optimizer.getStats();
    expect(stats.totalQueries).toBe(1);
    expect(stats.objectsProcessed).toBe(2);
    expect(stats.averageQueryTime).toBeGreaterThan(0);
  });

  it("should clear cache", () => {
    const aabbs: AABB[] = [
      { x: 0, y: 0, width: 50, height: 50 },
      { x: 25, y: 25, width: 50, height: 50 },
    ];

    optimizer.detectCollisions(aabbs);
    optimizer.clearCache();

    const stats = optimizer.getStats();
    expect(stats.cacheHits).toBe(0);
  });

  it("should update configuration", () => {
    optimizer.updateConfig({
      cellSize: 200,
      hybridThreshold: 1, // Set threshold to 1 so 2 AABBs will use spatial optimization
    });

    const aabbs: AABB[] = [
      { x: 0, y: 0, width: 50, height: 50 },
      { x: 25, y: 25, width: 50, height: 50 },
    ];

    optimizer.detectCollisions(aabbs);
    const stats = optimizer.getStats();

    // Should now use spatial optimization due to lower threshold
    expect(stats.spatialQueries).toBe(1);
  });
});
