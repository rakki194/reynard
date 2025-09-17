/**
 * Union-Find Algorithm Implementation
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
export { detectCycle, findConnectedComponents } from "./union-find-utils";
