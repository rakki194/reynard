/**
 * Optimized Algorithms API
 *
 * This module provides the unified, performance-optimized API for the algorithms package.
 * It automatically selects optimal algorithms based on workload characteristics and
 * integrates memory pooling for maximum performance.
 *
 * @module algorithms/optimized
 */

import {
  OptimizedCollisionAdapter,
  type OptimizedCollisionConfig,
} from "./optimization/adapters/optimized-collision-adapter";
import {
  AlgorithmSelector,
  type WorkloadCharacteristics,
} from "./optimization/core/algorithm-selector";
import {
  EnhancedMemoryPool,
  type MemoryPoolConfig,
} from "./optimization/core/enhanced-memory-pool";
import { checkCollision } from "./geometry/collision/aabb-collision";
import type { AABB, CollisionPair } from "./geometry/collision/aabb-types";

// Global optimization configuration
let globalOptimizationConfig: OptimizedCollisionConfig = {
  enableMemoryPooling: true,
  enableAlgorithmSelection: true,
  enablePerformanceMonitoring: true,
  algorithmSelectionStrategy: "adaptive",
  performanceThresholds: {
    maxExecutionTime: 16, // 16ms for 60fps
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    minHitRate: 90,
  },
};

// Global instances
let globalCollisionAdapter: OptimizedCollisionAdapter | null = null;
let globalMemoryPool: EnhancedMemoryPool | null = null;
let globalAlgorithmSelector: AlgorithmSelector | null = null;

/**
 * Configure the global optimization settings
 */
export function configureOptimization(
  config: Partial<OptimizedCollisionConfig>,
): void {
  globalOptimizationConfig = { ...globalOptimizationConfig, ...config };

  // Reinitialize global instances if they exist
  if (globalCollisionAdapter) {
    globalCollisionAdapter.destroy();
    globalCollisionAdapter = new OptimizedCollisionAdapter(
      globalOptimizationConfig,
    );
  }
}

/**
 * Get the global collision adapter instance
 */
function getGlobalCollisionAdapter(): OptimizedCollisionAdapter {
  if (!globalCollisionAdapter) {
    globalCollisionAdapter = new OptimizedCollisionAdapter(
      globalOptimizationConfig,
    );
  }
  return globalCollisionAdapter;
}

/**
 * Get the global memory pool instance
 */
function getGlobalMemoryPool(): EnhancedMemoryPool {
  if (!globalMemoryPool) {
    globalMemoryPool = new EnhancedMemoryPool();
  }
  return globalMemoryPool;
}

/**
 * Get the global algorithm selector instance
 */
function getGlobalAlgorithmSelector(): AlgorithmSelector {
  if (!globalAlgorithmSelector) {
    globalAlgorithmSelector = new AlgorithmSelector();
  }
  return globalAlgorithmSelector;
}

/**
 * Detect collisions with automatic algorithm selection and optimization
 *
 * This is the main entry point for collision detection. It automatically:
 * - Analyzes workload characteristics
 * - Selects the optimal algorithm (naive, spatial, or optimized)
 * - Uses memory pooling to eliminate allocation overhead
 * - Monitors performance and adapts as needed
 *
 * @param aabbs Array of AABB objects to check for collisions
 * @returns Array of collision pairs
 *
 * @example
 * ```typescript
 * import { detectCollisions } from 'reynard-algorithms';
 *
 * const aabbs = [
 *   { x: 0, y: 0, width: 100, height: 100 },
 *   { x: 50, y: 50, width: 100, height: 100 }
 * ];
 *
 * const collisions = detectCollisions(aabbs);
 * console.log(`Found ${collisions.length} collisions`);
 * ```
 */
export function detectCollisions(aabbs: AABB[]): CollisionPair[] {
  const adapter = getGlobalCollisionAdapter();
  return adapter.detectCollisions(aabbs);
}

/**
 * Perform spatial query with optimization
 *
 * @param queryAABB The AABB to query against
 * @param spatialObjects Array of spatial objects
 * @returns Array of nearby objects
 */
export function performSpatialQuery(
  queryAABB: AABB,
  spatialObjects: Array<{ aabb: AABB; data: any }>,
): Array<{ aabb: AABB; data: any }> {
  // This would be implemented with the spatial query adapter
  // For now, return a simple implementation
  const nearby: Array<{ aabb: AABB; data: any }> = [];

  for (const obj of spatialObjects) {
    if (checkCollision(queryAABB, obj.aabb).colliding) {
      nearby.push(obj);
    }
  }

  return nearby;
}

// findConnectedComponents is exported from the union-find module

// checkCollision is exported from the geometry module

/**
 * Performance monitoring and optimization
 */
export class PerformanceMonitor {
  private adapter: OptimizedCollisionAdapter;

  constructor() {
    this.adapter = getGlobalCollisionAdapter();
  }

  /**
   * Get current performance statistics
   */
  getPerformanceStats() {
    return this.adapter.getPerformanceStats();
  }

  /**
   * Get memory pool statistics
   */
  getMemoryPoolStats() {
    return this.adapter.getMemoryPoolStats();
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations() {
    return this.adapter.getOptimizationRecommendations();
  }

  /**
   * Check if performance is degraded
   */
  isPerformanceDegraded(): boolean {
    return this.adapter.isPerformanceDegraded();
  }

  /**
   * Get comprehensive performance report
   */
  getPerformanceReport() {
    return this.adapter.getPerformanceReport();
  }

  /**
   * Reset performance statistics
   */
  resetStatistics(): void {
    this.adapter.resetStatistics();
  }
}

/**
 * Optimization configuration management
 */
export class OptimizationConfig {
  private config: OptimizedCollisionConfig;

  constructor(config: Partial<OptimizedCollisionConfig> = {}) {
    this.config = { ...globalOptimizationConfig, ...config };
  }

  /**
   * Update configuration
   */
  update(config: Partial<OptimizedCollisionConfig>): void {
    this.config = { ...this.config, ...config };
    configureOptimization(this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): OptimizedCollisionConfig {
    return { ...this.config };
  }

  /**
   * Enable memory pooling
   */
  enableMemoryPooling(): void {
    this.update({ enableMemoryPooling: true });
  }

  /**
   * Disable memory pooling
   */
  disableMemoryPooling(): void {
    this.update({ enableMemoryPooling: false });
  }

  /**
   * Enable algorithm selection
   */
  enableAlgorithmSelection(): void {
    this.update({ enableAlgorithmSelection: true });
  }

  /**
   * Disable algorithm selection
   */
  disableAlgorithmSelection(): void {
    this.update({ enableAlgorithmSelection: false });
  }

  /**
   * Set algorithm selection strategy
   */
  setAlgorithmStrategy(
    strategy: "naive" | "spatial" | "optimized" | "adaptive",
  ): void {
    this.update({ algorithmSelectionStrategy: strategy });
  }

  /**
   * Set performance thresholds
   */
  setPerformanceThresholds(thresholds: {
    maxExecutionTime?: number;
    maxMemoryUsage?: number;
    minHitRate?: number;
  }): void {
    this.update({
      performanceThresholds: {
        ...this.config.performanceThresholds,
        ...thresholds,
      },
    });
  }
}

// AlgorithmSelector is exported from the optimization module

// MemoryPool is exported from the optimization module

/**
 * Cleanup function to destroy global instances
 */
export function cleanup(): void {
  if (globalCollisionAdapter) {
    globalCollisionAdapter.destroy();
    globalCollisionAdapter = null;
  }

  if (globalMemoryPool) {
    globalMemoryPool.destroy();
    globalMemoryPool = null;
  }

  if (globalAlgorithmSelector) {
    globalAlgorithmSelector.clearPerformanceHistory();
    globalAlgorithmSelector = null;
  }
}

// Note: Types are exported from the optimization module to avoid conflicts
