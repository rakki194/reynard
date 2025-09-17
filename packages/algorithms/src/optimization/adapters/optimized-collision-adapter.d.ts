/**
 * Optimized Collision Detection Adapter
 *
 * This adapter integrates the PAW optimization techniques with collision detection,
 * providing automatic algorithm selection and memory pooling for optimal performance.
 *
 * @module algorithms/optimization/optimizedCollisionAdapter
 */
import { type MemoryPoolConfig, type MemoryPoolStats, type OptimizationRecommendation } from "../core/enhanced-memory-pool";
import type { AABB, CollisionPair } from "../../geometry/collision/aabb-types";
import { type CollisionPerformanceStats, type PerformanceReport } from "./performance-monitor";
export interface OptimizedCollisionConfig {
    enableMemoryPooling: boolean;
    enableAlgorithmSelection: boolean;
    enablePerformanceMonitoring: boolean;
    memoryPoolConfig?: Partial<MemoryPoolConfig>;
    algorithmSelectionStrategy: "naive" | "spatial" | "optimized" | "adaptive";
    performanceThresholds: {
        maxExecutionTime: number;
        maxMemoryUsage: number;
        minHitRate: number;
    };
}
export type { CollisionPerformanceStats, PerformanceReport, } from "./performance-monitor";
/**
 * Optimized collision detection adapter with automatic algorithm selection
 */
export declare class OptimizedCollisionAdapter {
    private algorithmSelector;
    private memoryPool;
    private performanceMonitor;
    private config;
    constructor(config?: Partial<OptimizedCollisionConfig>);
    detectCollisions(aabbs: AABB[]): CollisionPair[];
    private executeNaiveWithPool;
    private executeSpatialDirect;
    private executeOptimizedDirect;
    private checkCollision;
    private executeAlgorithm;
    private updatePerformanceModel;
    getPerformanceStats(): CollisionPerformanceStats;
    /**
     * Get current memory usage
     */
    private getCurrentMemoryUsage;
    getMemoryPoolStats(): MemoryPoolStats;
    getOptimizationRecommendations(): OptimizationRecommendation[];
    isPerformanceDegraded(): boolean;
    getPerformanceReport(): PerformanceReport;
    resetStatistics(): void;
    destroy(): void;
}
