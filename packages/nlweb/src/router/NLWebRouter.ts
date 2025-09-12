/**
 * NLWeb Router
 *
 * Intelligent tool suggestion and routing system for the NLWeb assistant.
 * Provides context-aware tool recommendations based on user queries.
 */

import {
  NLWebSuggestionRequest,
  NLWebSuggestionResponse,
  NLWebHealthStatus,
  NLWebPerformanceStats,
} from "../types/index.js";
import { NLWebToolRegistry } from "./NLWebToolRegistry.js";
import { createNLWebRouterCache, NLWebRouterCache } from "./NLWebRouterCache.js";
import { createNLWebRouterSuggest, NLWebRouterSuggest } from "./NLWebRouterSuggest.js";
import { createNLWebRouterScoring, NLWebRouterScoring } from "./NLWebRouterScoring.js";

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

export class NLWebRouter {
  private toolRegistry: NLWebToolRegistry;
  private cache: NLWebRouterCache;
  private suggestHandler: NLWebRouterSuggest;
  private scoring: NLWebRouterScoring;
  private performanceStats: NLWebPerformanceStats;
  private healthStatus: NLWebHealthStatus;
  private eventListeners: Map<string, Array<(data: unknown) => void>>;
  private emergencyRollback: boolean;

  constructor(
    toolRegistry: NLWebToolRegistry,
    config: NLWebRouterConfig = {},
  ) {
    const {
      cacheTtl = 300000, // 5 minutes
      maxCacheSize = 1000,
      healthCheckInterval = 60000, // 1 minute
      enablePerformanceMonitoring = true,
    } = config;

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
  async suggest(
    request: NLWebSuggestionRequest,
  ): Promise<NLWebSuggestionResponse> {
    return this.suggestHandler.processSuggestion(
      request,
      this.cache,
      this.toolRegistry,
      this.performanceStats,
      this.emitEvent.bind(this),
    );
  }

  /**
   * Get health status
   */
  async getHealthStatus(): Promise<NLWebHealthStatus> {
    return this.healthStatus;
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): unknown {
    return this.performanceStats;
  }

  /**
   * Force health check
   */
  async forceHealthCheck(): Promise<NLWebHealthStatus> {
    this.healthStatus.lastChecked = Date.now();
    return this.healthStatus;
  }

  /**
   * Enable emergency rollback
   */
  enableEmergencyRollback(): void {
    this.emergencyRollback = true;
    this.emitEvent("rollback_enabled", {});
  }

  /**
   * Disable emergency rollback
   */
  disableEmergencyRollback(): void {
    this.emergencyRollback = false;
    this.emitEvent("rollback_disabled", {});
  }

  /**
   * Emit event
   */
  private emitEvent(type: string, data: unknown): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      listeners.forEach((listener) => listener(data));
    }
  }

  /**
   * Start health monitoring
   */
  private startHealthMonitoring(interval: number): void {
    setInterval(() => {
      this.healthStatus.lastChecked = Date.now();
      this.healthStatus.uptime = Date.now() - this.healthStatus.lastChecked;
    }, interval);
  }
}