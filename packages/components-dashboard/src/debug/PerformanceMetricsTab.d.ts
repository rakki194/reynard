/**
 * PerformanceMetricsTab Component
 * Metrics tab for performance dashboard
 */
import { Component } from "solid-js";
export interface PerformanceMetricsTabProps {
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
    refreshInterval?: number;
}
export declare const PerformanceMetricsTab: Component<PerformanceMetricsTabProps>;
