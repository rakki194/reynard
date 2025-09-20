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
export class PerformanceMonitor {
  private systemExecutionTimes: number[] = [];
  private entityCount: number = 0;
  private componentCount: number = 0;
  private memoryMonitoringInterval: NodeJS.Timeout | null = null;

  /**
   * Initialize performance metrics.
   */
  initializeMetrics(): ECSPerformanceMetrics {
    return {
      entityCount: 0,
      componentCount: 0,
      averageSystemTime: 0,
      memoryUsage: 0,
      performanceMode: "wasm-simd",
    };
  }

  /**
   * Start performance monitoring.
   */
  startMonitoring(): void {
    // Monitor memory usage (Chrome-specific API)
    if (typeof performance !== "undefined" && "memory" in performance) {
      const perfMemory = (performance as Record<string, unknown>).memory;
      if (perfMemory) {
        this.memoryMonitoringInterval = setInterval(() => {
          // Memory monitoring logic would go here
        }, 1000);
      }
    }
  }

  /**
   * Stop performance monitoring.
   */
  stopMonitoring(): void {
    if (this.memoryMonitoringInterval) {
      clearInterval(this.memoryMonitoringInterval);
      this.memoryMonitoringInterval = null;
    }
  }

  /**
   * Record system execution time.
   */
  recordSystemTime(executionTime: number): void {
    this.systemExecutionTimes.push(executionTime);

    // Keep only the last 100 execution times for averaging
    if (this.systemExecutionTimes.length > 100) {
      this.systemExecutionTimes.shift();
    }
  }

  /**
   * Update entity count.
   */
  updateEntityCount(count: number): void {
    this.entityCount = count;
  }

  /**
   * Update component count.
   */
  updateComponentCount(count: number): void {
    this.componentCount = count;
  }

  /**
   * Get current performance metrics.
   */
  getMetrics(): ECSPerformanceMetrics {
    const averageSystemTime =
      this.systemExecutionTimes.length > 0
        ? this.systemExecutionTimes.reduce((sum, time) => sum + time, 0) / this.systemExecutionTimes.length
        : 0;

    let memoryUsage = 0;
    // Update memory usage if available (Chrome-specific API)
    if (typeof performance !== "undefined" && "memory" in performance) {
      const perfMemory = (performance as Record<string, unknown>).memory;
      if (perfMemory) {
        memoryUsage = (perfMemory as Record<string, unknown>).usedJSHeapSize as number;
      }
    }

    return {
      entityCount: this.entityCount,
      componentCount: this.componentCount,
      averageSystemTime,
      memoryUsage,
      performanceMode: "wasm-simd",
    };
  }

  /**
   * Clear all metrics.
   */
  clear(): void {
    this.systemExecutionTimes = [];
    this.entityCount = 0;
    this.componentCount = 0;
  }

  /**
   * Dispose of the performance monitor.
   */
  dispose(): void {
    this.stopMonitoring();
    this.clear();
  }
}
