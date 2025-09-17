/**
 * Union-Find Algorithm Module
 *
 * A highly optimized Union-Find data structure for efficient set operations
 * and cycle detection. Used for managing connected components and detecting
 * cycles in graphs.
 *
 * Features:
 * - Path compression for optimal performance
 * - Union by rank for balanced trees
 * - Cycle detection capabilities
 * - Memory-efficient implementation
 * - Type-safe operations
 *
 * @module algorithms/unionFind
 */
export type { UnionFindNode, UnionFindStats } from "./union-find-types";
export { UnionFind } from "./union-find-core";
export * from "./union-find-utils";
export * from "./union-find-set-operations";
export * from "./union-find-batch-operations";
export { UnionFind as default } from "./union-find";
