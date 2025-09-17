/**
 * Utility functions for Union-Find operations
 *
 * Provides high-level functions for common graph operations using Union-Find
 * data structure, including cycle detection and connected component analysis.
 *
 * @module algorithms/unionFindUtils
 */
/**
 * Utility function to detect cycles in a graph using Union-Find
 */
export declare function detectCycle(edges: Array<[number, number]>): boolean;
/**
 * Utility function to find connected components
 */
export declare function findConnectedComponents(edges: Array<[number, number]>): number[][];
