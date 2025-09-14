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
 * Default scaling configuration.
 */
const DEFAULT_SCALING_CONFIG: ScalingConfig = {
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
  private availableEntities: Entity[] = [];
  private activeEntities: Set<Entity> = new Set();
  private entityCounter: number = 0;
  private generationCounter: number = 0;

  constructor(private initialSize: number = 1000) {
    this.preallocateEntities();
  }

  /**
   * Gets an entity from the pool.
   */
  acquire(): Entity {
    if (this.availableEntities.length > 0) {
      const entity = this.availableEntities.pop()!;
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
  release(entity: Entity): void {
    if (this.activeEntities.has(entity)) {
      this.activeEntities.delete(entity);
      this.availableEntities.push(entity);
    }
  }

  /**
   * Gets pool statistics.
   */
  getStats(): { available: number; active: number; total: number } {
    return {
      available: this.availableEntities.length,
      active: this.activeEntities.size,
      total: this.availableEntities.length + this.activeEntities.size,
    };
  }

  /**
   * Preallocates entities in the pool.
   */
  private preallocateEntities(): void {
    for (let i = 0; i < this.initialSize; i++) {
      const entity = this.createNewEntity();
      this.availableEntities.push(entity);
    }
  }

  /**
   * Creates a new entity with unique ID.
   */
  private createNewEntity(): Entity {
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
  private config: ScalingConfig;

  constructor(config: Partial<ScalingConfig> = {}) {
    this.config = { ...DEFAULT_SCALING_CONFIG, ...config };
  }

  /**
   * Processes entities in batches to avoid memory spikes.
   */
  async processEntitiesInBatches<T>(
    entities: Entity[],
    processor: (batch: Entity[]) => T,
    batchSize?: number,
  ): Promise<T[]> {
    const size = batchSize || this.config.maxEntitiesPerBatch;
    const results: T[] = [];

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
  processWithMemoryManagement<T>(
    entities: Entity[],
    processor: (entity: Entity) => T,
  ): T[] {
    const results: T[] = [];
    const batchSize = this.config.maxEntitiesPerBatch;

    for (let i = 0; i < entities.length; i += batchSize) {
      const batch = entities.slice(i, i + batchSize);

      // Process batch
      for (const entity of batch) {
        results.push(processor(entity));
      }

      // Force garbage collection if available
      if (
        this.config.enableMemoryOptimization &&
        typeof global.gc === "function"
      ) {
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
  static optimizeStorage<T extends Component>(
    componentType: ComponentType<T>,
    entityCount: number,
  ): StorageType {
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
  static estimateMemoryUsage(
    entityCount: number,
    componentSize: number,
    storageType: StorageType,
  ): number {
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
  private queryCache: Map<string, any> = new Map();
  private cacheHits: number = 0;
  private cacheMisses: number = 0;

  /**
   * Optimizes queries for large entity counts.
   */
  optimizeQuery<T extends Component[]>(
    world: World,
    componentTypes: ComponentType<T[number]>[],
    options: {
      enableCaching?: boolean;
      maxCacheSize?: number;
      cacheTimeout?: number;
    } = {},
  ): any {
    const {
      enableCaching = true,
      maxCacheSize = 100,
      cacheTimeout = 1000,
    } = options;

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
  getCacheStats(): {
    hits: number;
    misses: number;
    hitRate: number;
    cacheSize: number;
  } {
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
  clearCache(): void {
    this.queryCache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Generates a cache key for component types.
   */
  private generateCacheKey(componentTypes: ComponentType<any>[]): string {
    return componentTypes
      .map((type) => type.id)
      .sort()
      .join(",");
  }

  /**
   * Clears the oldest cache entry.
   */
  private clearOldestCacheEntry(): void {
    let oldestKey: string | null = null;
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
  private metrics: Map<string, number[]> = new Map();
  private startTimes: Map<string, number> = new Map();

  /**
   * Starts timing a metric.
   */
  startTiming(metricName: string): void {
    this.startTimes.set(metricName, performance.now());
  }

  /**
   * Ends timing a metric.
   */
  endTiming(metricName: string): number {
    const startTime = this.startTimes.get(metricName);
    if (!startTime) return 0;

    const duration = performance.now() - startTime;
    this.startTimes.delete(metricName);

    if (!this.metrics.has(metricName)) {
      this.metrics.set(metricName, []);
    }
    this.metrics.get(metricName)!.push(duration);

    return duration;
  }

  /**
   * Records a metric value.
   */
  recordMetric(metricName: string, value: number): void {
    if (!this.metrics.has(metricName)) {
      this.metrics.set(metricName, []);
    }
    this.metrics.get(metricName)!.push(value);
  }

  /**
   * Gets statistics for a metric.
   */
  getMetricStats(metricName: string): {
    count: number;
    average: number;
    min: number;
    max: number;
    total: number;
  } | null {
    const values = this.metrics.get(metricName);
    if (!values || values.length === 0) return null;

    const total = values.reduce((sum, val) => sum + val, 0);
    const average = total / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    return { count: values.length, average, min, max, total };
  }

  /**
   * Gets all metrics.
   */
  getAllMetrics(): Map<string, any> {
    const result = new Map();
    for (const [name, values] of this.metrics.entries()) {
      result.set(name, this.getMetricStats(name));
    }
    return result;
  }

  /**
   * Clears all metrics.
   */
  clearMetrics(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }
}

/**
 * Main scaling optimizer that combines all optimization strategies.
 */
export class ScalingOptimizer {
  private entityPool: EntityPool;
  private batchProcessor: BatchProcessor;
  private queryOptimizer: QueryOptimizer;
  private monitor: ScalingMonitor;
  private config: ScalingConfig;

  constructor(config: Partial<ScalingConfig> = {}) {
    this.config = { ...DEFAULT_SCALING_CONFIG, ...config };
    this.entityPool = new EntityPool(1000);
    this.batchProcessor = new BatchProcessor(this.config);
    this.queryOptimizer = new QueryOptimizer();
    this.monitor = new ScalingMonitor();
  }

  /**
   * Optimizes entity creation for large counts.
   */
  async createEntitiesOptimized(
    world: World,
    count: number,
    componentFactory: (entity: Entity) => Component[],
  ): Promise<Entity[]> {
    this.monitor.startTiming("entity_creation");

    const entities: Entity[] = [];

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
    } else {
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
  optimizeQuery<T extends Component[]>(
    world: World,
    componentTypes: ComponentType<T[number]>[],
  ): any {
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
  getOptimizationStats(): {
    entityPool: any;
    queryCache: any;
    metrics: Map<string, any>;
  } {
    return {
      entityPool: this.entityPool.getStats(),
      queryCache: this.queryOptimizer.getCacheStats(),
      metrics: this.monitor.getAllMetrics(),
    };
  }

  /**
   * Cleans up resources.
   */
  cleanup(): void {
    this.queryOptimizer.clearCache();
    this.monitor.clearMetrics();
  }
}

/**
 * Creates a scaling optimizer with default configuration.
 */
export function createScalingOptimizer(
  config?: Partial<ScalingConfig>,
): ScalingOptimizer {
  return new ScalingOptimizer(config);
}
