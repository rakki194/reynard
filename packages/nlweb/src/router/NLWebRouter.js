/**
 * NLWeb Router
 *
 * Intelligent tool suggestion and routing system for the NLWeb assistant.
 * Provides context-aware tool recommendations based on user queries.
 */
import { createNLWebRouterCache, } from "./NLWebRouterCache.js";
import { createNLWebRouterSuggest, } from "./NLWebRouterSuggest.js";
import { createNLWebRouterScoring, } from "./NLWebRouterScoring.js";
export class NLWebRouter {
    constructor(toolRegistry, config = {}) {
        Object.defineProperty(this, "toolRegistry", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "cache", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "suggestHandler", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "scoring", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "performanceStats", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "healthStatus", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "eventListeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "emergencyRollback", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const { cacheTtl = 300000, // 5 minutes
        maxCacheSize = 1000, healthCheckInterval = 60000, // 1 minute
        enablePerformanceMonitoring = true, } = config;
        this.toolRegistry = toolRegistry;
        this.cache = createNLWebRouterCache(cacheTtl, maxCacheSize);
        this.suggestHandler = createNLWebRouterSuggest();
        this.scoring = createNLWebRouterScoring();
        this.performanceStats = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            cacheHits: 0,
            cacheMisses: 0,
            lastUpdated: Date.now(),
        };
        this.healthStatus = {
            status: "healthy",
            lastChecked: Date.now(),
            uptime: 0,
            performance: this.performanceStats,
        };
        this.eventListeners = new Map();
        this.emergencyRollback = false;
        // Start health monitoring
        if (enablePerformanceMonitoring) {
            this.startHealthMonitoring(healthCheckInterval);
        }
    }
    /**
     * Get tool suggestions based on query
     */
    async suggest(request) {
        return this.suggestHandler.processSuggestion(request, this.cache, this.toolRegistry, this.performanceStats, this.emitEvent.bind(this));
    }
    /**
     * Get health status
     */
    async getHealthStatus() {
        return this.healthStatus;
    }
    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        return this.performanceStats;
    }
    /**
     * Force health check
     */
    async forceHealthCheck() {
        this.healthStatus.lastChecked = Date.now();
        return this.healthStatus;
    }
    /**
     * Enable emergency rollback
     */
    enableEmergencyRollback() {
        this.emergencyRollback = true;
        this.emitEvent("rollback_enabled", {});
    }
    /**
     * Disable emergency rollback
     */
    disableEmergencyRollback() {
        this.emergencyRollback = false;
        this.emitEvent("rollback_disabled", {});
    }
    /**
     * Emit event
     */
    emitEvent(type, data) {
        const listeners = this.eventListeners.get(type);
        if (listeners) {
            listeners.forEach((listener) => listener(data));
        }
    }
    /**
     * Start health monitoring
     */
    startHealthMonitoring(interval) {
        setInterval(() => {
            this.healthStatus.lastChecked = Date.now();
            this.healthStatus.uptime = Date.now() - this.healthStatus.lastChecked;
        }, interval);
    }
}
