/**
 * Performance Monitoring and Statistics
 *
 * Tracks collision detection performance metrics, maintains statistics,
 * and provides performance analysis and recommendations.
 *
 * @module algorithms/optimization/performanceMonitor
 */
/**
 * Performance monitoring and statistics manager
 */
export class PerformanceMonitor {
    constructor(thresholds) {
        Object.defineProperty(this, "stats", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "performanceHistory", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        Object.defineProperty(this, "thresholds", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.thresholds = thresholds;
        this.stats = {
            totalQueries: 0,
            averageExecutionTime: 0,
            averageMemoryUsage: 0,
            algorithmUsage: {
                naive: 0,
                spatial: 0,
                optimized: 0,
            },
            memoryPoolStats: {
                totalAllocations: 0,
                totalDeallocations: 0,
                poolHits: 0,
                poolMisses: 0,
                memorySaved: 0,
                averageAllocationTime: 0,
                peakPoolUsage: 0,
                currentPoolUsage: 0,
                hitRate: 0,
                allocationReduction: 0,
            },
            performanceHistory: [],
        };
    }
    /**
     * Record a performance measurement
     */
    recordPerformance(algorithm, objectCount, executionTime, memoryUsage, hitRate) {
        const record = {
            timestamp: Date.now(),
            algorithm,
            objectCount,
            executionTime,
            memoryUsage,
            hitRate,
        };
        this.performanceHistory.push(record);
        this.stats.totalQueries++;
        // Keep only recent history
        if (this.performanceHistory.length > 1000) {
            this.performanceHistory = this.performanceHistory.slice(-1000);
        }
        // Update running averages
        this.updateRunningAverages(executionTime, memoryUsage);
        this.updateAlgorithmUsage(algorithm);
    }
    /**
     * Update memory pool statistics
     */
    updateMemoryPoolStats(stats) {
        this.stats.memoryPoolStats = stats;
    }
    /**
     * Get current memory usage
     */
    getCurrentMemoryUsage() {
        return performance.memory?.usedJSHeapSize || 0;
    }
    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        return { ...this.stats };
    }
    /**
     * Check if performance is degraded
     */
    isPerformanceDegraded() {
        return (this.stats.averageExecutionTime > this.thresholds.maxExecutionTime ||
            this.stats.averageMemoryUsage > this.thresholds.maxMemoryUsage ||
            this.stats.memoryPoolStats.hitRate < this.thresholds.minHitRate);
    }
    /**
     * Get performance report
     */
    getPerformanceReport(recommendations) {
        return {
            summary: {
                totalQueries: this.stats.totalQueries,
                averageExecutionTime: this.stats.averageExecutionTime,
                averageMemoryUsage: this.stats.averageMemoryUsage,
                hitRate: this.stats.memoryPoolStats.hitRate,
                isDegraded: this.isPerformanceDegraded(),
            },
            algorithmUsage: this.stats.algorithmUsage,
            memoryPool: this.stats.memoryPoolStats,
            recommendations,
        };
    }
    /**
     * Estimate update frequency based on recent queries
     */
    estimateUpdateFrequency() {
        const now = Date.now();
        const recentQueries = this.performanceHistory.filter((record) => now - record.timestamp < 1000);
        return recentQueries.length;
    }
    /**
     * Reset all statistics
     */
    resetStatistics() {
        this.stats = {
            totalQueries: 0,
            averageExecutionTime: 0,
            averageMemoryUsage: 0,
            algorithmUsage: {
                naive: 0,
                spatial: 0,
                optimized: 0,
            },
            memoryPoolStats: {
                totalAllocations: 0,
                totalDeallocations: 0,
                poolHits: 0,
                poolMisses: 0,
                memorySaved: 0,
                averageAllocationTime: 0,
                peakPoolUsage: 0,
                currentPoolUsage: 0,
                hitRate: 0,
                allocationReduction: 0,
            },
            performanceHistory: [],
        };
        this.performanceHistory = [];
    }
    /**
     * Update running averages
     */
    updateRunningAverages(executionTime, memoryUsage) {
        // Update average execution time
        this.stats.averageExecutionTime =
            (this.stats.averageExecutionTime * (this.stats.totalQueries - 1) +
                executionTime) /
                this.stats.totalQueries;
        // Update average memory usage
        this.stats.averageMemoryUsage =
            (this.stats.averageMemoryUsage * (this.stats.totalQueries - 1) +
                memoryUsage) /
                this.stats.totalQueries;
    }
    /**
     * Update algorithm usage statistics
     */
    updateAlgorithmUsage(algorithm) {
        if (algorithm in this.stats.algorithmUsage) {
            this.stats.algorithmUsage[algorithm]++;
        }
    }
}
