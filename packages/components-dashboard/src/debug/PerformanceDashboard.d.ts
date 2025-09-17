/**
 * PerformanceDashboard Component
 * Main orchestrator for performance monitoring dashboard
 */
import { Component } from "solid-js";
export interface PerformanceDashboardProps {
    isVisible: boolean;
    onClose: () => void;
    datasetSize?: number;
    selectionCount?: number;
    refreshInterval?: number;
}
export interface PerformanceWarning {
    type: "critical" | "high" | "medium" | "low";
    message: string;
    value: number;
    threshold: number;
    timestamp: number;
    severity: "critical" | "high" | "medium" | "low";
}
export interface PerformanceHistory {
    timestamp: number;
    memoryUsage: number;
    browserResponsiveness: number;
    frameRate: number;
    selectionDuration?: number;
    itemsPerSecond?: number;
    domUpdateCount?: number;
    styleApplicationCount?: number;
    frameDropCount?: number;
}
export declare const PerformanceDashboard: Component<PerformanceDashboardProps>;
