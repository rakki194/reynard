/**
 * Enhanced PAW Benchmark Suite with Memory Pool Optimization Testing
 *
 * This enhanced benchmark suite tests the memory pool optimizations and provides
 * detailed micro-benchmarks for allocation overhead analysis.
 *
 * @module paw-enhanced-benchmark-suite
 */

import {
  OptimizedSpatialCollisionDetector,
  createOptimizedCollisionDetector,
} from "../../../packages/algorithms/src/optimization/optimized-spatial-collision";
import { SpatialCollisionOptimizer } from "../../../packages/algorithms/src/geometry/collision/spatial-collision-optimizer";
import { globalPAWMemoryPool } from "../../../packages/algorithms/src/optimization/memory-pool";
import type {
  AABB,
  CollisionResult,
} from "../../../packages/algorithms/src/geometry/collision/aabb-types";

export interface EnhancedBenchmarkConfig {
  iterations: number;
  warmupRounds: number;
  objectCounts: number[];
  overlapDensities: number[];
  spatialConfigs: {
    cellSize: number;
    maxObjectsPerCell: number;
  }[];
  enableMemoryProfiling: boolean;
  enableMicroBenchmarks: boolean;
  enableAllocationTracking: boolean;
}

export interface EnhancedBenchmarkResult {
  algorithm: string;
  objectCount: number;
  overlapDensity: number;
  config?: any;
  metrics: {
    meanTime: number;
    medianTime: number;
    p95Time: number;
    p99Time: number;
    minTime: number;
    maxTime: number;
    standardDeviation: number;
    memoryUsage: number;
    collisionCount: number;
    // Enhanced metrics
    allocationTime: number;
    memoryPoolHits: number;
    memoryPoolMisses: number;
    cacheHits: number;
    cacheMisses: number;
    garbageCollectionTime: number;
    peakMemoryUsage: number;
  };
  iterations: number;
  memoryPoolInfo?: any;
}

export interface MicroBenchmarkResult {
  testName: string;
  baselineTime: number;
  optimizedTime: number;
  improvement: number;
  improvementPercentage: number;
  memorySavings: number;
}

export class EnhancedPAWBenchmarkSuite {
  private config: EnhancedBenchmarkConfig;
  private results: EnhancedBenchmarkResult[] = [];
  private microBenchmarks: MicroBenchmarkResult[] = [];

  constructor(config: Partial<EnhancedBenchmarkConfig> = {}) {
    this.config = {
      iterations: 1000,
      warmupRounds: 100,
      objectCounts: [10, 25, 50, 100, 200, 500],
      overlapDensities: [0.1, 0.3, 0.5, 0.7, 0.9],
      spatialConfigs: [
        { cellSize: 50, maxObjectsPerCell: 25 },
        { cellSize: 100, maxObjectsPerCell: 50 },
        { cellSize: 200, maxObjectsPerCell: 100 },
      ],
      enableMemoryProfiling: true,
      enableMicroBenchmarks: true,
      enableAllocationTracking: true,
      ...config,
    };
  }

  /**
   * Generate test data with controlled overlap density
   */
  private generateTestData(
    objectCount: number,
    overlapDensity: number,
  ): AABB[] {
    const aabbs: AABB[] = [];
    const baseSize = 50;
    const maxSize = 150;

    for (let i = 0; i < objectCount; i++) {
      const size = baseSize + Math.random() * (maxSize - baseSize);
      let x, y;
      let attempts = 0;

      do {
        x = Math.random() * (800 - size);
        y = Math.random() * (600 - size);
        attempts++;
      } while (
        attempts < 100 &&
        this.shouldOverlap(overlapDensity) &&
        this.hasOverlap(aabbs, { x, y, width: size, height: size })
      );

      aabbs.push({
        x,
        y,
        width: size,
        height: size,
      });
    }

    return aabbs;
  }

  private shouldOverlap(overlapDensity: number): boolean {
    return Math.random() < overlapDensity;
  }

  private hasOverlap(existing: AABB[], newBox: AABB): boolean {
    return existing.some((box) => this.checkCollision(box, newBox));
  }

  private checkCollision(a: AABB, b: AABB): boolean {
    return !(
      a.x + a.width <= b.x ||
      b.x + b.width <= a.x ||
      a.y + a.height <= b.y ||
      b.y + b.height <= a.y
    );
  }

  /**
   * Benchmark original PAW Spatial Collision Optimizer
   */
  private benchmarkOriginalPAW(
    aabbs: AABB[],
    config: any,
  ): EnhancedBenchmarkResult {
    const optimizer = new SpatialCollisionOptimizer({
      cellSize: config.cellSize,
      maxObjectsPerCell: config.maxObjectsPerCell,
      enableCaching: true,
      cacheSize: 1000,
      hybridThreshold: 100,
    });

    const times: number[] = [];
    const allocationTimes: number[] = [];
    let collisionCount = 0;
    let memoryStart: number;
    let memoryEnd: number;
    let peakMemory = 0;

    // Warmup
    for (let i = 0; i < this.config.warmupRounds; i++) {
      optimizer.detectCollisions(aabbs);
    }

    // Benchmark
    for (let i = 0; i < this.config.iterations; i++) {
      if (i === 0) {
        memoryStart = (performance as any).memory?.usedJSHeapSize || 0;
      }

      const start = performance.now();
      const allocationStart = performance.now();
      const collisions = optimizer.detectCollisions(aabbs);
      const allocationEnd = performance.now();
      const end = performance.now();

      collisionCount = collisions.length;
      times.push(end - start);
      allocationTimes.push(allocationEnd - allocationStart);

      // Track peak memory
      const currentMemory = (performance as any).memory?.usedJSHeapSize || 0;
      peakMemory = Math.max(peakMemory, currentMemory);

      if (i === this.config.iterations - 1) {
        memoryEnd = currentMemory;
      }
    }

    return this.calculateEnhancedMetrics(
      "PAW-Original",
      times,
      allocationTimes,
      collisionCount,
      memoryEnd - memoryStart,
      peakMemory,
      config,
    );
  }

  /**
   * Benchmark optimized PAW with memory pooling
   */
  private benchmarkOptimizedPAW(
    aabbs: AABB[],
    config: any,
  ): EnhancedBenchmarkResult {
    const optimizer = createOptimizedCollisionDetector({
      cellSize: config.cellSize,
      maxObjectsPerCell: config.maxObjectsPerCell,
      enableCaching: true,
      cacheSize: 1000,
      hybridThreshold: 100,
      useMemoryPool: true,
    });

    const times: number[] = [];
    const allocationTimes: number[] = [];
    let collisionCount = 0;
    let memoryStart: number;
    let memoryEnd: number;
    let peakMemory = 0;

    // Warmup
    for (let i = 0; i < this.config.warmupRounds; i++) {
      optimizer.detectCollisions(aabbs);
    }

    // Benchmark
    for (let i = 0; i < this.config.iterations; i++) {
      if (i === 0) {
        memoryStart = (performance as any).memory?.usedJSHeapSize || 0;
      }

      const start = performance.now();
      const allocationStart = performance.now();
      const collisions = optimizer.detectCollisions(aabbs);
      const allocationEnd = performance.now();
      const end = performance.now();

      collisionCount = collisions.length;
      times.push(end - start);
      allocationTimes.push(allocationEnd - allocationStart);

      // Track peak memory
      const currentMemory = (performance as any).memory?.usedJSHeapSize || 0;
      peakMemory = Math.max(peakMemory, currentMemory);

      if (i === this.config.iterations - 1) {
        memoryEnd = currentMemory;
      }
    }

    const result = this.calculateEnhancedMetrics(
      "PAW-Optimized",
      times,
      allocationTimes,
      collisionCount,
      memoryEnd - memoryStart,
      peakMemory,
      config,
    );

    // Add memory pool information
    result.memoryPoolInfo = optimizer.getMemoryPoolInfo();
    const stats = optimizer.getStatistics();
    result.metrics.memoryPoolHits = stats.memoryPoolHits;
    result.metrics.memoryPoolMisses = stats.memoryPoolMisses;
    result.metrics.cacheHits = stats.cacheHits;
    result.metrics.cacheMisses = stats.cacheMisses;

    return result;
  }

  /**
   * Calculate enhanced statistical metrics
   */
  private calculateEnhancedMetrics(
    algorithm: string,
    times: number[],
    allocationTimes: number[],
    collisionCount: number,
    memoryUsage: number,
    peakMemory: number,
    config?: any,
  ): EnhancedBenchmarkResult {
    const sortedTimes = [...times].sort((a, b) => a - b);
    const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
    const variance =
      times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) /
      times.length;
    const standardDeviation = Math.sqrt(variance);

    const meanAllocationTime =
      allocationTimes.reduce((sum, time) => sum + time, 0) /
      allocationTimes.length;

    return {
      algorithm,
      objectCount: 0, // Will be set by caller
      overlapDensity: 0, // Will be set by caller
      config,
      metrics: {
        meanTime: mean,
        medianTime: sortedTimes[Math.floor(sortedTimes.length / 2)],
        p95Time: sortedTimes[Math.floor(sortedTimes.length * 0.95)],
        p99Time: sortedTimes[Math.floor(sortedTimes.length * 0.99)],
        minTime: sortedTimes[0],
        maxTime: sortedTimes[sortedTimes.length - 1],
        standardDeviation,
        memoryUsage,
        collisionCount,
        allocationTime: meanAllocationTime,
        memoryPoolHits: 0,
        memoryPoolMisses: 0,
        cacheHits: 0,
        cacheMisses: 0,
        garbageCollectionTime: 0, // Would need GC API access
        peakMemoryUsage: peakMemory,
      },
      iterations: times.length,
    };
  }

  /**
   * Run micro-benchmarks for specific optimizations
   */
  private runMicroBenchmarks(): void {
    if (!this.config.enableMicroBenchmarks) return;

    console.log("🦦> Running micro-benchmarks...");

    // Test 1: Memory allocation overhead
    this.benchmarkMemoryAllocation();

    // Test 2: Spatial hash rebuild overhead
    this.benchmarkSpatialHashRebuild();

    // Test 3: Cache effectiveness
    this.benchmarkCacheEffectiveness();

    // Test 4: Pool hit rate analysis
    this.benchmarkPoolHitRate();
  }

  /**
   * Benchmark memory allocation overhead
   */
  private benchmarkMemoryAllocation(): void {
    const testData = this.generateTestData(100, 0.5);
    const iterations = 1000;

    // Original approach (with allocations)
    const originalTimes: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const optimizer = new SpatialCollisionOptimizer();
      optimizer.detectCollisions(testData);
      const end = performance.now();
      originalTimes.push(end - start);
    }

    // Optimized approach (with memory pooling)
    const optimizedTimes: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      const optimizer = createOptimizedCollisionDetector();
      optimizer.detectCollisions(testData);
      const end = performance.now();
      optimizedTimes.push(end - start);
    }

    const originalMean =
      originalTimes.reduce((sum, time) => sum + time, 0) / originalTimes.length;
    const optimizedMean =
      optimizedTimes.reduce((sum, time) => sum + time, 0) /
      optimizedTimes.length;
    const improvement = originalMean - optimizedMean;
    const improvementPercentage = (improvement / originalMean) * 100;

    this.microBenchmarks.push({
      testName: "Memory Allocation Overhead",
      baselineTime: originalMean,
      optimizedTime: optimizedMean,
      improvement,
      improvementPercentage,
      memorySavings: 0, // Would need detailed memory tracking
    });
  }

  /**
   * Benchmark spatial hash rebuild overhead
   */
  private benchmarkSpatialHashRebuild(): void {
    // This would test incremental vs full rebuild approaches
    // Implementation would depend on incremental spatial hash implementation
    console.log("🦦> Spatial hash rebuild benchmark (placeholder)");
  }

  /**
   * Benchmark cache effectiveness
   */
  private benchmarkCacheEffectiveness(): void {
    const testData = this.generateTestData(50, 0.3);
    const iterations = 1000;

    // Test with caching disabled
    const noCacheTimes: number[] = [];
    const noCacheOptimizer = createOptimizedCollisionDetector({
      enableCaching: false,
    });
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      noCacheOptimizer.detectCollisions(testData);
      const end = performance.now();
      noCacheTimes.push(end - start);
    }

    // Test with caching enabled
    const cacheTimes: number[] = [];
    const cacheOptimizer = createOptimizedCollisionDetector({
      enableCaching: true,
    });
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      cacheOptimizer.detectCollisions(testData);
      const end = performance.now();
      cacheTimes.push(end - start);
    }

    const noCacheMean =
      noCacheTimes.reduce((sum, time) => sum + time, 0) / noCacheTimes.length;
    const cacheMean =
      cacheTimes.reduce((sum, time) => sum + time, 0) / cacheTimes.length;
    const improvement = noCacheMean - cacheMean;
    const improvementPercentage = (improvement / noCacheMean) * 100;

    this.microBenchmarks.push({
      testName: "Cache Effectiveness",
      baselineTime: noCacheMean,
      optimizedTime: cacheMean,
      improvement,
      improvementPercentage,
      memorySavings: 0,
    });
  }

  /**
   * Benchmark pool hit rate analysis
   */
  private benchmarkPoolHitRate(): void {
    const testData = this.generateTestData(100, 0.5);
    const iterations = 1000;

    const optimizer = createOptimizedCollisionDetector();

    // Run multiple iterations to build up pool hit rate
    for (let i = 0; i < iterations; i++) {
      optimizer.detectCollisions(testData);
    }

    const stats = optimizer.getStatistics();
    const hitRate =
      (stats.memoryPoolHits / (stats.memoryPoolHits + stats.memoryPoolMisses)) *
      100;

    console.log(`🦦> Memory pool hit rate: ${hitRate.toFixed(2)}%`);
  }

  /**
   * Run comprehensive enhanced benchmark suite
   */
  async runEnhancedBenchmarks(): Promise<EnhancedBenchmarkResult[]> {
    console.log("🦊> Starting Enhanced PAW Algorithm Benchmark Suite...");

    // Run micro-benchmarks first
    this.runMicroBenchmarks();

    for (const objectCount of this.config.objectCounts) {
      for (const overlapDensity of this.config.overlapDensities) {
        console.log(
          `\n🦦> Benchmarking ${objectCount} objects with ${(overlapDensity * 100).toFixed(0)}% overlap density`,
        );

        const testData = this.generateTestData(objectCount, overlapDensity);

        // Benchmark original PAW with different configurations
        for (const spatialConfig of this.config.spatialConfigs) {
          const originalResult = this.benchmarkOriginalPAW(
            testData,
            spatialConfig,
          );
          originalResult.objectCount = objectCount;
          originalResult.overlapDensity = overlapDensity;
          this.results.push(originalResult);

          const optimizedResult = this.benchmarkOptimizedPAW(
            testData,
            spatialConfig,
          );
          optimizedResult.objectCount = objectCount;
          optimizedResult.overlapDensity = overlapDensity;
          this.results.push(optimizedResult);
        }
      }
    }

    console.log("🐺> Enhanced benchmark suite completed!");
    return this.results;
  }

  /**
   * Generate enhanced comparison analysis
   */
  generateEnhancedComparison(): {
    performanceComparison: any[];
    memoryComparison: any[];
    microBenchmarkResults: MicroBenchmarkResult[];
  } {
    const performanceComparison: any[] = [];
    const memoryComparison: any[] = [];

    // Group results by object count and overlap density
    const groupedResults = new Map<string, EnhancedBenchmarkResult[]>();

    for (const result of this.results) {
      const key = `${result.objectCount}-${result.overlapDensity}`;
      if (!groupedResults.has(key)) {
        groupedResults.set(key, []);
      }
      groupedResults.get(key)!.push(result);
    }

    // Generate comparisons
    for (const [key, results] of groupedResults) {
      const originalResults = results.filter(
        (r) => r.algorithm === "PAW-Original",
      );
      const optimizedResults = results.filter(
        (r) => r.algorithm === "PAW-Optimized",
      );

      for (const original of originalResults) {
        const optimized = optimizedResults.find(
          (o) => o.config?.cellSize === original.config?.cellSize,
        );

        if (optimized) {
          const timeImprovement =
            ((original.metrics.meanTime - optimized.metrics.meanTime) /
              original.metrics.meanTime) *
            100;
          const memoryImprovement =
            ((original.metrics.memoryUsage - optimized.metrics.memoryUsage) /
              original.metrics.memoryUsage) *
            100;
          const allocationImprovement =
            ((original.metrics.allocationTime -
              optimized.metrics.allocationTime) /
              original.metrics.allocationTime) *
            100;

          performanceComparison.push({
            objectCount: original.objectCount,
            overlapDensity: original.overlapDensity,
            cellSize: original.config?.cellSize,
            timeImprovement,
            memoryImprovement,
            allocationImprovement,
            original: original.metrics,
            optimized: optimized.metrics,
          });

          memoryComparison.push({
            objectCount: original.objectCount,
            overlapDensity: original.overlapDensity,
            cellSize: original.config?.cellSize,
            memoryPoolHits: optimized.metrics.memoryPoolHits,
            memoryPoolMisses: optimized.metrics.memoryPoolMisses,
            cacheHits: optimized.metrics.cacheHits,
            cacheMisses: optimized.metrics.cacheMisses,
            peakMemoryReduction:
              original.metrics.peakMemoryUsage -
              optimized.metrics.peakMemoryUsage,
          });
        }
      }
    }

    return {
      performanceComparison,
      memoryComparison,
      microBenchmarkResults: this.microBenchmarks,
    };
  }

  /**
   * Export enhanced results to JSON
   */
  exportEnhancedResults(): string {
    return JSON.stringify(
      {
        config: this.config,
        results: this.results,
        comparisons: this.generateEnhancedComparison(),
        memoryPoolInfo: globalPAWMemoryPool.getPoolInfo(),
        memoryPoolStats: globalPAWMemoryPool.getStatistics(),
        timestamp: new Date().toISOString(),
      },
      null,
      2,
    );
  }
}
