/**
 * Utility functions for Spatial Hashing Algorithm
 *
 * @module algorithms/spatialHashUtils
 */
import { SpatialObject } from "./spatial-hash-types";
import { SpatialHash } from "./spatial-hash-core";
import type { SpatialDataType } from "../types/spatial-types";
/**
 * Utility function to create a spatial hash optimized for a specific use case
 */
export declare function createOptimizedSpatialHash<T extends SpatialDataType = SpatialDataType>(objects: Array<SpatialObject<T>>, options?: {
    targetCellSize?: number;
    maxObjectsPerCell?: number;
}): SpatialHash<T>;
/**
 * Calculate optimal cell size based on object distribution
 */
export declare function calculateOptimalCellSize(objects: Array<SpatialObject>): number;
/**
 * Estimate memory usage for spatial hash data structures
 */
export declare function estimateMemoryUsage(cellCount: number, objectCount: number, objectToCellCount: number): number;
