/**
 * Memory Pool Utilities
 *
 * Utility functions and factory methods for creating specialized memory pools
 * for common use cases in the algorithms package.
 *
 * @module algorithms/performance/memoryPoolUtils
 */
import type { SpatialObjectData } from "../types/spatial-types";
import type { PerformanceMemoryPoolStats } from "./memory-pool-core";
import { MemoryPool, PerformanceMemoryPoolConfig, PooledObject } from "./memory-pool-core";
/**
 * Create a memory pool for spatial objects
 */
export declare function createSpatialObjectPool(config?: PerformanceMemoryPoolConfig): MemoryPool<{
    id: string | number;
    x: number;
    y: number;
    width: number;
    height: number;
    data: SpatialObjectData | null;
    reset(): void;
}>;
/**
 * Create a memory pool for AABB objects
 */
export declare function createAABBPool(config?: PerformanceMemoryPoolConfig): MemoryPool<{
    x: number;
    y: number;
    width: number;
    height: number;
    reset(): void;
}>;
/**
 * Create a memory pool for point objects
 */
export declare function createPointPool(config?: PerformanceMemoryPoolConfig): MemoryPool<{
    x: number;
    y: number;
    reset(): void;
}>;
/**
 * Create a memory pool for vector objects
 */
export declare function createVectorPool(config?: PerformanceMemoryPoolConfig): MemoryPool<{
    x: number;
    y: number;
    magnitude: number;
    reset(): void;
}>;
/**
 * Global memory pool manager for managing multiple pools
 */
export declare class MemoryPoolManager {
    private pools;
    createPool<T extends PooledObject>(name: string, createFn: () => T, config?: PerformanceMemoryPoolConfig): MemoryPool<T>;
    getPool<T extends PooledObject>(name: string): MemoryPool<T> | undefined;
    removePool(name: string): boolean;
    getAllStats(): Record<string, PerformanceMemoryPoolStats>;
    clearAllPools(): void;
}
export declare const globalPoolManager: MemoryPoolManager;
