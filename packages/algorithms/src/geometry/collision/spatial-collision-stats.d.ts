/**
 * Spatial Collision Statistics and Configuration
 *
 * Statistics tracking and configuration management
 * for the spatial collision optimizer.
 *
 * @module algorithms/geometry/collision/spatialCollisionStats
 */
export interface SpatialCollisionConfig {
    cellSize: number;
    maxObjectsPerCell: number;
    enableCaching: boolean;
    cacheSize: number;
    hybridThreshold: number;
}
export interface SpatialCollisionStats {
    totalQueries: number;
    spatialQueries: number;
    naiveQueries: number;
    cacheHits: number;
    averageQueryTime: number;
    objectsProcessed: number;
}
/**
 * Create default configuration
 */
export declare function createDefaultConfig(overrides?: Partial<SpatialCollisionConfig>): SpatialCollisionConfig;
/**
 * Create initial statistics
 */
export declare function createInitialStats(): SpatialCollisionStats;
/**
 * Update average query time
 */
export declare function updateAverageQueryTime(stats: SpatialCollisionStats, duration: number): void;
