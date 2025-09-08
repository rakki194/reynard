/**
 * Optimized Algorithms API
 * 
 * This module provides the unified, performance-optimized API for the algorithms package.
 * It automatically selects optimal algorithms based on workload characteristics and
 * integrates memory pooling for maximum performance.
 * 
 * @module algorithms/optimized
 */

import { OptimizedCollisionAdapter, type OptimizedCollisionConfig } from './optimization/adapters/optimized-collision-adapter';
import { AlgorithmSelector, type WorkloadCharacteristics } from './optimization/core/algorithm-selector';
import { EnhancedMemoryPool, type MemoryPoolConfig } from './optimization/core/enhanced-memory-pool';
import type { AABB, CollisionPair } from './geometry/collision/aabb-types';

// Global optimization configuration
let globalOptimizationConfig: OptimizedCollisionConfig = {
  enableMemoryPooling: true,
  enableAlgorithmSelection: true,
  enablePerformanceMonitoring: true,
  algorithmSelectionStrategy: 'adaptive',
  performanceThresholds: {
    maxExecutionTime: 16, // 16ms for 60fps
    maxMemoryUsage: 50 * 1024 * 1024, // 50MB
    minHitRate: 90
  }
};

// Global instances
let globalCollisionAdapter: OptimizedCollisionAdapter | null = null;
let globalMemoryPool: EnhancedMemoryPool | null = null;
let globalAlgorithmSelector: AlgorithmSelector | null = null;

/**
 * Configure the global optimization settings
 */
export function configureOptimization(config: Partial<OptimizedCollisionConfig>): void {
  globalOptimizationConfig = { ...globalOptimizationConfig, ...config };
  
  // Reinitialize global instances if they exist
  if (globalCollisionAdapter) {
    globalCollisionAdapter.destroy();
    globalCollisionAdapter = new OptimizedCollisionAdapter(globalOptimizationConfig);
  }
}

/**
 * Get the global collision adapter instance
 */
function getGlobalCollisionAdapter(): OptimizedCollisionAdapter {
  if (!globalCollisionAdapter) {
    globalCollisionAdapter = new OptimizedCollisionAdapter(globalOptimizationConfig);
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
  spatialObjects: Array<{ aabb: AABB; data: any }>
): Array<{ aabb: AABB; data: any }> {
  // This would be implemented with the spatial query adapter
  // For now, return a simple implementation
  const nearby: Array<{ aabb: AABB; data: any }> = [];
  
  for (const obj of spatialObjects) {
    if (checkCollision(queryAABB, obj.aabb)) {
      nearby.push(obj);
    }
  }
  
  return nearby;
}

/**
 * Find connected components using optimized Union-Find
 * 
 * @param collisionPairs Array of collision pairs
 * @param objectCount Total number of objects
 * @returns Array of connected component arrays
 */
export function findConnectedComponents(
  collisionPairs: CollisionPair[],
  objectCount: number
): number[][] {
  // This would use the optimized Union-Find adapter
  // For now, return a simple implementation
  const components: number[][] = [];
  const visited = new Set<number>();
  
  for (let i = 0; i < objectCount; i++) {
    if (!visited.has(i)) {
      const component: number[] = [];
      const stack = [i];
      
      while (stack.length > 0) {
        const current = stack.pop()!;
        if (!visited.has(current)) {
          visited.add(current);
          component.push(current);
          
          // Find connected objects
          for (const pair of collisionPairs) {
            if (pair.a === current && !visited.has(pair.b)) {
              stack.push(pair.b);
            } else if (pair.b === current && !visited.has(pair.a)) {
              stack.push(pair.a);
            }
          }
        }
      }
      
      components.push(component);
    }
  }
  
  return components;
}

/**
 * Basic collision detection between two AABBs
 * 
 * @param a First AABB
 * @param b Second AABB
 * @returns True if the AABBs collide
 */
export function checkCollision(a: AABB, b: AABB): boolean {
  return !(a.x + a.width <= b.x || b.x + b.width <= a.x ||
           a.y + a.height <= b.y || b.y + b.height <= a.y);
}

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
  setAlgorithmStrategy(strategy: 'naive' | 'spatial' | 'optimized' | 'adaptive'): void {
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
        ...thresholds
      }
    });
  }
}

/**
 * Algorithm selector for advanced usage
 */
export class AlgorithmSelector {
  private selector: AlgorithmSelector;

  constructor() {
    this.selector = getGlobalAlgorithmSelector();
  }

  /**
   * Select optimal collision detection algorithm
   */
  selectCollisionAlgorithm(workload: WorkloadCharacteristics) {
    return this.selector.selectCollisionAlgorithm(workload);
  }

  /**
   * Select optimal spatial algorithm
   */
  selectSpatialAlgorithm(workload: WorkloadCharacteristics) {
    return this.selector.selectSpatialAlgorithm(workload);
  }

  /**
   * Select optimal Union-Find algorithm
   */
  selectUnionFindAlgorithm(workload: WorkloadCharacteristics) {
    return this.selector.selectUnionFindAlgorithm(workload);
  }

  /**
   * Get selection statistics
   */
  getSelectionStats() {
    return this.selector.getSelectionStats();
  }

  /**
   * Get performance history
   */
  getPerformanceHistory() {
    return this.selector.getPerformanceHistory();
  }

  /**
   * Clear performance history
   */
  clearPerformanceHistory(): void {
    this.selector.clearPerformanceHistory();
  }
}

/**
 * Memory pool management
 */
export class MemoryPool {
  private pool: EnhancedMemoryPool;

  constructor(config?: Partial<MemoryPoolConfig>) {
    this.pool = new EnhancedMemoryPool(config);
  }

  /**
   * Get memory pool statistics
   */
  getStatistics() {
    return this.pool.getStatistics();
  }

  /**
   * Get pool information
   */
  getPoolInfo() {
    return this.pool.getPoolInfo();
  }

  /**
   * Get optimization recommendations
   */
  getOptimizationRecommendations() {
    return this.pool.getOptimizationRecommendations();
  }

  /**
   * Optimize for specific workload
   */
  optimizeForWorkload(workload: {
    objectCount: number;
    spatialDensity: number;
    updateFrequency: number;
  }): void {
    this.pool.optimizeForWorkload(workload);
  }

  /**
   * Destroy the memory pool
   */
  destroy(): void {
    this.pool.destroy();
  }
}

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

// Export types for convenience
export type { OptimizedCollisionConfig, CollisionPerformanceStats } from './optimization/adapters/optimized-collision-adapter';
export type { WorkloadCharacteristics, AlgorithmSelection } from './optimization/core/algorithm-selector';
export type { MemoryPoolConfig, MemoryPoolStats, OptimizationRecommendation } from './optimization/core/enhanced-memory-pool';
