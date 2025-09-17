/**
 * @fileoverview Performance Monitor for WASM SIMD ECS.
 *
 * Tracks and manages performance metrics for the ECS system,
 * including memory usage, system execution times, and entity counts.
 *
 * @example
 * ```typescript
 * import { PerformanceMonitor } from './performance-monitor';
 *
 * const monitor = new PerformanceMonitor();
 * monitor.startMonitoring();
 * const metrics = monitor.getMetrics();
 * ```
 *
 * @performance
 * - Efficient metrics collection
 * - Chrome-specific memory API support
 * - Real-time performance tracking
 *
 * @author Reynard ECS Team
 * @since 1.0.0
 */
import { ECSPerformanceMetrics } from "./ecs-interface";
/**
 * Performance monitor for ECS operations.
 *
 * Tracks system execution times, memory usage, and entity counts
 * to provide comprehensive performance metrics.
 */
export declare class PerformanceMonitor {
    private systemExecutionTimes;
    private entityCount;
    private componentCount;
    private memoryMonitoringInterval;
    /**
     * Initialize performance metrics.
     */
    initializeMetrics(): ECSPerformanceMetrics;
    /**
     * Start performance monitoring.
     */
    startMonitoring(): void;
    /**
     * Stop performance monitoring.
     */
    stopMonitoring(): void;
    /**
     * Record system execution time.
     */
    recordSystemTime(executionTime: number): void;
    /**
     * Update entity count.
     */
    updateEntityCount(count: number): void;
    /**
     * Update component count.
     */
    updateComponentCount(count: number): void;
    /**
     * Get current performance metrics.
     */
    getMetrics(): ECSPerformanceMetrics;
    /**
     * Clear all metrics.
     */
    clear(): void;
    /**
     * Dispose of the performance monitor.
     */
    dispose(): void;
}
