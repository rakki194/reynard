/**
 * Chart Renderer Component
 * Handles the actual rendering of different chart types with Chart.js integration
 */
import { Component } from "solid-js";
import { ChartType } from "../types";
import "./ChartRenderer.css";
export interface ChartRendererProps {
    type: ChartType;
    data: unknown;
    options: unknown;
    width?: number;
    height?: number;
    loading?: boolean;
    emptyMessage?: string;
    enablePerformanceMonitoring?: boolean;
    performanceStats?: {
        fps: number;
        memoryUsage: number;
        activeVisualizations: number;
    };
    onChartRef?: (chart: unknown) => void;
}
export declare const ChartRenderer: Component<ChartRendererProps>;
