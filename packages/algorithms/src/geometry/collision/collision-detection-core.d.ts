/**
 * Collision Detection Core
 *
 * Core collision detection algorithms and utilities
 * for the spatial collision optimizer.
 *
 * @module algorithms/geometry/collision/collisionDetectionCore
 */
import type { AABB, CollisionResult } from "./aabb-types";
import type { SpatialHash } from "../../spatial-hash/spatial-hash-core";
import type { CollisionObjectData } from "../../types/spatial-types";
export interface CollisionPair {
    a: number;
    b: number;
    result: CollisionResult;
}
export interface CollisionCache {
    cache: Map<string, CollisionResult>;
    stats: {
        cacheHits: number;
    };
    config: {
        enableCaching: boolean;
        cacheSize: number;
    };
}
/**
 * Check collision with caching support
 */
export declare function checkCollisionWithCache(a: AABB, b: AABB, cache: CollisionCache): CollisionResult;
/**
 * Generate cache key for AABB pair
 */
export declare function generateCacheKey(a: AABB, b: AABB): string;
/**
 * Naive O(n²) collision detection for small datasets
 */
export declare function naiveCollisionDetection(aabbs: AABB[], cache: CollisionCache): CollisionPair[];
/**
 * Spatial hash optimized collision detection
 */
export declare function spatialCollisionDetection(aabbs: AABB[], spatialHash: SpatialHash<CollisionObjectData>, cache: CollisionCache): CollisionPair[];
