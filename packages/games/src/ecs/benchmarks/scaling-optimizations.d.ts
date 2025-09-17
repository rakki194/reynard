/**
 * @fileoverview ECS Scaling Optimizations for Large Entity Counts
 *
 * This module provides various optimization strategies for handling large
 * numbers of entities in ECS systems, based on industry best practices.
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
import { Component, Entity } from "../types/core";
import { ComponentType, StorageType } from "../types/storage";
import { World } from "../types/world";
/**
 * Configuration for scaling optimizations.
 */
export interface ScalingConfig {
    enableEntityPooling: boolean;
    enableBatchProcessing: boolean;
    enableParallelProcessing: boolean;
    enableMemoryOptimization: boolean;
    maxEntitiesPerBatch: number;
    workerCount: number;
}
/**
 * Entity pool for reusing entities to reduce allocation overhead.
 */
export declare class EntityPool {
    private initialSize;
    private availableEntities;
    private activeEntities;
    private entityCounter;
    private generationCounter;
    constructor(initialSize?: number);
    /**
     * Gets an entity from the pool.
     */
    acquire(): Entity;
    /**
     * Returns an entity to the pool.
     */
    release(entity: Entity): void;
    /**
     * Gets pool statistics.
     */
    getStats(): {
        available: number;
        active: number;
        total: number;
    };
    /**
     * Preallocates entities in the pool.
     */
    private preallocateEntities;
    /**
     * Creates a new entity with unique ID.
     */
    private createNewEntity;
}
/**
 * Batch processor for handling large numbers of entities efficiently.
 */
export declare class BatchProcessor {
    private config;
    constructor(config?: Partial<ScalingConfig>);
    /**
     * Processes entities in batches to avoid memory spikes.
     */
    processEntitiesInBatches<T>(entities: Entity[], processor: (batch: Entity[]) => T, batchSize?: number): Promise<T[]>;
    /**
     * Processes entities with memory management.
     */
    processWithMemoryManagement<T>(entities: Entity[], processor: (entity: Entity) => T): T[];
}
/**
 * Memory-optimized component storage strategies.
 */
export declare class MemoryOptimizedStorage {
    /**
     * Optimizes component storage for large entity counts.
     */
    static optimizeStorage<T extends Component>(componentType: ComponentType<T>, entityCount: number): StorageType;
    /**
     * Estimates memory usage for different storage types.
     */
    static estimateMemoryUsage(entityCount: number, componentSize: number, storageType: StorageType): number;
}
/**
 * Query optimization strategies for large entity counts.
 */
export declare class QueryOptimizer {
    private queryCache;
    private cacheHits;
    private cacheMisses;
    /**
     * Optimizes queries for large entity counts.
     */
    optimizeQuery<T extends Component[]>(world: World, componentTypes: ComponentType<T[number]>[], options?: {
        enableCaching?: boolean;
        maxCacheSize?: number;
        cacheTimeout?: number;
    }): any;
    /**
     * Gets cache statistics.
     */
    getCacheStats(): {
        hits: number;
        misses: number;
        hitRate: number;
        cacheSize: number;
    };
    /**
     * Clears the query cache.
     */
    clearCache(): void;
    /**
     * Generates a cache key for component types.
     */
    private generateCacheKey;
    /**
     * Clears the oldest cache entry.
     */
    private clearOldestCacheEntry;
}
/**
 * Performance monitoring for scaling optimizations.
 */
export declare class ScalingMonitor {
    private metrics;
    private startTimes;
    /**
     * Starts timing a metric.
     */
    startTiming(metricName: string): void;
    /**
     * Ends timing a metric.
     */
    endTiming(metricName: string): number;
    /**
     * Records a metric value.
     */
    recordMetric(metricName: string, value: number): void;
    /**
     * Gets statistics for a metric.
     */
    getMetricStats(metricName: string): {
        count: number;
        average: number;
        min: number;
        max: number;
        total: number;
    } | null;
    /**
     * Gets all metrics.
     */
    getAllMetrics(): Map<string, any>;
    /**
     * Clears all metrics.
     */
    clearMetrics(): void;
}
/**
 * Main scaling optimizer that combines all optimization strategies.
 */
export declare class ScalingOptimizer {
    private entityPool;
    private batchProcessor;
    private queryOptimizer;
    private monitor;
    private config;
    constructor(config?: Partial<ScalingConfig>);
    /**
     * Optimizes entity creation for large counts.
     */
    createEntitiesOptimized(world: World, count: number, componentFactory: (entity: Entity) => Component[]): Promise<Entity[]>;
    /**
     * Optimizes query execution for large entity counts.
     */
    optimizeQuery<T extends Component[]>(world: World, componentTypes: ComponentType<T[number]>[]): any;
    /**
     * Gets optimization statistics.
     */
    getOptimizationStats(): {
        entityPool: any;
        queryCache: any;
        metrics: Map<string, any>;
    };
    /**
     * Cleans up resources.
     */
    cleanup(): void;
}
/**
 * Creates a scaling optimizer with default configuration.
 */
export declare function createScalingOptimizer(config?: Partial<ScalingConfig>): ScalingOptimizer;
