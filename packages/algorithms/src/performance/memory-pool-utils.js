/**
 * Memory Pool Utilities
 *
 * Utility functions and factory methods for creating specialized memory pools
 * for common use cases in the algorithms package.
 *
 * @module algorithms/performance/memoryPoolUtils
 */
import { MemoryPool } from "./memory-pool-core";
/**
 * Create a memory pool for spatial objects
 */
export function createSpatialObjectPool(config = {}) {
    class SpatialObject {
        constructor() {
            Object.defineProperty(this, "id", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: ""
            });
            Object.defineProperty(this, "x", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "y", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "width", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "height", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "data", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: null
            });
        }
        reset() {
            this.id = "";
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
            this.data = null;
        }
    }
    return new MemoryPool(() => new SpatialObject(), config);
}
/**
 * Create a memory pool for AABB objects
 */
export function createAABBPool(config = {}) {
    class AABBObject {
        constructor() {
            Object.defineProperty(this, "x", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "y", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "width", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "height", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
        }
        reset() {
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
        }
    }
    return new MemoryPool(() => new AABBObject(), config);
}
/**
 * Create a memory pool for point objects
 */
export function createPointPool(config = {}) {
    class PointObject {
        constructor() {
            Object.defineProperty(this, "x", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "y", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
        }
        reset() {
            this.x = 0;
            this.y = 0;
        }
    }
    return new MemoryPool(() => new PointObject(), config);
}
/**
 * Create a memory pool for vector objects
 */
export function createVectorPool(config = {}) {
    class VectorObject {
        constructor() {
            Object.defineProperty(this, "x", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "y", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
            Object.defineProperty(this, "magnitude", {
                enumerable: true,
                configurable: true,
                writable: true,
                value: 0
            });
        }
        reset() {
            this.x = 0;
            this.y = 0;
            this.magnitude = 0;
        }
    }
    return new MemoryPool(() => new VectorObject(), config);
}
/**
 * Global memory pool manager for managing multiple pools
 */
export class MemoryPoolManager {
    constructor() {
        Object.defineProperty(this, "pools", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    createPool(name, createFn, config = {}) {
        const pool = new MemoryPool(createFn, config);
        this.pools.set(name, pool);
        return pool;
    }
    getPool(name) {
        return this.pools.get(name);
    }
    removePool(name) {
        return this.pools.delete(name);
    }
    getAllStats() {
        const stats = {};
        this.pools.forEach((pool, name) => {
            stats[name] = pool.getStats();
        });
        return stats;
    }
    clearAllPools() {
        this.pools.forEach(pool => {
            pool.clear();
        });
    }
}
// Global instance for convenience
export const globalPoolManager = new MemoryPoolManager();
