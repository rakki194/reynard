/**
 * Performance Monitoring and Statistics
 *
 * Tracks collision detection performance metrics, maintains statistics,
 * and provides performance analysis and recommendations.
 *
 * @module algorithms/optimization/performanceMonitor
 */
import type { MemoryPoolStats, OptimizationRecommendation } from "../core/enhanced-memory-pool";
export interface PerformanceRecord {
    timestamp: number;
    algorithm: string;
    objectCount: number;
    executionTime: number;
    memoryUsage: number;
    hitRate: number;
}
export interface CollisionPerformanceStats {
    totalQueries: number;
    averageExecutionTime: number;
    averageMemoryUsage: number;
    algorithmUsage: {
        naive: number;
        spatial: number;
        optimized: number;
    };
    memoryPoolStats: MemoryPoolStats;
    performanceHistory: PerformanceRecord[];
}
export interface PerformanceThresholds {
    maxExecutionTime: number;
    maxMemoryUsage: number;
    minHitRate: number;
}
export interface PerformanceReport {
    summary: {
        totalQueries: number;
        averageExecutionTime: number;
        averageMemoryUsage: number;
        hitRate: number;
        isDegraded: boolean;
    };
    algorithmUsage: {
        naive: number;
        spatial: number;
        optimized: number;
    };
    memoryPool: MemoryPoolStats;
    recommendations: OptimizationRecommendation[];
}
/**
 * Performance monitoring and statistics manager
 */
export declare class PerformanceMonitor {
    private stats;
    private performanceHistory;
    private thresholds;
    constructor(thresholds: PerformanceThresholds);
    /**
     * Record a performance measurement
     */
    recordPerformance(algorithm: string, objectCount: number, executionTime: number, memoryUsage: number, hitRate: number): void;
    /**
     * Update memory pool statistics
     */
    updateMemoryPoolStats(stats: MemoryPoolStats): void;
    /**
     * Get current memory usage
     */
    getCurrentMemoryUsage(): number;
    /**
     * Get performance statistics
     */
    getPerformanceStats(): CollisionPerformanceStats;
    /**
     * Check if performance is degraded
     */
    isPerformanceDegraded(): boolean;
    /**
     * Get performance report
     */
    getPerformanceReport(recommendations: OptimizationRecommendation[]): PerformanceReport;
    /**
     * Estimate update frequency based on recent queries
     */
    estimateUpdateFrequency(): number;
    /**
     * Reset all statistics
     */
    resetStatistics(): void;
    /**
     * Update running averages
     */
    private updateRunningAverages;
    /**
     * Update algorithm usage statistics
     */
    private updateAlgorithmUsage;
}
