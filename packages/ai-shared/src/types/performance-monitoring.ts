/**
 * Performance and Monitoring Types
 * 
 * Defines types for performance metrics, system monitoring,
 * and resource utilization tracking within the Reynard framework.
 */

export interface PerformanceMetrics {
  operation: string
  duration: number
  memoryUsage: number
  cpuUsage: number
  gpuUsage?: number
  timestamp: Date
  metadata: Record<string, any>
}

export interface MemoryInfo {
  total: number
  used: number
  free: number
  available: number
  percentage: number
}

export interface GPUInfo {
  name: string
  memory: {
    total: number
    used: number
    free: number
  }
  utilization: number
  temperature: number
  powerUsage: number
}
