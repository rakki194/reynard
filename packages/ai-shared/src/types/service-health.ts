/**
 * Service Health and Status Types
 * 
 * Defines types for monitoring service health, status, and performance metrics
 * across AI/ML services in the Reynard framework.
 */

export enum ServiceStatus {
  STOPPED = 'stopped',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  ERROR = 'error',
  UNKNOWN = 'unknown'
}

export enum ServiceHealth {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown'
}

export interface ServiceHealthInfo {
  status: ServiceStatus
  health: ServiceHealth
  lastCheck: Date
  uptime: number
  memoryUsage: number
  cpuUsage: number
  errorCount: number
  lastError?: string
  metadata: Record<string, any>
}

export type HealthCheckCallback = () => Promise<ServiceHealthInfo>
