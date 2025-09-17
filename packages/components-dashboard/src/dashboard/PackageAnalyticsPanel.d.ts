/**
 * PackageAnalyticsPanel Component
 * Package usage analytics and performance monitoring interface
 */
import { Component } from "solid-js";
export interface PackageAnalyticsPanelProps {
    /** Whether to show performance metrics */
    showPerformance?: boolean;
    /** Whether to show usage statistics */
    showUsage?: boolean;
    /** Whether to show trends */
    showTrends?: boolean;
    /** Auto-refresh interval in milliseconds */
    refreshInterval?: number;
}
export interface PackageAnalytics {
    name: string;
    version: string;
    loadCount: number;
    totalLoadTime: number;
    averageLoadTime: number;
    successRate: number;
    memoryUsage: number;
    peakMemoryUsage: number;
    lastUsed: Date;
    usageFrequency: "high" | "medium" | "low";
    performanceScore: number;
    errorCount: number;
    dependencies: string[];
}
export interface AnalyticsSummary {
    totalPackages: number;
    totalLoads: number;
    averageLoadTime: number;
    overallSuccessRate: number;
    totalMemoryUsage: number;
    peakMemoryUsage: number;
    performanceScore: number;
    errorRate: number;
}
export declare const PackageAnalyticsPanel: Component<PackageAnalyticsPanelProps>;
