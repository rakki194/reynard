/**
 * AABB Spatial Hashing
 *
 * Optimized spatial partitioning system for efficient collision detection.
 * Uses spatial hashing to reduce collision checks from O(n²) to O(n) in many cases.
 *
 * @module algorithms/aabbSpatialHash
 */
import type { AABB } from "./aabb-types";
/**
 * Spatial hash for optimized collision detection
 */
export declare class SpatialHash {
    private cells;
    private cellSize;
    constructor(cellSize: number);
    private getCellKey;
    private getAABBCells;
    insert(index: number, aabb: AABB): void;
    query(aabb: AABB): number[];
    clear(): void;
}
