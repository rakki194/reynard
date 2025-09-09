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
export {
  AlgorithmSelector,
  type WorkloadCharacteristics,
  type AlgorithmSelection,
} from "./core/algorithm-selector";
export {
  EnhancedMemoryPool,
  type MemoryPoolConfig,
  type MemoryPoolStats,
  type OptimizationRecommendation,
} from "./core/enhanced-memory-pool";

// Optimized algorithm adapters
export {
  OptimizedCollisionAdapter,
  type OptimizedCollisionConfig,
  type CollisionPerformanceStats,
} from "./adapters/optimized-collision-adapter";

// Legacy optimizations (from previous implementation)
export { PAWMemoryPool, globalPAWMemoryPool } from "./memory-pool";
export {
  OptimizedSpatialCollisionDetector,
  createOptimizedCollisionDetector,
} from "./optimized-spatial-collision";

// Re-export types for convenience
export type {
  AABB,
  CollisionPair,
  CollisionResult,
} from "../geometry/collision/aabb-types";
export type { SpatialHash } from "../spatial-hash/spatial-hash-core";
export type { UnionFind } from "../union-find/union-find-core";
