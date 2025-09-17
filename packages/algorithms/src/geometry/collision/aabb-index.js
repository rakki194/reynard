/**
 * AABB (Axis-Aligned Bounding Box) Module Index
 *
 * Central export point for all AABB collision detection functionality.
 * Provides a clean API for importing AABB operations.
 *
 * @module algorithms/aabb
 */
// Core collision detection
export { checkCollision } from "./aabb-collision";
// AABB operations
export { pointInAABB, unionAABB, intersectionAABB, expandAABB, containsAABB, areAABBsTouching, } from "./aabb-operations";
// AABB utilities
export { getAABBArea, getAABBPerimeter } from "./aabb-utils";
// Batch collision detection
export { batchCollisionDetection, batchCollisionWithSpatialHash, } from "./aabb-batch-collision";
// Spatial hashing
export { SpatialHash } from "./aabb-spatial-hash";
