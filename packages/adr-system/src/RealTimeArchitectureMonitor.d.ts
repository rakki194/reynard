/**
 * Real-Time Architecture Monitor - Advanced Real-Time Monitoring and Alerting System
 *
 * This module provides comprehensive real-time monitoring of architectural compliance,
 * dependency health, and performance patterns with intelligent alerting.
 */
import { EventEmitter } from "events";
export interface MonitoringEvent {
    id: string;
    type: "violation" | "improvement" | "alert" | "metric" | "trend";
    severity: "info" | "warning" | "error" | "critical";
    timestamp: string;
    source: string;
    message: string;
    data: any;
    metadata: {
        filePath?: string;
        lineNumber?: number;
        category: string;
        tags: string[];
    };
}
export interface ArchitectureMetric {
    name: string;
    value: number;
    unit: string;
    timestamp: string;
    category: "compliance" | "performance" | "quality" | "security";
    trend: "improving" | "declining" | "stable";
    threshold: {
        warning: number;
        critical: number;
    };
    metadata: {
        description: string;
        impact: string;
        recommendations: string[];
    };
}
export interface MonitoringAlert {
    id: string;
    type: "threshold" | "anomaly" | "violation" | "trend";
    severity: "low" | "medium" | "high" | "critical";
    title: string;
    description: string;
    timestamp: string;
    source: string;
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
export interface MonitoringDashboard {
    overallHealth: number;
    metrics: ArchitectureMetric[];
    alerts: MonitoringAlert[];
    trends: {
        compliance: number[];
        performance: number[];
        quality: number[];
        security: number[];
    };
    topIssues: MonitoringEvent[];
    recommendations: string[];
    lastUpdated: string;
}
export declare class RealTimeArchitectureMonitor extends EventEmitter {
    private readonly codebasePath;
    private readonly monitoringInterval;
    private readonly alertThresholds;
    private readonly eventHistory;
    private readonly metricsHistory;
    private readonly activeAlerts;
    private readonly watchers;
    private monitoringActive;
    private monitoringTimer?;
    private modularityChecker;
    private dependencyAnalyzer;
    private interfaceValidator;
    private typeSafetyCompliance;
    private performanceDetector;
    constructor(codebasePath: string, monitoringInterval?: number);
    /**
     * Start real-time monitoring
     */
    startMonitoring(): Promise<void>;
    /**
     * Stop real-time monitoring
     */
    stopMonitoring(): Promise<void>;
    /**
     * Get current monitoring dashboard
     */
    getDashboard(): Promise<MonitoringDashboard>;
    /**
     * Get monitoring events in a time range
     */
    getEventsInRange(startDate: Date, endDate: Date): MonitoringEvent[];
    /**
     * Get active alerts
     */
    getActiveAlerts(): MonitoringAlert[];
    /**
     * Resolve an alert
     */
    resolveAlert(alertId: string, resolvedBy: string): void;
    /**
     * Set alert threshold for a metric
     */
    setAlertThreshold(metricName: string, warning: number, critical: number): void;
    /**
     * Get metric history
     */
    getMetricHistory(metricName: string, hours?: number): ArchitectureMetric[];
    private startFileWatching;
    private startPeriodicMonitoring;
    private performInitialAnalysis;
    private performPeriodicAnalysis;
    private handleFileChange;
    private collectMetrics;
    private checkThresholdViolations;
    private checkForAlerts;
    private calculateTrend;
    private calculateTrends;
    private getTopIssues;
    private generateRecommendations;
    private calculateOverallHealth;
    private updateMetricsHistory;
    private createInitialMetrics;
    private discoverFiles;
    private getFileType;
    private determineSeverity;
    private initializeAlertThresholds;
    private generateEventId;
    private generateAlertId;
}
