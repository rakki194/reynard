/**
 * Health and Statistics Manager
 *
 * Manages health status and statistics for the annotation service.
 */
export class HealthStatsManager {
    constructor() {
        Object.defineProperty(this, "stats", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {
                totalProcessed: 0,
                totalProcessingTime: 0,
                activeTasksCount: 0,
            }
        });
    }
    getHealthStatus() {
        return {
            isHealthy: true,
            lastHealthCheck: new Date(),
            issues: [],
            performance: {
                averageResponseTime: this.getAverageProcessingTime(),
                errorRate: 0,
                throughput: 0,
            },
        };
    }
    getModelUsageStats(_name) {
        // This would need to be cached or fetched from backend
        return null;
    }
    getTotalProcessed() {
        return this.stats.totalProcessed;
    }
    getTotalProcessingTime() {
        return this.stats.totalProcessingTime;
    }
    getAverageProcessingTime() {
        if (this.stats.totalProcessed === 0)
            return 0;
        return this.stats.totalProcessingTime / this.stats.totalProcessed;
    }
    getActiveTasksCount() {
        return this.stats.activeTasksCount;
    }
    updateStats(processingTime) {
        this.stats.totalProcessed++;
        this.stats.totalProcessingTime += processingTime;
    }
    setActiveTasksCount(count) {
        this.stats.activeTasksCount = count;
    }
}
