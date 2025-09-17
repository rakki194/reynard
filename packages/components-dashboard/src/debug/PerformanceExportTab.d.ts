/**
 * PerformanceExportTab Component
 * Performance export tab for performance dashboard
 */
import { Component } from "solid-js";
export interface PerformanceExportTabProps {
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
    warnings: Array<{
        type: "critical" | "high" | "medium" | "low";
        message: string;
        value: number;
        threshold: number;
        timestamp: number;
        severity: "critical" | "high" | "medium" | "low";
    }>;
    onExport: () => void;
}
export declare const PerformanceExportTab: Component<PerformanceExportTabProps>;
