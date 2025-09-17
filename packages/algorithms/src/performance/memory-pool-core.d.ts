/**
 * Memory Pool Core Implementation
 *
 * A high-performance object pooling system that reuses objects to reduce
 * garbage collection pressure and improve performance for high-frequency operations.
 *
 * @module algorithms/performance/memoryPoolCore
 */
export interface PooledObject {
    reset(): void;
}
export interface PerformanceMemoryPoolConfig {
    initialSize?: number;
    maxSize?: number;
    growthFactor?: number;
    enableStats?: boolean;
}
export interface PerformanceMemoryPoolStats {
    created: number;
    acquired: number;
    released: number;
    poolSize: number;
    peakPoolSize: number;
    hitRate: number;
}
export declare class MemoryPool<T extends PooledObject> {
    private pool;
    private createFn;
    private config;
    private stats;
    constructor(createFn: () => T, config?: PerformanceMemoryPoolConfig);
    private initializePool;
    acquire(): T;
    release(obj: T): void;
    private updateHitRate;
    getStats(): PerformanceMemoryPoolStats;
    clear(): void;
    resize(newSize: number): void;
}
