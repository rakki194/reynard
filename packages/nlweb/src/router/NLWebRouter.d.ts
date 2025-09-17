/**
 * NLWeb Router
 *
 * Intelligent tool suggestion and routing system for the NLWeb assistant.
 * Provides context-aware tool recommendations based on user queries.
 */
import { NLWebSuggestionRequest, NLWebSuggestionResponse, NLWebHealthStatus } from "../types/index.js";
import { NLWebToolRegistry } from "./NLWebToolRegistry.js";
export interface NLWebRouterConfig {
    /** Cache TTL in milliseconds */
    cacheTtl?: number;
    /** Maximum cache size */
    maxCacheSize?: number;
    /** Health check interval in milliseconds */
    healthCheckInterval?: number;
    /** Performance monitoring enabled */
    enablePerformanceMonitoring?: boolean;
}
export declare class NLWebRouter {
    private toolRegistry;
    private cache;
    private suggestHandler;
    private scoring;
    private performanceStats;
    private healthStatus;
    private eventListeners;
    private emergencyRollback;
    constructor(toolRegistry: NLWebToolRegistry, config?: NLWebRouterConfig);
    /**
     * Get tool suggestions based on query
     */
    suggest(request: NLWebSuggestionRequest): Promise<NLWebSuggestionResponse>;
    /**
     * Get health status
     */
    getHealthStatus(): Promise<NLWebHealthStatus>;
    /**
     * Get performance statistics
     */
    getPerformanceStats(): unknown;
    /**
     * Force health check
     */
    forceHealthCheck(): Promise<NLWebHealthStatus>;
    /**
     * Enable emergency rollback
     */
    enableEmergencyRollback(): void;
    /**
     * Disable emergency rollback
     */
    disableEmergencyRollback(): void;
    /**
     * Emit event
     */
    private emitEvent;
    /**
     * Start health monitoring
     */
    private startHealthMonitoring;
}
