/**
 * Performance Pattern Monitor - Real-Time Performance Monitoring and Alerting
 *
 * This module provides continuous monitoring of performance patterns,
 * real-time detection of performance regressions, and intelligent alerting.
 */
import { EventEmitter } from "events";
export interface PerformanceMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: string;
    category: "cpu" | "memory" | "io" | "network" | "database" | "rendering";
    threshold: {
        warning: number;
        critical: number;
    };
    trend: "improving" | "declining" | "stable";
    metadata: {
        filePath?: string;
        functionName?: string;
        lineNumber?: number;
        description: string;
        impact: string;
    };
}
export interface PerformanceAlert {
    id: string;
    type: "threshold" | "regression" | "anomaly" | "trend";
    severity: "low" | "medium" | "high" | "critical";
    title: string;
    description: string;
    timestamp: string;
    source: string;
    metric: PerformanceMetric;
    data: any;
    actions: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    resolved: boolean;
    resolvedAt?: string;
    resolvedBy?: string;
}
export interface PerformanceBaseline {
    metricName: string;
    baselineValue: number;
    standardDeviation: number;
    sampleSize: number;
    lastUpdated: string;
    confidence: number;
}
export interface PerformanceReport {
    overallPerformance: number;
    metrics: PerformanceMetric[];
    alerts: PerformanceAlert[];
    baselines: Map<string, PerformanceBaseline>;
    trends: {
        cpu: number[];
        memory: number[];
        io: number[];
        network: number[];
        database: number[];
        rendering: number[];
    };
    topIssues: PerformanceAlert[];
    recommendations: string[];
    lastUpdated: string;
}
export declare class PerformancePatternMonitor extends EventEmitter {
    private readonly codebasePath;
    private readonly monitoringInterval;
    private readonly performanceDetector;
    private readonly metricHistory;
    private readonly activeAlerts;
    private readonly baselines;
    private readonly alertThresholds;
    private monitoringActive;
    private monitoringTimer?;
    constructor(codebasePath: string, monitoringInterval?: number);
    /**
     * Start performance pattern monitoring
     */
    startMonitoring(): Promise<void>;
    /**
     * Stop performance pattern monitoring
     */
    stopMonitoring(): Promise<void>;
    /**
     * Get current performance report
     */
    getPerformanceReport(): Promise<PerformanceReport>;
    /**
     * Get performance metrics for a specific time range
     */
    getMetricsInRange(metricName: string, startDate: Date, endDate: Date): PerformanceMetric[];
    /**
     * Get active performance alerts
     */
    getActiveAlerts(): PerformanceAlert[];
    /**
     * Resolve a performance alert
     */
    resolveAlert(alertId: string, resolvedBy: string): void;
    /**
     * Set performance alert threshold
     */
    setAlertThreshold(metricName: string, warning: number, critical: number): void;
    /**
     * Update performance baseline
     */
    updateBaseline(metricName: string, value: number): void;
    /**
     * Detect performance regression
     */
    detectPerformanceRegression(metricName: string, currentValue: number): boolean;
    private startPeriodicMonitoring;
    private performInitialAnalysis;
    private performPeriodicAnalysis;
    private collectPerformanceMetrics;
    private collectCPUMetrics;
    private collectMemoryMetrics;
    private collectIOMetrics;
    private collectNetworkMetrics;
    private collectDatabaseMetrics;
    private collectRenderingMetrics;
    private checkThresholdViolations;
    private checkPerformanceRegressions;
    private calculateTrend;
    private calculateTrends;
    private getTopIssues;
    private generateRecommendations;
    private calculateOverallPerformance;
    private updateMetricsHistory;
    private createInitialMetrics;
    private calculateCPUScore;
    private calculateMemoryScore;
    private calculateIOScore;
    private simulateNetworkLatency;
    private simulateNetworkThroughput;
    private simulateDatabaseQueryTime;
    private simulateDatabaseConnectionPool;
    private simulateRenderTime;
    private simulateFrameRate;
    private initializeAlertThresholds;
    private initializeBaselines;
    private generateAlertId;
}
