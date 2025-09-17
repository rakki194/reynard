/**
 * Optimized Algorithms API
 *
 * This module provides the unified, performance-optimized API for the algorithms package.
 * It automatically selects optimal algorithms based on workload characteristics and
 * integrates memory pooling for maximum performance.
 *
 * @module algorithms/optimized
 */
import type { SpatialDataType } from "./types/spatial-types";
import { type OptimizedCollisionConfig } from "./optimization/adapters/optimized-collision-adapter";
import type { AABB, CollisionPair } from "./geometry/collision/aabb-types";
/**
 * Configure the global optimization settings
 */
export declare function configureOptimization(config: Partial<OptimizedCollisionConfig>): void;
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
export declare function detectCollisions(aabbs: AABB[]): CollisionPair[];
/**
 * Perform spatial query with optimization
 *
 * @param queryAABB The AABB to query against
 * @param spatialObjects Array of spatial objects
 * @returns Array of nearby objects
 */
export declare function performSpatialQuery<T extends SpatialDataType>(queryAABB: AABB, spatialObjects: Array<{
    aabb: AABB;
    data: T;
}>): Array<{
    aabb: AABB;
    data: T;
}>;
/**
 * Performance monitoring and optimization
 */
export declare class PerformanceMonitor {
    private adapter;
    constructor();
    /**
     * Get current performance statistics
     */
    getPerformanceStats(): import("./optimization").CollisionPerformanceStats;
    /**
     * Get memory pool statistics
     */
    getMemoryPoolStats(): import("./optimization").MemoryPoolStats;
    /**
     * Get optimization recommendations
     */
    getOptimizationRecommendations(): import("./optimization").OptimizationRecommendation[];
    /**
     * Check if performance is degraded
     */
    isPerformanceDegraded(): boolean;
    /**
     * Get comprehensive performance report
     */
    getPerformanceReport(): import("./optimization/adapters").PerformanceReport;
    /**
     * Reset performance statistics
     */
    resetStatistics(): void;
}
/**
 * Optimization configuration management
 */
export declare class OptimizationConfig {
    private config;
    constructor(config?: Partial<OptimizedCollisionConfig>);
    /**
     * Update configuration
     */
    update(config: Partial<OptimizedCollisionConfig>): void;
    /**
     * Get current configuration
     */
    getConfig(): OptimizedCollisionConfig;
    /**
     * Enable memory pooling
     */
    enableMemoryPooling(): void;
    /**
     * Disable memory pooling
     */
    disableMemoryPooling(): void;
    /**
     * Enable algorithm selection
     */
    enableAlgorithmSelection(): void;
    /**
     * Disable algorithm selection
     */
    disableAlgorithmSelection(): void;
    /**
     * Set algorithm selection strategy
     */
    setAlgorithmStrategy(strategy: "naive" | "spatial" | "optimized" | "adaptive"): void;
    /**
     * Set performance thresholds
     */
    setPerformanceThresholds(thresholds: {
        maxExecutionTime?: number;
        maxMemoryUsage?: number;
        minHitRate?: number;
    }): void;
}
/**
 * Cleanup function to destroy global instances
 */
export declare function cleanup(): void;
