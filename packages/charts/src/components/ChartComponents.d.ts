/**
 * Chart Component Sub-components
 * Reusable components for the chart renderer
 */
import { Component } from "solid-js";
import { ChartType } from "../types";
export declare const getTestId: (type: ChartType) => "line-chart-canvas" | "bar-chart-canvas" | "doughnut-chart-canvas" | "pie-chart-canvas" | "chart-canvas";
export declare const LoadingOverlay: Component<{
    loading: boolean;
}>;
export declare const EmptyState: Component<{
    loading: boolean;
    data: unknown;
    height?: number;
    emptyMessage?: string;
}>;
export declare const PerformanceOverlay: Component<{
    enablePerformanceMonitoring?: boolean;
    performanceStats?: {
        fps: number;
        memoryUsage: number;
        activeVisualizations: number;
    };
}>;
