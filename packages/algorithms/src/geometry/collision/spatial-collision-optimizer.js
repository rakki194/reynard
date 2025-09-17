/**
 * Spatial Collision Optimizer
 *
 * Advanced collision detection system that uses spatial partitioning
 * to optimize collision queries and reduce computational complexity
 * from O(n²) to O(n) average case.
 *
 * @module algorithms/geometry/collision/spatialCollisionOptimizer
 */
import { SpatialHash } from "../../spatial-hash/spatial-hash-core";
import { naiveCollisionDetection, spatialCollisionDetection, } from "./collision-detection-core";
import { createDefaultConfig, createInitialStats, updateAverageQueryTime, } from "./spatial-collision-stats";
export class SpatialCollisionOptimizer {
    constructor(config = {}) {
        Object.defineProperty(this, "spatialHash", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "collisionCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "stats", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.config = createDefaultConfig(config);
        this.spatialHash = new SpatialHash({
            cellSize: this.config.cellSize,
            maxObjectsPerCell: this.config.maxObjectsPerCell,
        });
        this.collisionCache = {
            cache: new Map(),
            stats: { cacheHits: 0 },
            config: {
                enableCaching: this.config.enableCaching,
                cacheSize: this.config.cacheSize,
            },
        };
        this.stats = createInitialStats();
    }
    /**
     * Detect collisions using spatial optimization
     */
    detectCollisions(aabbs) {
        const start = performance.now();
        this.stats.totalQueries++;
        this.stats.objectsProcessed = aabbs.length;
        // Choose algorithm based on object count
        const collisions = aabbs.length < this.config.hybridThreshold
            ? this.naiveCollisionDetection(aabbs)
            : this.spatialCollisionDetection(aabbs);
        const duration = performance.now() - start;
        updateAverageQueryTime(this.stats, duration);
        return collisions;
    }
    /**
     * Naive O(n²) collision detection for small datasets
     */
    naiveCollisionDetection(aabbs) {
        this.stats.naiveQueries++;
        return naiveCollisionDetection(aabbs, this.collisionCache);
    }
    /**
     * Spatial hash optimized collision detection
     */
    spatialCollisionDetection(aabbs) {
        this.stats.spatialQueries++;
        return spatialCollisionDetection(aabbs, this.spatialHash, this.collisionCache);
    }
    /**
     * Get performance statistics
     */
    getStats() {
        return {
            ...this.stats,
            cacheHits: this.collisionCache.stats.cacheHits,
        };
    }
    /**
     * Clear collision cache
     */
    clearCache() {
        this.collisionCache.cache.clear();
        this.collisionCache.stats.cacheHits = 0;
    }
    /**
     * Update configuration
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        // Update collision cache config
        this.collisionCache.config = {
            enableCaching: this.config.enableCaching,
            cacheSize: this.config.cacheSize,
        };
        if (newConfig.cellSize || newConfig.maxObjectsPerCell) {
            this.spatialHash = new SpatialHash({
                cellSize: this.config.cellSize,
                maxObjectsPerCell: this.config.maxObjectsPerCell,
            });
        }
    }
}
