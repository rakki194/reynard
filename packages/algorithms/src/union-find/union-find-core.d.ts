/**
 * Core Union-Find Algorithm Implementation
 *
 * A highly optimized Union-Find data structure for efficient set operations
 * and cycle detection. Used for managing connected components and detecting
 * cycles in graphs.
 *
 * @module algorithms/unionFindCore
 */
import { UnionFindStats } from "./union-find-types";
export declare class UnionFind {
    private nodes;
    private stats;
    private setOps;
    constructor(size: number);
    find(x: number): number;
    union(x: number, y: number): boolean;
    connected(x: number, y: number): boolean;
    getSetSize(x: number): number;
    getSetMembers(x: number): number[];
    getStats(): UnionFindStats;
    reset(): void;
    clone(): UnionFind;
}
