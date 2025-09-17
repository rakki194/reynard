/**
 * Union-Find Batch Operations
 *
 * Optimized batch operations for Union-Find data structure that provide
 * better performance for bulk operations by reducing function call overhead
 * and enabling vectorized processing.
 *
 * @module algorithms/unionFindBatchOperations
 */
import { UnionFind } from "./union-find-core";
export interface BatchOperation {
    type: "union" | "find" | "connected";
    args: [number, number] | [number];
}
export interface BatchResult {
    type: "union" | "find" | "connected";
    result: boolean | number;
    args: [number, number] | [number];
}
export declare class BatchUnionFind extends UnionFind {
    private operationCache;
    private batchStats;
    constructor(size: number);
    /**
     * Execute multiple union operations in batch
     */
    batchUnion(operations: [number, number][]): boolean[];
    /**
     * Execute multiple find operations in batch
     */
    batchFind(elements: number[]): number[];
    /**
     * Execute multiple connected checks in batch
     */
    batchConnected(pairs: [number, number][]): boolean[];
    /**
     * Execute mixed batch operations with caching
     */
    batchOperations(operations: BatchOperation[]): BatchResult[];
    /**
     * Optimized batch union with early termination and caching
     */
    batchUnionOptimized(operations: [number, number][]): boolean[];
    /**
     * Get batch operation statistics
     */
    getBatchStats(): {
        cacheHitRate: number;
        batchOperations: number;
        cacheHits: number;
        totalOperations: number;
    };
    /**
     * Clear operation cache
     */
    clearCache(): void;
}
