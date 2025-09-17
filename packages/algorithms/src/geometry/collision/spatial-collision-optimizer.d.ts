/**
 * Spatial Collision Optimizer
 *
 * Advanced collision detection system that uses spatial partitioning
 * to optimize collision queries and reduce computational complexity
 * from O(n²) to O(n) average case.
 *
 * @module algorithms/geometry/collision/spatialCollisionOptimizer
 */
import type { AABB } from "./aabb-types";
import { type CollisionPair } from "./collision-detection-core";
import { type SpatialCollisionConfig, type SpatialCollisionStats } from "./spatial-collision-stats";
export type { AABB, CollisionResult } from "./aabb-types";
export type { SpatialCollisionConfig, SpatialCollisionStats, } from "./spatial-collision-stats";
export declare class SpatialCollisionOptimizer {
    private spatialHash;
    private config;
    private collisionCache;
    private stats;
    constructor(config?: Partial<SpatialCollisionConfig>);
    /**
     * Detect collisions using spatial optimization
     */
    detectCollisions(aabbs: AABB[]): CollisionPair[];
    /**
     * Naive O(n²) collision detection for small datasets
     */
    private naiveCollisionDetection;
    /**
     * Spatial hash optimized collision detection
     */
    private spatialCollisionDetection;
    /**
     * Get performance statistics
     */
    getStats(): SpatialCollisionStats;
    /**
     * Clear collision cache
     */
    clearCache(): void;
    /**
     * Update configuration
     */
    updateConfig(newConfig: Partial<SpatialCollisionConfig>): void;
}
