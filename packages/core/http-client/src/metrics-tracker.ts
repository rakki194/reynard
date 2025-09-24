/**
 * Metrics Tracker Implementation
 *
 * Tracks HTTP client performance metrics including request counts,
 * response times, and success/error rates.
 */

import { HTTPMetrics, RequestMetrics } from "./types";

export interface MetricsConfig {
  enabled: boolean;
  trackResponseTime: boolean;
  trackRequestCount: boolean;
}

export class MetricsTracker {
  private metrics: HTTPMetrics;
  private config: Required<MetricsConfig>;

  constructor(config: Partial<MetricsConfig> = {}) {
    this.config = {
      enabled: config.enabled ?? true,
      trackResponseTime: config.trackResponseTime ?? true,
      trackRequestCount: config.trackRequestCount ?? true,
    };

    this.metrics = {
      requestCount: 0,
      successCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      circuitBreakerState: "closed",
    };
  }

  /**
   * Record a request start
   */
  recordRequestStart(): RequestMetrics {
    if (!this.config.enabled) {
      return { startTime: Date.now(), retryCount: 0 };
    }

    this.metrics.requestCount++;
    this.metrics.lastRequestTime = Date.now();

    return {
      startTime: Date.now(),
      retryCount: 0,
    };
  }

  /**
   * Record a successful request
   */
  recordSuccess(requestTime: number): void {
    if (!this.config.enabled) return;

    this.metrics.successCount++;
    this.updateAverageResponseTime(requestTime);
  }

  /**
   * Record a failed request
   */
  recordError(requestTime: number): void {
    if (!this.config.enabled) return;

    this.metrics.errorCount++;
    this.updateAverageResponseTime(requestTime);
  }

  /**
   * Update circuit breaker state in metrics
   */
  updateCircuitBreakerState(state: "closed" | "open" | "half-open"): void {
    if (!this.config.enabled) return;
    this.metrics.circuitBreakerState = state;
  }

  /**
   * Get current metrics
   */
  getMetrics(): HTTPMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.metrics = {
      requestCount: 0,
      successCount: 0,
      errorCount: 0,
      averageResponseTime: 0,
      circuitBreakerState: "closed",
    };
  }

  /**
   * Update metrics configuration
   */
  updateConfig(newConfig: Partial<MetricsConfig>): void {
    Object.assign(this.config, newConfig);
  }

  /**
   * Calculate success rate
   */
  getSuccessRate(): number {
    const totalRequests = this.metrics.successCount + this.metrics.errorCount;
    return totalRequests > 0 ? this.metrics.successCount / totalRequests : 0;
  }

  /**
   * Calculate error rate
   */
  getErrorRate(): number {
    const totalRequests = this.metrics.successCount + this.metrics.errorCount;
    return totalRequests > 0 ? this.metrics.errorCount / totalRequests : 0;
  }

  private updateAverageResponseTime(requestTime: number): void {
    if (!this.config.trackResponseTime) return;

    const totalRequests = this.metrics.successCount + this.metrics.errorCount;
    this.metrics.averageResponseTime =
      (this.metrics.averageResponseTime * (totalRequests - 1) + requestTime) / totalRequests;
  }
}
