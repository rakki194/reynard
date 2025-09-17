/**
 * PerformanceMetricsPanel Component
 * Real-time performance metrics visualization and analysis
 */
import { Component } from "solid-js";
export interface PerformanceMetricsPanelProps {
    /** Performance history data */
    performanceHistory: Array<{
        timestamp: number;
        memoryUsage: number;
        browserResponsiveness: number;
        frameRate: number;
        selectionDuration?: number;
        itemsPerSecond?: number;
        domUpdateCount?: number;
        styleApplicationCount?: number;
        frameDropCount?: number;
    }>;
    /** Auto-refresh interval in milliseconds */
    refreshInterval?: number;
}
export interface PerformanceMetrics {
    averageFrameRate: number;
    averageMemoryUsage: number;
    averageBrowserResponsiveness: number;
    averageSelectionDuration: number;
    averageItemsPerSecond: number;
    totalDomUpdates: number;
    totalStyleApplications: number;
    totalFrameDrops: number;
    performanceScore: number;
}
export declare const PerformanceMetricsPanel: Component<PerformanceMetricsPanelProps>;
