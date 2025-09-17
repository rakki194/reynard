/**
 * PerformanceOverviewTab Component
 * Overview tab for performance dashboard
 */
import { Component } from "solid-js";
export interface PerformanceOverviewTabProps {
    datasetSize: number;
    selectionCount: number;
    memoryUsage: number;
    browserResponsiveness: number;
    frameRate: number;
    isRecording: boolean;
    onToggleRecording: () => void;
    onClearMetrics: () => void;
    onExportData: () => void;
}
export declare const PerformanceOverviewTab: Component<PerformanceOverviewTabProps>;
