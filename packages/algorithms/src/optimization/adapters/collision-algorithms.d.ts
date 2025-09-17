/**
 * Collision Detection Algorithms
 *
 * Pure collision detection implementations for different strategies.
 * Each algorithm is focused and optimized for specific use cases.
 *
 * @module algorithms/optimization/collisionAlgorithms
 */
import type { AABB, CollisionPair, CollisionResult } from "../../geometry/collision/aabb-types";
import { EnhancedMemoryPool } from "../core/enhanced-memory-pool";
/**
 * Basic collision detection between two AABBs
 */
export declare function checkCollision(a: AABB, b: AABB): boolean;
/**
 * Create detailed collision result
 */
export declare function createCollisionResult(a: AABB, b: AABB): CollisionResult;
/**
 * Naive O(n²) collision detection
 */
export declare function executeNaiveCollisionDetection(aabbs: AABB[]): CollisionPair[];
/**
 * Spatial hash-based collision detection
 */
export declare function executeSpatialCollisionDetection(aabbs: AABB[], memoryPool: EnhancedMemoryPool): CollisionPair[];
/**
 * Optimized collision detection (currently same as spatial)
 */
export declare function executeOptimizedCollisionDetection(aabbs: AABB[], memoryPool: EnhancedMemoryPool): CollisionPair[];
