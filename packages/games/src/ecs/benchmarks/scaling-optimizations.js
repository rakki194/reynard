/**
 * @fileoverview ECS Scaling Optimizations for Large Entity Counts
 *
 * This module provides various optimization strategies for handling large
 * numbers of entities in ECS systems, based on industry best practices.
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
import { StorageType } from "../types/storage";
/**
 * Default scaling configuration.
 */
const DEFAULT_SCALING_CONFIG = {
    enableEntityPooling: true,
    enableBatchProcessing: true,
    enableParallelProcessing: false, // Disabled by default for compatibility
    enableMemoryOptimization: true,
    maxEntitiesPerBatch: 1000,
    workerCount: 4,
};
/**
 * Entity pool for reusing entities to reduce allocation overhead.
 */
export class EntityPool {
    constructor(initialSize = 1000) {
        Object.defineProperty(this, "initialSize", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: initialSize
        });
        Object.defineProperty(this, "availableEntities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "activeEntities", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "entityCounter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "generationCounter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        this.preallocateEntities();
    }
    /**
     * Gets an entity from the pool.
     */
    acquire() {
        if (this.availableEntities.length > 0) {
            const entity = this.availableEntities.pop();
            this.activeEntities.add(entity);
            return entity;
        }
        // Create new entity if pool is empty
        const entity = this.createNewEntity();
        this.activeEntities.add(entity);
        return entity;
    }
    /**
     * Returns an entity to the pool.
     */
    release(entity) {
        if (this.activeEntities.has(entity)) {
            this.activeEntities.delete(entity);
            this.availableEntities.push(entity);
        }
    }
    /**
     * Gets pool statistics.
     */
    getStats() {
        return {
            available: this.availableEntities.length,
            active: this.activeEntities.size,
            total: this.availableEntities.length + this.activeEntities.size,
        };
    }
    /**
     * Preallocates entities in the pool.
     */
    preallocateEntities() {
        for (let i = 0; i < this.initialSize; i++) {
            const entity = this.createNewEntity();
            this.availableEntities.push(entity);
        }
    }
    /**
     * Creates a new entity with unique ID.
     */
    createNewEntity() {
        return {
            index: this.entityCounter++,
            generation: this.generationCounter++,
        };
    }
}
/**
 * Batch processor for handling large numbers of entities efficiently.
 */
export class BatchProcessor {
    constructor(config = {}) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.config = { ...DEFAULT_SCALING_CONFIG, ...config };
    }
    /**
     * Processes entities in batches to avoid memory spikes.
     */
    async processEntitiesInBatches(entities, processor, batchSize) {
        const size = batchSize || this.config.maxEntitiesPerBatch;
        const results = [];
        for (let i = 0; i < entities.length; i += size) {
            const batch = entities.slice(i, i + size);
            const result = processor(batch);
            results.push(result);
            // Allow other operations to run
            if (i + size < entities.length) {
                await new Promise((resolve) => setTimeout(resolve, 0));
            }
        }
        return results;
    }
    /**
     * Processes entities with memory management.
     */
    processWithMemoryManagement(entities, processor) {
        const results = [];
        const batchSize = this.config.maxEntitiesPerBatch;
        for (let i = 0; i < entities.length; i += batchSize) {
            const batch = entities.slice(i, i + batchSize);
            // Process batch
            for (const entity of batch) {
                results.push(processor(entity));
            }
            // Force garbage collection if available
            if (this.config.enableMemoryOptimization &&
                typeof global.gc === "function") {
                global.gc();
            }
        }
        return results;
    }
}
/**
 * Memory-optimized component storage strategies.
 */
export class MemoryOptimizedStorage {
    /**
     * Optimizes component storage for large entity counts.
     */
    static optimizeStorage(componentType, entityCount) {
        // Use SparseSet for optional components with low density
        if (entityCount > 10000) {
            return StorageType.SparseSet;
        }
        // Use Table for high-density components
        return StorageType.Table;
    }
    /**
     * Estimates memory usage for different storage types.
     */
    static estimateMemoryUsage(entityCount, componentSize, storageType) {
        const baseSize = entityCount * componentSize;
        switch (storageType) {
            case StorageType.Table:
                return baseSize * 1.1; // 10% overhead
            case StorageType.SparseSet:
                return baseSize * 1.5; // 50% overhead for sparse storage
            default:
                return baseSize;
        }
    }
}
/**
 * Query optimization strategies for large entity counts.
 */
export class QueryOptimizer {
    constructor() {
        Object.defineProperty(this, "queryCache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "cacheHits", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "cacheMisses", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    /**
     * Optimizes queries for large entity counts.
     */
    optimizeQuery(world, componentTypes, options = {}) {
        const { enableCaching = true, maxCacheSize = 100, cacheTimeout = 1000, } = options;
        if (!enableCaching) {
            return world.query(...componentTypes);
        }
        const cacheKey = this.generateCacheKey(componentTypes);
        const cached = this.queryCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < cacheTimeout) {
            this.cacheHits++;
            return cached.query;
        }
        // Create new query
        const query = world.query(...componentTypes);
        // Cache the query
        if (this.queryCache.size >= maxCacheSize) {
            this.clearOldestCacheEntry();
        }
        this.queryCache.set(cacheKey, {
            query,
            timestamp: Date.now(),
        });
        this.cacheMisses++;
        return query;
    }
    /**
     * Gets cache statistics.
     */
    getCacheStats() {
        const total = this.cacheHits + this.cacheMisses;
        return {
            hits: this.cacheHits,
            misses: this.cacheMisses,
            hitRate: total > 0 ? this.cacheHits / total : 0,
            cacheSize: this.queryCache.size,
        };
    }
    /**
     * Clears the query cache.
     */
    clearCache() {
        this.queryCache.clear();
        this.cacheHits = 0;
        this.cacheMisses = 0;
    }
    /**
     * Generates a cache key for component types.
     */
    generateCacheKey(componentTypes) {
        return componentTypes
            .map((type) => type.id)
            .sort()
            .join(",");
    }
    /**
     * Clears the oldest cache entry.
     */
    clearOldestCacheEntry() {
        let oldestKey = null;
        let oldestTime = Date.now();
        for (const [key, value] of this.queryCache.entries()) {
            if (value.timestamp < oldestTime) {
                oldestTime = value.timestamp;
                oldestKey = key;
            }
        }
        if (oldestKey) {
            this.queryCache.delete(oldestKey);
        }
    }
}
/**
 * Performance monitoring for scaling optimizations.
 */
export class ScalingMonitor {
    constructor() {
        Object.defineProperty(this, "metrics", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "startTimes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
    }
    /**
     * Starts timing a metric.
     */
    startTiming(metricName) {
        this.startTimes.set(metricName, performance.now());
    }
    /**
     * Ends timing a metric.
     */
    endTiming(metricName) {
        const startTime = this.startTimes.get(metricName);
        if (!startTime)
            return 0;
        const duration = performance.now() - startTime;
        this.startTimes.delete(metricName);
        if (!this.metrics.has(metricName)) {
            this.metrics.set(metricName, []);
        }
        this.metrics.get(metricName).push(duration);
        return duration;
    }
    /**
     * Records a metric value.
     */
    recordMetric(metricName, value) {
        if (!this.metrics.has(metricName)) {
            this.metrics.set(metricName, []);
        }
        this.metrics.get(metricName).push(value);
    }
    /**
     * Gets statistics for a metric.
     */
    getMetricStats(metricName) {
        const values = this.metrics.get(metricName);
        if (!values || values.length === 0)
            return null;
        const total = values.reduce((sum, val) => sum + val, 0);
        const average = total / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        return { count: values.length, average, min, max, total };
    }
    /**
     * Gets all metrics.
     */
    getAllMetrics() {
        const result = new Map();
        for (const [name, values] of this.metrics.entries()) {
            result.set(name, this.getMetricStats(name));
        }
        return result;
    }
    /**
     * Clears all metrics.
     */
    clearMetrics() {
        this.metrics.clear();
        this.startTimes.clear();
    }
}
/**
 * Main scaling optimizer that combines all optimization strategies.
 */
export class ScalingOptimizer {
    constructor(config = {}) {
        Object.defineProperty(this, "entityPool", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "batchProcessor", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "queryOptimizer", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "monitor", {
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
        this.config = { ...DEFAULT_SCALING_CONFIG, ...config };
        this.entityPool = new EntityPool(1000);
        this.batchProcessor = new BatchProcessor(this.config);
        this.queryOptimizer = new QueryOptimizer();
        this.monitor = new ScalingMonitor();
    }
    /**
     * Optimizes entity creation for large counts.
     */
    async createEntitiesOptimized(world, count, componentFactory) {
        this.monitor.startTiming("entity_creation");
        const entities = [];
        if (this.config.enableEntityPooling) {
            // Use entity pooling
            for (let i = 0; i < count; i++) {
                const entity = this.entityPool.acquire();
                const components = componentFactory(entity);
                // Note: In a real implementation, you'd need to manually add components to the pooled entity
                // For now, we'll use standard spawning
                const spawnedEntity = world.spawn(...components);
                entities.push(spawnedEntity);
            }
        }
        else {
            // Standard entity creation
            for (let i = 0; i < count; i++) {
                const entity = world.spawn();
                const components = componentFactory(entity);
                world.insert(entity, ...components);
                entities.push(entity);
            }
        }
        this.monitor.endTiming("entity_creation");
        this.monitor.recordMetric("entities_created", count);
        return entities;
    }
    /**
     * Optimizes query execution for large entity counts.
     */
    optimizeQuery(world, componentTypes) {
        this.monitor.startTiming("query_optimization");
        const query = this.queryOptimizer.optimizeQuery(world, componentTypes, {
            enableCaching: true,
            maxCacheSize: 100,
            cacheTimeout: 1000,
        });
        this.monitor.endTiming("query_optimization");
        return query;
    }
    /**
     * Gets optimization statistics.
     */
    getOptimizationStats() {
        return {
            entityPool: this.entityPool.getStats(),
            queryCache: this.queryOptimizer.getCacheStats(),
            metrics: this.monitor.getAllMetrics(),
        };
    }
    /**
     * Cleans up resources.
     */
    cleanup() {
        this.queryOptimizer.clearCache();
        this.monitor.clearMetrics();
    }
}
/**
 * Creates a scaling optimizer with default configuration.
 */
export function createScalingOptimizer(config) {
    return new ScalingOptimizer(config);
}
