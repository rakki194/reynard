/**
 * PAW (Perfect Algorithmic World) Benchmark Suite
 * 
 * Comprehensive benchmarking system for comparing spatial algorithms
 * against the original NEXUS implementation.
 * 
 * @module paw-benchmark-suite
 */

import { SpatialCollisionOptimizer } from '../../../packages/algorithms/src/geometry/collision/spatial-collision-optimizer';
import { UnionFind } from '../../../packages/algorithms/src/union-find/union-find-core';
import { BatchUnionFind } from '../../../packages/algorithms/src/union-find/union-find-batch-operations';
import { SpatialHash } from '../../../packages/algorithms/src/spatial-hash/spatial-hash-core';
import type { AABB, CollisionResult } from '../../../packages/algorithms/src/geometry/collision/aabb-types';

export interface BenchmarkConfig {
  iterations: number;
  warmupRounds: number;
  objectCounts: number[];
  overlapDensities: number[];
  spatialConfigs: {
    cellSize: number;
    maxObjectsPerCell: number;
  }[];
}

export interface BenchmarkResult {
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
  };
  iterations: number;
}

export interface ComparisonResult {
  baseline: BenchmarkResult;
  optimized: BenchmarkResult;
  improvement: {
    timeImprovement: number;
    memoryImprovement: number;
    throughputImprovement: number;
  };
}

export class PAWBenchmarkSuite {
  private config: BenchmarkConfig;
  private results: BenchmarkResult[] = [];

  constructor(config: Partial<BenchmarkConfig> = {}) {
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
      ...config,
    };
  }

  /**
   * Generate test data with controlled overlap density
   */
  private generateTestData(objectCount: number, overlapDensity: number): AABB[] {
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
      } while (attempts < 100 && this.shouldOverlap(overlapDensity) && 
               this.hasOverlap(aabbs, { x, y, width: size, height: size }));
      
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
    return existing.some(box => this.checkCollision(box, newBox));
  }

  private checkCollision(a: AABB, b: AABB): boolean {
    return !(a.x + a.width <= b.x || b.x + b.width <= a.x ||
             a.y + a.height <= b.y || b.y + b.height <= a.y);
  }

  /**
   * Benchmark NEXUS-style naive collision detection
   */
  private benchmarkNexusNaive(aabbs: AABB[]): BenchmarkResult {
    const times: number[] = [];
    let collisionCount = 0;
    let memoryStart: number;
    let memoryEnd: number;

    // Warmup
    for (let i = 0; i < this.config.warmupRounds; i++) {
      this.nexusNaiveCollisionDetection(aabbs);
    }

    // Benchmark
    for (let i = 0; i < this.config.iterations; i++) {
      if (i === 0) {
        memoryStart = (performance as any).memory?.usedJSHeapSize || 0;
      }
      
      const start = performance.now();
      collisionCount = this.nexusNaiveCollisionDetection(aabbs);
      const end = performance.now();
      
      times.push(end - start);
      
      if (i === this.config.iterations - 1) {
        memoryEnd = (performance as any).memory?.usedJSHeapSize || 0;
      }
    }

    return this.calculateMetrics('NEXUS-Naive', times, collisionCount, memoryEnd - memoryStart);
  }

  /**
   * Benchmark PAW Spatial Collision Optimizer
   */
  private benchmarkPAWSpatial(aabbs: AABB[], config: any): BenchmarkResult {
    const optimizer = new SpatialCollisionOptimizer({
      cellSize: config.cellSize,
      maxObjectsPerCell: config.maxObjectsPerCell,
      enableCaching: true,
      cacheSize: 1000,
      hybridThreshold: 100,
    });

    const times: number[] = [];
    let collisionCount = 0;
    let memoryStart: number;
    let memoryEnd: number;

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
      const collisions = optimizer.detectCollisions(aabbs);
      const end = performance.now();
      
      collisionCount = collisions.length;
      times.push(end - start);
      
      if (i === this.config.iterations - 1) {
        memoryEnd = (performance as any).memory?.usedJSHeapSize || 0;
      }
    }

    return this.calculateMetrics('PAW-Spatial', times, collisionCount, memoryEnd - memoryStart, config);
  }

  /**
   * Benchmark PAW Union-Find with Batch Operations
   */
  private benchmarkPAWUnionFind(aabbs: AABB[]): BenchmarkResult {
    const times: number[] = [];
    let collisionCount = 0;
    let memoryStart: number;
    let memoryEnd: number;

    // Warmup
    for (let i = 0; i < this.config.warmupRounds; i++) {
      this.pawUnionFindCollisionDetection(aabbs);
    }

    // Benchmark
    for (let i = 0; i < this.config.iterations; i++) {
      if (i === 0) {
        memoryStart = (performance as any).memory?.usedJSHeapSize || 0;
      }
      
      const start = performance.now();
      collisionCount = this.pawUnionFindCollisionDetection(aabbs);
      const end = performance.now();
      
      times.push(end - start);
      
      if (i === this.config.iterations - 1) {
        memoryEnd = (performance as any).memory?.usedJSHeapSize || 0;
      }
    }

    return this.calculateMetrics('PAW-UnionFind', times, collisionCount, memoryEnd - memoryStart);
  }

  /**
   * NEXUS-style naive collision detection implementation
   */
  private nexusNaiveCollisionDetection(aabbs: AABB[]): number {
    let collisionCount = 0;
    
    for (let i = 0; i < aabbs.length; i++) {
      for (let j = i + 1; j < aabbs.length; j++) {
        if (this.checkCollision(aabbs[i], aabbs[j])) {
          collisionCount++;
        }
      }
    }
    
    return collisionCount;
  }

  /**
   * PAW Union-Find collision detection implementation
   */
  private pawUnionFindCollisionDetection(aabbs: AABB[]): number {
    const unionFind = new BatchUnionFind(aabbs.length);
    
    // Find all collisions and union connected components
    for (let i = 0; i < aabbs.length; i++) {
      for (let j = i + 1; j < aabbs.length; j++) {
        if (this.checkCollision(aabbs[i], aabbs[j])) {
          unionFind.union(i, j);
        }
      }
    }
    
    // Count connected components
    const components = unionFind.getAllComponents();
    return components.reduce((total, component) => total + component.length, 0);
  }

  /**
   * Calculate statistical metrics from timing data
   */
  private calculateMetrics(
    algorithm: string, 
    times: number[], 
    collisionCount: number, 
    memoryUsage: number,
    config?: any
  ): BenchmarkResult {
    const sortedTimes = [...times].sort((a, b) => a - b);
    const mean = times.reduce((sum, time) => sum + time, 0) / times.length;
    const variance = times.reduce((sum, time) => sum + Math.pow(time - mean, 2), 0) / times.length;
    const standardDeviation = Math.sqrt(variance);

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
      },
      iterations: times.length,
    };
  }

  /**
   * Run comprehensive benchmark suite
   */
  async runBenchmarks(): Promise<BenchmarkResult[]> {
    console.log('🦊> Starting PAW Algorithm Benchmark Suite...');
    
    for (const objectCount of this.config.objectCounts) {
      for (const overlapDensity of this.config.overlapDensities) {
        console.log(`\n🦦> Benchmarking ${objectCount} objects with ${(overlapDensity * 100).toFixed(0)}% overlap density`);
        
        const testData = this.generateTestData(objectCount, overlapDensity);
        
        // Benchmark NEXUS naive approach
        const nexusResult = this.benchmarkNexusNaive(testData);
        nexusResult.objectCount = objectCount;
        nexusResult.overlapDensity = overlapDensity;
        this.results.push(nexusResult);
        
        // Benchmark PAW Union-Find
        const unionFindResult = this.benchmarkPAWUnionFind(testData);
        unionFindResult.objectCount = objectCount;
        unionFindResult.overlapDensity = overlapDensity;
        this.results.push(unionFindResult);
        
        // Benchmark PAW Spatial with different configurations
        for (const spatialConfig of this.config.spatialConfigs) {
          const spatialResult = this.benchmarkPAWSpatial(testData, spatialConfig);
          spatialResult.objectCount = objectCount;
          spatialResult.overlapDensity = overlapDensity;
          this.results.push(spatialResult);
        }
      }
    }
    
    console.log('🐺> Benchmark suite completed!');
    return this.results;
  }

  /**
   * Generate comparison analysis
   */
  generateComparison(): ComparisonResult[] {
    const comparisons: ComparisonResult[] = [];
    const nexusResults = this.results.filter(r => r.algorithm === 'NEXUS-Naive');
    
    for (const nexusResult of nexusResults) {
      const optimizedResults = this.results.filter(r => 
        r.algorithm !== 'NEXUS-Naive' && 
        r.objectCount === nexusResult.objectCount && 
        r.overlapDensity === nexusResult.overlapDensity
      );
      
      for (const optimizedResult of optimizedResults) {
        const timeImprovement = ((nexusResult.metrics.meanTime - optimizedResult.metrics.meanTime) / nexusResult.metrics.meanTime) * 100;
        const memoryImprovement = ((nexusResult.metrics.memoryUsage - optimizedResult.metrics.memoryUsage) / nexusResult.metrics.memoryUsage) * 100;
        const throughputImprovement = ((optimizedResult.metrics.meanTime / nexusResult.metrics.meanTime) - 1) * 100;
        
        comparisons.push({
          baseline: nexusResult,
          optimized: optimizedResult,
          improvement: {
            timeImprovement,
            memoryImprovement,
            throughputImprovement,
          },
        });
      }
    }
    
    return comparisons;
  }

  /**
   * Export results to JSON
   */
  exportResults(): string {
    return JSON.stringify({
      config: this.config,
      results: this.results,
      comparisons: this.generateComparison(),
      timestamp: new Date().toISOString(),
    }, null, 2);
  }
}
