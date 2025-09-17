/**
 * Optimized Collision Detection Adapter Module
 *
 * Barrel exports for all collision detection optimization components.
 *
 * @module algorithms/optimization/adapters
 */
export { OptimizedCollisionAdapter } from "./optimized-collision-adapter";
export type { OptimizedCollisionConfig } from "./optimized-collision-adapter";
export { checkCollision, createCollisionResult, executeNaiveCollisionDetection, executeSpatialCollisionDetection, executeOptimizedCollisionDetection, } from "./collision-algorithms";
export { analyzeWorkload, calculateSpatialDensity, calculateOverlapRatio, analyzeQueryPattern, getAlgorithmRecommendation, } from "./workload-analyzer";
export type { WorkloadAnalysisResult } from "./workload-analyzer";
export { PerformanceMonitor, type PerformanceRecord, type PerformanceThresholds, type CollisionPerformanceStats, type PerformanceReport, } from "./performance-monitor";
export type { MemoryPoolConfig, MemoryPoolStats, OptimizationRecommendation, } from "../core/enhanced-memory-pool";
