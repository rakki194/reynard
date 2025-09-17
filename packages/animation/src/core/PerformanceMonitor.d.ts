/**
 * 🦊 Performance Monitor
 * Advanced performance monitoring and optimization utilities
 */
import type { PerformanceMetrics, PerformanceThresholds } from "../types";
export declare class PerformanceMonitor {
    private metrics;
    private readonly maxMetrics;
    private thresholds;
    private isMonitoring;
    constructor(thresholds?: Partial<PerformanceThresholds>);
    /**
     * Start performance monitoring
     */
    start(): void;
    /**
     * Stop performance monitoring
     */
    stop(): void;
    /**
     * Record a frame's performance metrics
     */
    recordFrame(metrics: Partial<PerformanceMetrics>): void;
    /**
     * Get current performance status
     */
    getStatus(): {
        isHealthy: boolean;
        issues: string[];
        recommendations: string[];
        averageFPS: number;
        stability: number;
    };
    /**
     * Get performance trend over time
     */
    getTrend(): {
        direction: "improving" | "degrading" | "stable";
        change: number;
        confidence: number;
    };
    /**
     * Calculate optimal quality level based on performance
     */
    calculateOptimalQuality(): number;
    private calculateAverageFPS;
    private calculateAverageFrameTime;
    private calculateStability;
    /**
     * Get memory usage (if available)
     */
    getMemoryUsage(): number;
    /**
     * Reset all metrics
     */
    reset(): void;
}
