/**
 * Optimized Collision Detection Adapter
 * 
 * This adapter integrates the PAW optimization techniques with collision detection,
 * providing automatic algorithm selection and memory pooling for optimal performance.
 * 
 * @module algorithms/optimization/optimizedCollisionAdapter
 */

import { AlgorithmSelector, type WorkloadCharacteristics } from '../core/algorithm-selector';
import { EnhancedMemoryPool } from '../core/enhanced-memory-pool';
import { SpatialHash } from '../../spatial-hash/spatial-hash-core';
import { UnionFind } from '../../union-find/union-find-core';
import type { AABB, CollisionPair, CollisionResult } from '../../geometry/collision/aabb-types';

export interface OptimizedCollisionConfig {
  enableMemoryPooling: boolean;
  enableAlgorithmSelection: boolean;
  enablePerformanceMonitoring: boolean;
  memoryPoolConfig?: Partial<MemoryPoolConfig>;
  algorithmSelectionStrategy: 'naive' | 'spatial' | 'optimized' | 'adaptive';
  performanceThresholds: {
    maxExecutionTime: number;
    maxMemoryUsage: number;
    minHitRate: number;
  };
}

export interface CollisionPerformanceStats {
  totalQueries: number;
  averageExecutionTime: number;
  averageMemoryUsage: number;
  algorithmUsage: {
    naive: number;
    spatial: number;
    optimized: number;
  };
  memoryPoolStats: MemoryPoolStats;
  performanceHistory: PerformanceRecord[];
}

export interface PerformanceRecord {
  timestamp: number;
  algorithm: string;
  objectCount: number;
  executionTime: number;
  memoryUsage: number;
  hitRate: number;
}

/**
 * Optimized collision detection adapter with automatic algorithm selection
 */
export class OptimizedCollisionAdapter {
  private algorithmSelector: AlgorithmSelector;
  private memoryPool: EnhancedMemoryPool;
  private config: OptimizedCollisionConfig;
  private stats: CollisionPerformanceStats;
  private performanceHistory: PerformanceRecord[] = [];

  constructor(config: Partial<OptimizedCollisionConfig> = {}) {
    this.config = {
      enableMemoryPooling: true,
      enableAlgorithmSelection: true,
      enablePerformanceMonitoring: true,
      algorithmSelectionStrategy: 'adaptive',
      performanceThresholds: {
        maxExecutionTime: 16, // 16ms for 60fps
        maxMemoryUsage: 50 * 1024 * 1024, // 50MB
        minHitRate: 90
      },
      ...config,
    };

    this.algorithmSelector = new AlgorithmSelector();
    this.memoryPool = new EnhancedMemoryPool(this.config.memoryPoolConfig);
    
    this.stats = {
      totalQueries: 0,
      averageExecutionTime: 0,
      averageMemoryUsage: 0,
      algorithmUsage: {
        naive: 0,
        spatial: 0,
        optimized: 0
      },
      memoryPoolStats: this.memoryPool.getStatistics(),
      performanceHistory: []
    };
  }

  /**
   * Detect collisions with automatic algorithm selection and optimization
   */
  detectCollisions(aabbs: AABB[]): CollisionPair[] {
    const start = performance.now();
    const memoryStart = this.getCurrentMemoryUsage();
    
    this.stats.totalQueries++;

    let result: CollisionPair[];
    let algorithm: string;

    if (this.config.enableAlgorithmSelection) {
      // Use intelligent algorithm selection
      const workload = this.analyzeWorkload(aabbs);
      const selection = this.algorithmSelector.selectCollisionAlgorithm(workload);
      algorithm = selection.algorithm;
      
      result = this.executeAlgorithm(algorithm, aabbs);
      
      // Update performance model
      if (this.config.enablePerformanceMonitoring) {
        this.updatePerformanceModel(algorithm, aabbs.length, start, memoryStart);
      }
    } else {
      // Use configured strategy
      algorithm = this.config.algorithmSelectionStrategy;
      result = this.executeAlgorithm(algorithm, aabbs);
    }

    // Update statistics
    this.updateStats(algorithm, start, memoryStart);

    return result;
  }

  /**
   * Analyze workload characteristics
   */
  private analyzeWorkload(aabbs: AABB[]): WorkloadCharacteristics {
    const objectCount = aabbs.length;
    const spatialDensity = this.calculateSpatialDensity(aabbs);
    const overlapRatio = this.calculateOverlapRatio(aabbs);
    const updateFrequency = this.estimateUpdateFrequency();
    const queryPattern = this.analyzeQueryPattern(aabbs);

    return {
      objectCount,
      spatialDensity,
      overlapRatio,
      updateFrequency,
      queryPattern
    };
  }

  /**
   * Calculate spatial density of objects
   */
  private calculateSpatialDensity(aabbs: AABB[]): number {
    if (aabbs.length === 0) return 0;

    // Calculate bounding box of all objects
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    let totalArea = 0;

    for (const aabb of aabbs) {
      minX = Math.min(minX, aabb.x);
      minY = Math.min(minY, aabb.y);
      maxX = Math.max(maxX, aabb.x + aabb.width);
      maxY = Math.max(maxY, aabb.y + aabb.height);
      totalArea += aabb.width * aabb.height;
    }

    const boundingArea = (maxX - minX) * (maxY - minY);
    return boundingArea > 0 ? totalArea / boundingArea : 0;
  }

  /**
   * Calculate overlap ratio between objects
   */
  private calculateOverlapRatio(aabbs: AABB[]): number {
    if (aabbs.length < 2) return 0;

    let overlapCount = 0;
    let totalPairs = 0;

    // Sample a subset for performance
    const sampleSize = Math.min(100, aabbs.length);
    const step = Math.max(1, Math.floor(aabbs.length / sampleSize));

    for (let i = 0; i < aabbs.length; i += step) {
      for (let j = i + step; j < aabbs.length; j += step) {
        totalPairs++;
        if (this.checkCollision(aabbs[i], aabbs[j])) {
          overlapCount++;
        }
      }
    }

    return totalPairs > 0 ? overlapCount / totalPairs : 0;
  }

  /**
   * Estimate update frequency based on recent queries
   */
  private estimateUpdateFrequency(): number {
    const now = Date.now();
    const recentQueries = this.performanceHistory.filter(
      record => now - record.timestamp < 1000 // Last second
    );
    return recentQueries.length;
  }

  /**
   * Analyze query pattern
   */
  private analyzeQueryPattern(aabbs: AABB[]): 'random' | 'clustered' | 'sequential' {
    if (aabbs.length < 3) return 'random';

    // Analyze spatial distribution
    const spatialDensity = this.calculateSpatialDensity(aabbs);
    
    if (spatialDensity > 0.7) return 'clustered';
    if (spatialDensity < 0.3) return 'random';
    return 'sequential';
  }

  /**
   * Execute the selected algorithm
   */
  private executeAlgorithm(algorithm: string, aabbs: AABB[]): CollisionPair[] {
    switch (algorithm) {
      case 'naive':
        return this.executeNaiveCollisionDetection(aabbs);
      case 'spatial':
        return this.executeSpatialCollisionDetection(aabbs);
      case 'optimized':
        return this.executeOptimizedCollisionDetection(aabbs);
      default:
        return this.executeOptimizedCollisionDetection(aabbs);
    }
  }

  /**
   * Execute naive collision detection
   */
  private executeNaiveCollisionDetection(aabbs: AABB[]): CollisionPair[] {
    const collisions: CollisionPair[] = [];
    
    for (let i = 0; i < aabbs.length; i++) {
      for (let j = i + 1; j < aabbs.length; j++) {
        if (this.checkCollision(aabbs[i], aabbs[j])) {
          collisions.push({ a: i, b: j, result: this.createCollisionResult(aabbs[i], aabbs[j]) });
        }
      }
    }
    
    return collisions;
  }

  /**
   * Execute spatial collision detection
   */
  private executeSpatialCollisionDetection(aabbs: AABB[]): CollisionPair[] {
    const spatialHash = this.memoryPool.getSpatialHash({ cellSize: 100 });
    const collisions = this.memoryPool.getCollisionArray();
    
    try {
      // Insert all AABBs
      for (let i = 0; i < aabbs.length; i++) {
        spatialHash.insert({
          id: i,
          x: aabbs[i].x,
          y: aabbs[i].y,
          width: aabbs[i].width,
          height: aabbs[i].height,
          data: { aabb: aabbs[i], index: i },
        });
      }

      // Check collisions using spatial queries
      const processed = this.memoryPool.getProcessedSet();
      
      try {
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

            if (this.checkCollision(aabb, obj.data.aabb)) {
              collisions.push({ a: i, b: j, result: this.createCollisionResult(aabb, obj.data.aabb) });
            }
          }

          processed.add(i);
        }

        return [...collisions];
      } finally {
        this.memoryPool.returnProcessedSet(processed);
      }
    } finally {
      this.memoryPool.returnSpatialHash(spatialHash);
      this.memoryPool.returnCollisionArray(collisions);
    }
  }

  /**
   * Execute optimized collision detection with full memory pooling
   */
  private executeOptimizedCollisionDetection(aabbs: AABB[]): CollisionPair[] {
    // This is the same as spatial but with enhanced memory pooling
    return this.executeSpatialCollisionDetection(aabbs);
  }

  /**
   * Basic collision detection
   */
  private checkCollision(a: AABB, b: AABB): boolean {
    return !(a.x + a.width <= b.x || b.x + b.width <= a.x ||
             a.y + a.height <= b.y || b.y + b.height <= a.y);
  }

  /**
   * Create collision result
   */
  private createCollisionResult(a: AABB, b: AABB): CollisionResult {
    const colliding = this.checkCollision(a, b);
    
    if (!colliding) {
      return { colliding: false, distance: Infinity };
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
      overlapArea,
      overlapX,
      overlapY,
    };
  }

  /**
   * Update performance model
   */
  private updatePerformanceModel(
    algorithm: string,
    objectCount: number,
    startTime: number,
    memoryStart: number
  ): void {
    const executionTime = performance.now() - startTime;
    const memoryUsage = this.getCurrentMemoryUsage() - memoryStart;
    const hitRate = this.memoryPool.getStatistics().hitRate;

    const record: PerformanceRecord = {
      timestamp: Date.now(),
      algorithm,
      objectCount,
      executionTime,
      memoryUsage,
      hitRate
    };

    this.performanceHistory.push(record);
    
    // Keep only recent history
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory = this.performanceHistory.slice(-1000);
    }

    // Update algorithm selector
    this.algorithmSelector.updatePerformanceModel({
      algorithm,
      workload: this.analyzeWorkload([]), // Simplified for now
      performance: {
        executionTime,
        memoryUsage,
        allocationCount: 0, // Would need to track this
        cacheHitRate: hitRate
      },
      timestamp: Date.now()
    });
  }

  /**
   * Update statistics
   */
  private updateStats(algorithm: string, startTime: number, memoryStart: number): void {
    const executionTime = performance.now() - startTime;
    const memoryUsage = this.getCurrentMemoryUsage() - memoryStart;

    // Update average execution time
    this.stats.averageExecutionTime = 
      (this.stats.averageExecutionTime * (this.stats.totalQueries - 1) + executionTime) / 
      this.stats.totalQueries;

    // Update average memory usage
    this.stats.averageMemoryUsage = 
      (this.stats.averageMemoryUsage * (this.stats.totalQueries - 1) + memoryUsage) / 
      this.stats.totalQueries;

    // Update algorithm usage
    this.stats.algorithmUsage[algorithm as keyof typeof this.stats.algorithmUsage]++;

    // Update memory pool stats
    this.stats.memoryPoolStats = this.memoryPool.getStatistics();
  }

  /**
   * Get current memory usage
   */
  private getCurrentMemoryUsage(): number {
    return (performance as any).memory?.usedJSHeapSize || 0;
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): CollisionPerformanceStats {
    return { ...this.stats };
  }

  /**
   * Get memory pool statistics
   */
  getMemoryPoolStats(): MemoryPoolStats {
    return this.memoryPool.getStatistics();
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations(): OptimizationRecommendation[] {
    return this.memoryPool.getOptimizationRecommendations();
  }

  /**
   * Check if performance is degraded
   */
  isPerformanceDegraded(): boolean {
    const stats = this.getPerformanceStats();
    const thresholds = this.config.performanceThresholds;

    return (
      stats.averageExecutionTime > thresholds.maxExecutionTime ||
      stats.averageMemoryUsage > thresholds.maxMemoryUsage ||
      stats.memoryPoolStats.hitRate < thresholds.minHitRate
    );
  }

  /**
   * Get performance report
   */
  getPerformanceReport(): {
    summary: {
      totalQueries: number;
      averageExecutionTime: number;
      averageMemoryUsage: number;
      hitRate: number;
      isDegraded: boolean;
    };
    algorithmUsage: {
      naive: number;
      spatial: number;
      optimized: number;
    };
    memoryPool: MemoryPoolStats;
    recommendations: OptimizationRecommendation[];
  } {
    const stats = this.getPerformanceStats();
    
    return {
      summary: {
        totalQueries: stats.totalQueries,
        averageExecutionTime: stats.averageExecutionTime,
        averageMemoryUsage: stats.averageMemoryUsage,
        hitRate: stats.memoryPoolStats.hitRate,
        isDegraded: this.isPerformanceDegraded()
      },
      algorithmUsage: stats.algorithmUsage,
      memoryPool: stats.memoryPoolStats,
      recommendations: this.getOptimizationRecommendations()
    };
  }

  /**
   * Reset statistics
   */
  resetStatistics(): void {
    this.stats = {
      totalQueries: 0,
      averageExecutionTime: 0,
      averageMemoryUsage: 0,
      algorithmUsage: {
        naive: 0,
        spatial: 0,
        optimized: 0
      },
      memoryPoolStats: this.memoryPool.getStatistics(),
      performanceHistory: []
    };
    this.performanceHistory = [];
    this.algorithmSelector.clearPerformanceHistory();
  }

  /**
   * Destroy the adapter and clean up resources
   */
  destroy(): void {
    this.memoryPool.destroy();
    this.performanceHistory = [];
  }
}

// Re-export types for convenience
export type { MemoryPoolConfig, MemoryPoolStats, OptimizationRecommendation } from '../core/enhanced-memory-pool';
