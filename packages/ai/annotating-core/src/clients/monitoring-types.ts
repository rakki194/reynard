/**
 * Monitoring and Health Types for Caption Generation
 *
 * Defines types for system monitoring, health checks, and performance metrics.
 * These types ensure type safety when working with system statistics and health status.
 */

// Performance metrics for system monitoring
export interface PerformanceMetrics {
  average_response_time: number;
  error_rate: number;
  throughput: number;
}

// Health status details
export interface HealthDetails {
  is_healthy: boolean;
  last_health_check?: number;
  issues: string[];
  performance: PerformanceMetrics;
}

// Queue status information
export interface QueueStatus {
  total_queued: number;
  queued_by_model: Record<string, number>;
  average_wait_time: number;
  oldest_request?: number;
}

// Circuit breaker state for fault tolerance
export interface CircuitBreakerState {
  is_open: boolean;
  failure_count: number;
  last_failure_time?: number;
  next_attempt_time?: number;
}

// Usage statistics for models
export interface UsageStats {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  average_processing_time: number;
  last_used: number;
}
