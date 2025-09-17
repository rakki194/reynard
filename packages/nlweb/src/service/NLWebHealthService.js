/**
 * NLWeb Health Service
 *
 * Handles health monitoring and status reporting for the NLWeb service.
 */
export class NLWebHealthService {
    constructor(configuration, eventEmitter) {
        Object.defineProperty(this, "configuration", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: configuration
        });
        Object.defineProperty(this, "eventEmitter", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: eventEmitter
        });
    }
    /**
     * Get service health status
     */
    async getHealthStatus(router, initialized) {
        if (!initialized) {
            return this.getUnhealthyStatus();
        }
        return router.getHealthStatus();
    }
    /**
     * Get unhealthy status when service is not initialized
     */
    getUnhealthyStatus() {
        return {
            status: "unhealthy",
            available: false,
            lastCheck: Date.now(),
            performance: {
                totalRequests: 0,
                avgProcessingTime: 0,
                p95ProcessingTime: 0,
                p99ProcessingTime: 0,
                cacheHitRate: 0,
                cacheHits: 0,
                cacheMisses: 0,
                cacheSize: 0,
                maxCacheSize: 0,
            },
            configuration: {
                enabled: this.configuration.enabled,
                canaryEnabled: this.configuration.canary.enabled,
                rollbackEnabled: this.configuration.rollback.enabled,
                performanceMonitoring: this.configuration.performance.enabled,
            },
            error: "Service not initialized",
        };
    }
    /**
     * Emit an event
     */
    emitEvent(type, data) {
        const event = {
            type,
            timestamp: Date.now(),
            data,
        };
        this.eventEmitter.emit(event);
    }
}
