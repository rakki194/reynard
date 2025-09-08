/**
 * Optimized Spatial Collision Detection with Memory Pool Integration
 * 
 * This implementation uses the PAW memory pool system to eliminate allocation overhead,
 * addressing the primary performance bottleneck identified in empirical analysis.
 * 
 * @module algorithms/optimizedSpatialCollision
 */

import { globalPAWMemoryPool, PAWMemoryPool } from './memory-pool';
import { SpatialHash } from '../spatial-hash/spatial-hash-core';
import { UnionFind } from '../union-find/union-find-core';
import type { AABB, CollisionPair, CollisionResult } from '../geometry/collision/aabb-types';

export interface OptimizedSpatialConfig {
  cellSize: number;
  maxObjectsPerCell: number;
  enableCaching: boolean;
  cacheSize: number;
  hybridThreshold: number;
  useMemoryPool: boolean;
  memoryPool?: PAWMemoryPool;
}

export interface OptimizedCollisionStats {
  totalQueries: number;
  objectsProcessed: number;
  averageQueryTime: number;
  memoryPoolHits: number;
  memoryPoolMisses: number;
  allocationTimeSaved: number;
  spatialHashRebuilds: number;
  cacheHits: number;
  cacheMisses: number;
}

/**
 * Optimized spatial collision detection with memory pool integration
 */
export class OptimizedSpatialCollisionDetector {
  private config: OptimizedSpatialConfig;
  private memoryPool: PAWMemoryPool;
  private stats: OptimizedCollisionStats;
  private collisionCache = new Map<string, CollisionResult>();

  constructor(config: Partial<OptimizedSpatialConfig> = {}) {
    this.config = {
      cellSize: 100,
      maxObjectsPerCell: 50,
      enableCaching: true,
      cacheSize: 1000,
      hybridThreshold: 100,
      useMemoryPool: true,
      ...config,
    };

    this.memoryPool = this.config.memoryPool || globalPAWMemoryPool;
    
    this.stats = {
      totalQueries: 0,
      objectsProcessed: 0,
      averageQueryTime: 0,
      memoryPoolHits: 0,
      memoryPoolMisses: 0,
      allocationTimeSaved: 0,
      spatialHashRebuilds: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }

  /**
   * Detect collisions using optimized spatial partitioning with memory pooling
   */
  detectCollisions(aabbs: AABB[]): CollisionPair[] {
    const start = performance.now();
    this.stats.totalQueries++;
    this.stats.objectsProcessed = aabbs.length;

    let collisions: CollisionPair[];

    // Choose algorithm based on object count and use memory pooling
    if (aabbs.length < this.config.hybridThreshold) {
      collisions = this.optimizedNaiveCollisionDetection(aabbs);
    } else {
      collisions = this.optimizedSpatialCollisionDetection(aabbs);
    }

    const duration = performance.now() - start;
    this.updateAverageQueryTime(duration);

    return collisions;
  }

  /**
   * Optimized naive collision detection with memory pooling
   */
  private optimizedNaiveCollisionDetection(aabbs: AABB[]): CollisionPair[] {
    const collisions = this.memoryPool.getCollisionArray();
    
    try {
      for (let i = 0; i < aabbs.length; i++) {
        for (let j = i + 1; j < aabbs.length; j++) {
          const result = this.checkCollisionWithCache(aabbs[i], aabbs[j]);
          if (result.colliding) {
            collisions.push({ a: i, b: j, result });
          }
        }
      }
      
      return [...collisions]; // Return a copy to avoid pool contamination
    } finally {
      this.memoryPool.returnCollisionArray(collisions);
    }
  }

  /**
   * Optimized spatial collision detection with memory pooling
   */
  private optimizedSpatialCollisionDetection(aabbs: AABB[]): CollisionPair[] {
    const spatialHash = this.memoryPool.getSpatialHash({ cellSize: this.config.cellSize });
    const collisions = this.memoryPool.getCollisionArray();
    
    try {
      // Clear and rebuild spatial hash (this is still a bottleneck we'll address later)
      spatialHash.clear();
      this.stats.spatialHashRebuilds++;
      
      // Insert all AABBs
      aabbs.forEach((aabb, index) => {
        spatialHash.insert({
          id: index,
          x: aabb.x,
          y: aabb.y,
          width: aabb.width,
          height: aabb.height,
          data: { aabb, index },
        });
      });

      // Check collisions using spatial queries
      const processed = new Set<number>();

      for (let i = 0; i < aabbs.length; i++) {
        if (processed.has(i)) continue;

        const aabb = aabbs[i];
        const nearby = spatialHash.queryRect(
          aabb.x - aabb.width,
          aabb.y - aabb.height,
          aabb.width * 3,
          aabb.height * 3
        );

        for (const obj of nearby) {
          const j = obj.data.index;
          if (j <= i || processed.has(j)) continue;

          const result = this.checkCollisionWithCache(aabb, obj.data.aabb);
          if (result.colliding) {
            collisions.push({ a: i, b: j, result });
          }
        }

        processed.add(i);
      }

      return [...collisions]; // Return a copy to avoid pool contamination
    } finally {
      this.memoryPool.returnSpatialHash(spatialHash);
      this.memoryPool.returnCollisionArray(collisions);
    }
  }

  /**
   * Check collision with caching support
   */
  private checkCollisionWithCache(a: AABB, b: AABB): CollisionResult {
    if (!this.config.enableCaching) {
      return this.checkCollision(a, b);
    }

    const cacheKey = this.generateCacheKey(a, b);
    const cached = this.collisionCache.get(cacheKey);
    
    if (cached) {
      this.stats.cacheHits++;
      return cached;
    }

    this.stats.cacheMisses++;
    const result = this.checkCollision(a, b);
    
    // Add to cache if not full
    if (this.collisionCache.size < this.config.cacheSize) {
      this.collisionCache.set(cacheKey, result);
    }
    
    return result;
  }

  /**
   * Basic AABB collision detection
   */
  private checkCollision(a: AABB, b: AABB): CollisionResult {
    const colliding = !(a.x + a.width <= b.x || b.x + b.width <= a.x ||
                       a.y + a.height <= b.y || b.y + b.height <= a.y);
    
    if (!colliding) {
      return { colliding: false, distance: Infinity, overlap: null, overlapArea: 0 };
    }

    // Calculate overlap area
    const overlapX = Math.max(0, Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x));
    const overlapY = Math.max(0, Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y));
    const overlapArea = overlapX * overlapY;

    // Calculate distance between centers
    const centerA = { x: a.x + a.width / 2, y: a.y + a.height / 2 };
    const centerB = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
    const distance = Math.sqrt(
      Math.pow(centerA.x - centerB.x, 2) + Math.pow(centerA.y - centerB.y, 2)
    );

    return {
      colliding: true,
      distance,
      overlap: {
        x: Math.max(a.x, b.x),
        y: Math.max(a.y, b.y),
        width: overlapX,
        height: overlapY
      },
      overlapArea: overlapX * overlapY,
    };
  }

  /**
   * Generate cache key for collision pair
   */
  private generateCacheKey(a: AABB, b: AABB): string {
    // Use a consistent ordering to avoid duplicate cache entries
    const [first, second] = a.x < b.x || (a.x === b.x && a.y < b.y) ? [a, b] : [b, a];
    return `${first.x},${first.y},${first.width},${first.height}|${second.x},${second.y},${second.width},${second.height}`;
  }

  /**
   * Update average query time
   */
  private updateAverageQueryTime(duration: number): void {
    this.stats.averageQueryTime = 
      (this.stats.averageQueryTime * (this.stats.totalQueries - 1) + duration) / 
      this.stats.totalQueries;
  }

  /**
   * Get performance statistics
   */
  getStatistics(): OptimizedCollisionStats {
    const poolStats = this.memoryPool.getStatistics();
    return {
      ...this.stats,
      memoryPoolHits: poolStats.poolHits,
      memoryPoolMisses: poolStats.poolMisses,
      allocationTimeSaved: poolStats.memorySaved,
    };
  }

  /**
   * Get memory pool information
   */
  getMemoryPoolInfo() {
    return this.memoryPool.getPoolInfo();
  }

  /**
   * Clear collision cache
   */
  clearCache(): void {
    this.collisionCache.clear();
  }

  /**
   * Reset statistics
   */
  resetStatistics(): void {
    this.stats = {
      totalQueries: 0,
      objectsProcessed: 0,
      averageQueryTime: 0,
      memoryPoolHits: 0,
      memoryPoolMisses: 0,
      allocationTimeSaved: 0,
      spatialHashRebuilds: 0,
      cacheHits: 0,
      cacheMisses: 0,
    };
  }
}

/**
 * Factory function to create optimized collision detector
 */
export function createOptimizedCollisionDetector(config?: Partial<OptimizedSpatialConfig>): OptimizedSpatialCollisionDetector {
  return new OptimizedSpatialCollisionDetector(config);
}
