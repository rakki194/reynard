/**
 * PAW Optimization Framework
 *
 * This module provides the unified optimization layer for the algorithms package,
 * integrating memory pooling, intelligent algorithm selection, and performance monitoring
 * based on the PAW optimization research findings.
 *
 * @module algorithms/optimization
 */
// Core optimization components
export { AlgorithmSelector, } from "./core/algorithm-selector";
export { EnhancedMemoryPool, } from "./core/enhanced-memory-pool";
// Optimized algorithm adapters
export { OptimizedCollisionAdapter, } from "./adapters/optimized-collision-adapter";
// export type { SpatialHash } from "../spatial-hash/spatial-hash-core"; // Removed to avoid overriding class export
export { UnionFind } from "../union-find/union-find-core";
