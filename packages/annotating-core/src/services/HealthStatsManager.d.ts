/**
 * Health and Statistics Manager
 *
 * Manages health status and statistics for the annotation service.
 */
import { HealthStatus, ModelUsageStats } from "../types/index.js";
export declare class HealthStatsManager {
    private stats;
    getHealthStatus(): HealthStatus;
    getModelUsageStats(_name: string): ModelUsageStats | null;
    getTotalProcessed(): number;
    getTotalProcessingTime(): number;
    getAverageProcessingTime(): number;
    getActiveTasksCount(): number;
    updateStats(processingTime: number): void;
    setActiveTasksCount(count: number): void;
}
