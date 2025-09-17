/**
 * PAW Optimization Framework
 *
 * This module provides the unified optimization layer for the algorithms package,
 * integrating memory pooling, intelligent algorithm selection, and performance monitoring
 * based on the PAW optimization research findings.
 *
 * @module algorithms/optimization
 */
export { AlgorithmSelector, type AlgorithmSelection, type WorkloadCharacteristics, } from "./core/algorithm-selector";
export { EnhancedMemoryPool, type MemoryPoolConfig, type MemoryPoolStats, type OptimizationRecommendation, } from "./core/enhanced-memory-pool";
export { OptimizedCollisionAdapter, type CollisionPerformanceStats, type OptimizedCollisionConfig, } from "./adapters/optimized-collision-adapter";
export type { AABB, CollisionPair, CollisionResult, } from "../geometry/collision/aabb-types";
export { UnionFind } from "../union-find/union-find-core";
