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
/**
 * Performance monitor for ECS operations.
 *
 * Tracks system execution times, memory usage, and entity counts
 * to provide comprehensive performance metrics.
 */
export class PerformanceMonitor {
    constructor() {
        Object.defineProperty(this, "systemExecutionTimes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "entityCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "componentCount", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "memoryMonitoringInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
    }
    /**
     * Initialize performance metrics.
     */
    initializeMetrics() {
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
    startMonitoring() {
        // Monitor memory usage (Chrome-specific API)
        if (typeof performance !== "undefined" && "memory" in performance) {
            const perfMemory = performance.memory;
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
    stopMonitoring() {
        if (this.memoryMonitoringInterval) {
            clearInterval(this.memoryMonitoringInterval);
            this.memoryMonitoringInterval = null;
        }
    }
    /**
     * Record system execution time.
     */
    recordSystemTime(executionTime) {
        this.systemExecutionTimes.push(executionTime);
        // Keep only the last 100 execution times for averaging
        if (this.systemExecutionTimes.length > 100) {
            this.systemExecutionTimes.shift();
        }
    }
    /**
     * Update entity count.
     */
    updateEntityCount(count) {
        this.entityCount = count;
    }
    /**
     * Update component count.
     */
    updateComponentCount(count) {
        this.componentCount = count;
    }
    /**
     * Get current performance metrics.
     */
    getMetrics() {
        const averageSystemTime = this.systemExecutionTimes.length > 0
            ? this.systemExecutionTimes.reduce((sum, time) => sum + time, 0) /
                this.systemExecutionTimes.length
            : 0;
        let memoryUsage = 0;
        // Update memory usage if available (Chrome-specific API)
        if (typeof performance !== "undefined" && "memory" in performance) {
            const perfMemory = performance.memory;
            if (perfMemory) {
                memoryUsage = perfMemory
                    .usedJSHeapSize;
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
    clear() {
        this.systemExecutionTimes = [];
        this.entityCount = 0;
        this.componentCount = 0;
    }
    /**
     * Dispose of the performance monitor.
     */
    dispose() {
        this.stopMonitoring();
        this.clear();
    }
}
