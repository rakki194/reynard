/**
 * Spatial Collision Statistics and Configuration
 *
 * Statistics tracking and configuration management
 * for the spatial collision optimizer.
 *
 * @module algorithms/geometry/collision/spatialCollisionStats
 */
/**
 * Create default configuration
 */
export function createDefaultConfig(overrides = {}) {
    return {
        cellSize: 100,
        maxObjectsPerCell: 50,
        enableCaching: true,
        cacheSize: 1000,
        hybridThreshold: 100,
        ...overrides,
    };
}
/**
 * Create initial statistics
 */
export function createInitialStats() {
    return {
        totalQueries: 0,
        spatialQueries: 0,
        naiveQueries: 0,
        cacheHits: 0,
        averageQueryTime: 0,
        objectsProcessed: 0,
    };
}
/**
 * Update average query time
 */
export function updateAverageQueryTime(stats, duration) {
    stats.averageQueryTime =
        (stats.averageQueryTime * (stats.totalQueries - 1) + duration) /
            stats.totalQueries;
}
