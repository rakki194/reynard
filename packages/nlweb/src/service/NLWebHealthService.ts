/**
 * NLWeb Health Service
 * 
 * Handles health monitoring and status reporting for the NLWeb service.
 */

import type {
  NLWebHealthStatus,
  NLWebConfiguration,
  NLWebEvent,
  NLWebEventEmitter,
} from "../types/index.js";
import type { NLWebRouter } from "../types/index.js";

export class NLWebHealthService {
  constructor(
    private configuration: NLWebConfiguration,
    private eventEmitter: NLWebEventEmitter,
  ) {}

  /**
   * Get service health status
   */
  async getHealthStatus(router: NLWebRouter, initialized: boolean): Promise<NLWebHealthStatus> {
    if (!initialized) {
      return this.getUnhealthyStatus();
    }

    return router.getHealthStatus();
  }

  /**
   * Get unhealthy status when service is not initialized
   */
  private getUnhealthyStatus(): NLWebHealthStatus {
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
  private emitEvent(type: NLWebEvent["type"], data: unknown): void {
    const event: NLWebEvent = {
      type,
      timestamp: Date.now(),
      data,
    };
    this.eventEmitter.emit(event);
  }
}
