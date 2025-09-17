/**
 * Chart Component
 * Professional unified chart component with OKLCH color integration and real-time capabilities
 */
import { Component } from "solid-js";
import { ChartConfig, ChartType, Dataset } from "../types";
export interface ChartProps extends ChartConfig {
    /** Chart type */
    type: ChartType;
    /** Chart labels */
    labels: string[];
    /** Chart datasets */
    datasets: Dataset[];
    /** Whether to use OKLCH colors */
    useOKLCH?: boolean;
    /** Theme for color generation */
    colorTheme?: string;
    /** Real-time data updates */
    realTime?: boolean;
    /** Update interval in milliseconds */
    updateInterval?: number;
    /** Custom color generator function */
    colorGenerator?: (theme: string, label: string) => string;
    /** Loading state */
    loading?: boolean;
    /** Empty state message */
    emptyMessage?: string;
    /** Performance monitoring */
    enablePerformanceMonitoring?: boolean;
}
export declare const Chart: Component<ChartProps>;
