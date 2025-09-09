/**
 * Health and Statistics Manager
 *
 * Manages health status and statistics for the annotation service.
 */

import { HealthStatus, ModelUsageStats } from "../types/index.js";

export class HealthStatsManager {
  private stats: {
    totalProcessed: number;
    totalProcessingTime: number;
    activeTasksCount: number;
  } = {
    totalProcessed: 0,
    totalProcessingTime: 0,
    activeTasksCount: 0,
  };

  getHealthStatus(): HealthStatus {
    return {
      isHealthy: true,
      lastHealthCheck: new Date(),
      issues: [],
      performance: {
        averageResponseTime: this.getAverageProcessingTime(),
        errorRate: 0,
        throughput: 0,
      },
    };
  }

  getModelUsageStats(_name: string): ModelUsageStats | null {
    // This would need to be cached or fetched from backend
    return null;
  }

  getTotalProcessed(): number {
    return this.stats.totalProcessed;
  }

  getTotalProcessingTime(): number {
    return this.stats.totalProcessingTime;
  }

  getAverageProcessingTime(): number {
    if (this.stats.totalProcessed === 0) return 0;
    return this.stats.totalProcessingTime / this.stats.totalProcessed;
  }

  getActiveTasksCount(): number {
    return this.stats.activeTasksCount;
  }

  updateStats(processingTime: number): void {
    this.stats.totalProcessed++;
    this.stats.totalProcessingTime += processingTime;
  }

  setActiveTasksCount(count: number): void {
    this.stats.activeTasksCount = count;
  }
}
