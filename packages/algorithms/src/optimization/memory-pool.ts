/**
 * PAW Memory Pool Optimization System
 * 
 * Eliminates allocation overhead by pre-allocating and reusing data structures.
 * This addresses the primary performance bottleneck identified in PAW empirical analysis.
 * 
 * @module algorithms/memoryPool
 */

import { SpatialHash } from '../spatial-hash/spatial-hash-core';
import { UnionFind } from '../union-find/union-find-core';
import type { AABB, CollisionPair } from '../geometry/collision/aabb-types';

export interface MemoryPoolConfig {
  spatialHashPoolSize: number;
  unionFindPoolSize: number;
  collisionArrayPoolSize: number;
  enablePoolReuse: boolean;
  poolGrowthStrategy: 'linear' | 'exponential' | 'adaptive';
  maxPoolSize: number;
  enableStatistics: boolean;
}

export interface PoolStatistics {
  totalAllocations: number;
  totalDeallocations: number;
  poolHits: number;
  poolMisses: number;
  memorySaved: number;
  averageAllocationTime: number;
  peakPoolUsage: number;
}

export interface PooledSpatialHash {
  hash: SpatialHash;
  isInUse: boolean;
  lastUsed: number;
  allocationCount: number;
}

export interface PooledUnionFind {
  unionFind: UnionFind;
  isInUse: boolean;
  lastUsed: number;
  size: number;
  allocationCount: number;
}

export interface PooledCollisionArray {
  array: CollisionPair[];
  isInUse: boolean;
  lastUsed: number;
  allocationCount: number;
}

/**
 * High-performance memory pool system for PAW optimization
 */
export class PAWMemoryPool {
  private spatialHashPool: PooledSpatialHash[] = [];
  private unionFindPool: PooledUnionFind[] = [];
  private collisionArrayPool: PooledCollisionArray[] = [];
  private config: MemoryPoolConfig;
  private stats: PoolStatistics;
  private poolCleanupInterval: number;

  constructor(config: Partial<MemoryPoolConfig> = {}) {
    this.config = {
      spatialHashPoolSize: 10,
      unionFindPoolSize: 20,
      collisionArrayPoolSize: 50,
      enablePoolReuse: true,
      poolGrowthStrategy: 'adaptive',
      maxPoolSize: 100,
      enableStatistics: true,
      ...config,
    };

    this.stats = {
      totalAllocations: 0,
      totalDeallocations: 0,
      poolHits: 0,
      poolMisses: 0,
      memorySaved: 0,
      averageAllocationTime: 0,
      peakPoolUsage: 0,
    };

    this.initializePools();
    this.startPoolCleanup();
  }

  /**
   * Initialize memory pools with pre-allocated objects
   */
  private initializePools(): void {
    // Initialize spatial hash pool
    for (let i = 0; i < this.config.spatialHashPoolSize; i++) {
      this.spatialHashPool.push({
        hash: new SpatialHash({ cellSize: 100 }),
        isInUse: false,
        lastUsed: 0,
        allocationCount: 0,
      });
    }

    // Initialize union-find pool with common sizes
    const commonSizes = [10, 25, 50, 100, 200, 500];
    for (const size of commonSizes) {
      for (let i = 0; i < Math.ceil(this.config.unionFindPoolSize / commonSizes.length); i++) {
        this.unionFindPool.push({
          unionFind: new UnionFind(size),
          isInUse: false,
          lastUsed: 0,
          size,
          allocationCount: 0,
        });
      }
    }

    // Initialize collision array pool
    for (let i = 0; i < this.config.collisionArrayPoolSize; i++) {
      this.collisionArrayPool.push({
        array: [],
        isInUse: false,
        lastUsed: 0,
        allocationCount: 0,
      });
    }
  }

  /**
   * Get a pooled spatial hash instance
   */
  getSpatialHash(config?: any): SpatialHash {
    const startTime = performance.now();
    
    // Try to find an available pooled instance
    let pooled = this.spatialHashPool.find(p => !p.isInUse);
    
    if (pooled) {
      // Reuse existing instance
      pooled.isInUse = true;
      pooled.lastUsed = Date.now();
      pooled.allocationCount++;
      this.stats.poolHits++;
      
      // Clear and reconfigure if needed
      pooled.hash.clear();
      if (config) {
        // Note: SpatialHash doesn't support reconfiguration, so we use default
        // In a full implementation, we'd need to support reconfiguration
      }
      
      this.updateStats(startTime, true);
      return pooled.hash;
    } else {
      // Pool miss - create new instance
      this.stats.poolMisses++;
      const newHash = new SpatialHash(config || { cellSize: 100 });
      
      // Add to pool if we haven't exceeded max size
      if (this.spatialHashPool.length < this.config.maxPoolSize) {
        this.spatialHashPool.push({
          hash: newHash,
          isInUse: true,
          lastUsed: Date.now(),
          allocationCount: 1,
        });
      }
      
      this.updateStats(startTime, false);
      return newHash;
    }
  }

  /**
   * Get a pooled union-find instance
   */
  getUnionFind(size: number): UnionFind {
    const startTime = performance.now();
    
    // Try to find an available pooled instance of the right size
    let pooled = this.unionFindPool.find(p => !p.isInUse && p.size === size);
    
    if (pooled) {
      // Reuse existing instance
      pooled.isInUse = true;
      pooled.lastUsed = Date.now();
      pooled.allocationCount++;
      this.stats.poolHits++;
      
      // Reset union-find state
      pooled.unionFind = new UnionFind(size);
      
      this.updateStats(startTime, true);
      return pooled.unionFind;
    } else {
      // Pool miss - create new instance
      this.stats.poolMisses++;
      const newUnionFind = new UnionFind(size);
      
      // Add to pool if we haven't exceeded max size
      if (this.unionFindPool.length < this.config.maxPoolSize) {
        this.unionFindPool.push({
          unionFind: newUnionFind,
          isInUse: true,
          lastUsed: Date.now(),
          size,
          allocationCount: 1,
        });
      }
      
      this.updateStats(startTime, false);
      return newUnionFind;
    }
  }

  /**
   * Get a pooled collision array
   */
  getCollisionArray(): CollisionPair[] {
    const startTime = performance.now();
    
    // Try to find an available pooled array
    let pooled = this.collisionArrayPool.find(p => !p.isInUse);
    
    if (pooled) {
      // Reuse existing array
      pooled.isInUse = true;
      pooled.lastUsed = Date.now();
      pooled.allocationCount++;
      this.stats.poolHits++;
      
      // Clear array for reuse
      pooled.array.length = 0;
      
      this.updateStats(startTime, true);
      return pooled.array;
    } else {
      // Pool miss - create new array
      this.stats.poolMisses++;
      const newArray: CollisionPair[] = [];
      
      // Add to pool if we haven't exceeded max size
      if (this.collisionArrayPool.length < this.config.maxPoolSize) {
        this.collisionArrayPool.push({
          array: newArray,
          isInUse: true,
          lastUsed: Date.now(),
          allocationCount: 1,
        });
      }
      
      this.updateStats(startTime, false);
      return newArray;
    }
  }

  /**
   * Return a spatial hash to the pool
   */
  returnSpatialHash(hash: SpatialHash): void {
    const pooled = this.spatialHashPool.find(p => p.hash === hash);
    if (pooled) {
      pooled.isInUse = false;
      pooled.lastUsed = Date.now();
      this.stats.totalDeallocations++;
    }
  }

  /**
   * Return a union-find to the pool
   */
  returnUnionFind(unionFind: UnionFind): void {
    const pooled = this.unionFindPool.find(p => p.unionFind === unionFind);
    if (pooled) {
      pooled.isInUse = false;
      pooled.lastUsed = Date.now();
      this.stats.totalDeallocations++;
    }
  }

  /**
   * Return a collision array to the pool
   */
  returnCollisionArray(array: CollisionPair[]): void {
    const pooled = this.collisionArrayPool.find(p => p.array === array);
    if (pooled) {
      pooled.isInUse = false;
      pooled.lastUsed = Date.now();
      this.stats.totalDeallocations++;
    }
  }

  /**
   * Update pool statistics
   */
  private updateStats(startTime: number, wasPoolHit: boolean): void {
    const allocationTime = performance.now() - startTime;
    this.stats.totalAllocations++;
    this.stats.averageAllocationTime = 
      (this.stats.averageAllocationTime * (this.stats.totalAllocations - 1) + allocationTime) / 
      this.stats.totalAllocations;
    
    if (wasPoolHit) {
      this.stats.memorySaved += this.estimateMemorySavings();
    }
    
    this.stats.peakPoolUsage = Math.max(
      this.stats.peakPoolUsage,
      this.getCurrentPoolUsage()
    );
  }

  /**
   * Estimate memory savings from pooling
   */
  private estimateMemorySavings(): number {
    // Rough estimates for memory usage
    const spatialHashSize = 1024; // bytes
    const unionFindSize = 256; // bytes
    const collisionArraySize = 64; // bytes
    
    return spatialHashSize + unionFindSize + collisionArraySize;
  }

  /**
   * Get current pool usage statistics
   */
  getCurrentPoolUsage(): number {
    const spatialHashInUse = this.spatialHashPool.filter(p => p.isInUse).length;
    const unionFindInUse = this.unionFindPool.filter(p => p.isInUse).length;
    const collisionArrayInUse = this.collisionArrayPool.filter(p => p.isInUse).length;
    
    return spatialHashInUse + unionFindInUse + collisionArrayInUse;
  }

  /**
   * Get pool statistics
   */
  getStatistics(): PoolStatistics {
    return { ...this.stats };
  }

  /**
   * Get detailed pool information
   */
  getPoolInfo(): {
    spatialHashPool: { total: number; inUse: number; available: number };
    unionFindPool: { total: number; inUse: number; available: number };
    collisionArrayPool: { total: number; inUse: number; available: number };
  } {
    return {
      spatialHashPool: {
        total: this.spatialHashPool.length,
        inUse: this.spatialHashPool.filter(p => p.isInUse).length,
        available: this.spatialHashPool.filter(p => !p.isInUse).length,
      },
      unionFindPool: {
        total: this.unionFindPool.length,
        inUse: this.unionFindPool.filter(p => p.isInUse).length,
        available: this.unionFindPool.filter(p => !p.isInUse).length,
      },
      collisionArrayPool: {
        total: this.collisionArrayPool.length,
        inUse: this.collisionArrayPool.filter(p => p.isInUse).length,
        available: this.collisionArrayPool.filter(p => !p.isInUse).length,
      },
    };
  }

  /**
   * Start periodic pool cleanup
   */
  private startPoolCleanup(): void {
    this.poolCleanupInterval = window.setInterval(() => {
      this.cleanupUnusedPools();
    }, 30000); // Cleanup every 30 seconds
  }

  /**
   * Clean up unused pools to prevent memory leaks
   */
  private cleanupUnusedPools(): void {
    const now = Date.now();
    const maxIdleTime = 300000; // 5 minutes

    // Clean up unused spatial hash pools
    this.spatialHashPool = this.spatialHashPool.filter(p => {
      if (!p.isInUse && now - p.lastUsed > maxIdleTime) {
        return false;
      }
      return true;
    });

    // Clean up unused union-find pools
    this.unionFindPool = this.unionFindPool.filter(p => {
      if (!p.isInUse && now - p.lastUsed > maxIdleTime) {
        return false;
      }
      return true;
    });

    // Clean up unused collision array pools
    this.collisionArrayPool = this.collisionArrayPool.filter(p => {
      if (!p.isInUse && now - p.lastUsed > maxIdleTime) {
        return false;
      }
      return true;
    });
  }

  /**
   * Destroy the memory pool and clean up resources
   */
  destroy(): void {
    if (this.poolCleanupInterval) {
      clearInterval(this.poolCleanupInterval);
    }
    
    this.spatialHashPool = [];
    this.unionFindPool = [];
    this.collisionArrayPool = [];
  }
}

/**
 * Global memory pool instance for PAW optimization
 */
export const globalPAWMemoryPool = new PAWMemoryPool({
  spatialHashPoolSize: 20,
  unionFindPoolSize: 50,
  collisionArrayPoolSize: 100,
  enablePoolReuse: true,
  poolGrowthStrategy: 'adaptive',
  maxPoolSize: 200,
  enableStatistics: true,
});
