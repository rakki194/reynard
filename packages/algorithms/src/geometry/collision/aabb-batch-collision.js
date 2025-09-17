/**
 * AABB Batch Collision Detection
 *
 * Efficient batch processing for multiple AABB collision checks.
 * Supports both naive O(n²) and optimized spatial hashing approaches.
 *
 * @module algorithms/aabbBatchCollision
 */
import { SpatialHash } from "./aabb-spatial-hash";
import { checkCollision } from "./aabb-collision";
/**
 * Batch collision detection for multiple AABBs
 */
export function batchCollisionDetection(aabbs, options = {}) {
    const { maxDistance, includeSelf = false, spatialHash } = options;
    const collisions = [];
    if (spatialHash?.enableOptimization && aabbs.length > 100) {
        return batchCollisionWithSpatialHash(aabbs, options);
    }
    for (let i = 0; i < aabbs.length; i++) {
        for (let j = includeSelf ? i : i + 1; j < aabbs.length; j++) {
            const result = checkCollision(aabbs[i], aabbs[j]);
            if (result.colliding &&
                (!maxDistance || result.distance <= maxDistance)) {
                collisions.push({
                    index1: i,
                    index2: j,
                    result,
                });
            }
        }
    }
    return collisions;
}
/**
 * Batch collision detection using spatial hashing
 */
export function batchCollisionWithSpatialHash(aabbs, options) {
    const { maxDistance, includeSelf = false, spatialHash } = options;
    const collisions = [];
    if (!spatialHash) {
        return batchCollisionDetection(aabbs, options);
    }
    const hash = new SpatialHash(spatialHash.cellSize);
    // Insert all AABBs into spatial hash
    for (let i = 0; i < aabbs.length; i++) {
        hash.insert(i, aabbs[i]);
    }
    // Query for collisions
    for (let i = 0; i < aabbs.length; i++) {
        const candidates = hash.query(aabbs[i]);
        for (const j of candidates) {
            if (!includeSelf && i >= j)
                continue;
            const result = checkCollision(aabbs[i], aabbs[j]);
            if (result.colliding &&
                (!maxDistance || result.distance <= maxDistance)) {
                collisions.push({
                    index1: i,
                    index2: j,
                    result,
                });
            }
        }
    }
    return collisions;
}
