/**
 * Core Spatial Hashing Algorithm Implementation
 *
 * A highly optimized spatial partitioning system for efficient spatial queries,
 * nearest neighbor searches, and collision detection optimization.
 *
 * @module algorithms/spatialHashCore
 */
import { SpatialHashConfig, SpatialHashStats, SpatialObject, QueryResult } from "./spatial-hash-types";
import type { SpatialDataType } from "../types/spatial-types";
export declare class SpatialHash<T extends SpatialDataType = SpatialDataType> {
    private cells;
    private objectToCells;
    private config;
    private stats;
    private lastCleanup;
    constructor(config?: Partial<SpatialHashConfig>);
    /**
     * Insert an object into the spatial hash
     */
    insert(object: SpatialObject & {
        data: T;
    }): void;
    /**
     * Remove an object from the spatial hash
     */
    remove(objectId: string | number): boolean;
    /**
     * Update an object's position in the spatial hash
     */
    update(object: SpatialObject & {
        data: T;
    }): boolean;
    /**
     * Query for objects in a rectangular area
     */
    queryRect(x: number, y: number, width: number, height: number): Array<SpatialObject & {
        data: T;
    }>;
    /**
     * Query for objects within a radius of a point
     */
    queryRadius(centerX: number, centerY: number, radius: number): Array<QueryResult<T>>;
    /**
     * Find the nearest object to a point
     */
    findNearest(x: number, y: number, maxDistance?: number): QueryResult<T> | null;
    /**
     * Get all objects in the spatial hash
     */
    getAllObjects(): Array<SpatialObject & {
        data: T;
    }>;
    /**
     * Clear all objects from the spatial hash
     */
    clear(): void;
    /**
     * Get statistics about the spatial hash
     */
    getStats(): SpatialHashStats;
    /**
     * Resize the spatial hash with a new cell size
     */
    resize(newCellSize: number): void;
    private getObjectCells;
    private getRectCells;
    private getRadiusCells;
    private isObjectInRect;
    private getDistance;
    private checkAutoResize;
    private checkCleanup;
    private cleanup;
}
