/**
 * Set operations for Union-Find data structure
 *
 * Provides methods for querying set information and statistics
 * from Union-Find instances.
 *
 * @module algorithms/unionFindSetOperations
 */
import { UnionFindNode, UnionFindStats } from "./union-find-types";
export declare class UnionFindSetOperations {
    private nodes;
    private stats;
    constructor(nodes: UnionFindNode[], stats: {
        compressionCount: number;
        unionCount: number;
    });
    /**
     * Find the root of a node with path compression
     */
    find(x: number): number;
    /**
     * Get the size of the set containing x
     */
    getSetSize(x: number): number;
    /**
     * Get all nodes in the same set as x
     */
    getSetMembers(x: number): number[];
    /**
     * Get statistics about the Union-Find structure
     */
    getStats(): UnionFindStats;
}
