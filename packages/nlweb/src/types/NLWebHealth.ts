/**
 * NLWeb Health Types
 *
 * Type definitions for NLWeb health monitoring.
 */

export interface NLWebHealthStatus {
  /** Overall health status */
  status: "healthy" | "degraded" | "unhealthy" | "unavailable";
  /** Last health check timestamp */
  lastChecked: number;
  /** System uptime in milliseconds */
  uptime: number;
  /** Performance statistics */
  performance: NLWebPerformanceStats;
  /** Error details if unhealthy */
  errors?: string[];
}

export interface NLWebPerformanceStats {
  /** Total number of requests */
  totalRequests: number;
  /** Number of successful requests */
  successfulRequests: number;
  /** Number of failed requests */
  failedRequests: number;
  /** Average response time in milliseconds */
  averageResponseTime: number;
  /** Number of cache hits */
  cacheHits: number;
  /** Number of cache misses */
  cacheMisses: number;
  /** Last updated timestamp */
  lastUpdated: number;
}

export interface NLWebConfiguration {
  /** Cache TTL in milliseconds */
  cacheTtl: number;
  /** Maximum cache size */
  maxCacheSize: number;
  /** Health check interval in milliseconds */
  healthCheckInterval: number;
  /** Performance monitoring enabled */
  enablePerformanceMonitoring: boolean;
  /** Emergency rollback enabled */
  emergencyRollback: boolean;
  /** Available tools count */
  availableTools: number;
  /** System version */
  version: string;
}
