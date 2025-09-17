/**
 * Time Series Chart Component
 * Advanced real-time chart with automatic data management
 */
import "chartjs-adapter-date-fns";
import { Component } from "solid-js";
import { ChartConfig, ReynardTheme, TimeSeriesDataPoint } from "../types";
import "./TimeSeriesChart.css";
export interface TimeSeriesChartProps extends ChartConfig {
    /** Time series data */
    data: TimeSeriesDataPoint[];
    /** Maximum number of data points to display */
    maxDataPoints?: number;
    /** Auto-update interval in milliseconds */
    updateInterval?: number;
    /** Whether to auto-scroll to latest data */
    autoScroll?: boolean;
    /** Time range to display (in milliseconds) */
    timeRange?: number;
    /** Data aggregation interval (in milliseconds) */
    aggregationInterval?: number;
    /** Whether to render as stepped line */
    stepped?: boolean;
    /** Line tension (0-1) */
    tension?: number;
    /** Whether to fill area under the line */
    fill?: boolean;
    /** Custom data point colors */
    pointColors?: (value: number, timestamp: number) => string;
    /** Value formatter */
    valueFormatter?: (value: number) => string;
    /** Custom class name */
    class?: string;
    /** Loading state */
    loading?: boolean;
    /** Empty state message */
    emptyMessage?: string;
    /** Real-time data callback */
    onDataUpdate?: (data: TimeSeriesDataPoint[]) => void;
    /** Theme for the chart */
    theme?: ReynardTheme;
}
export declare const TimeSeriesChart: Component<TimeSeriesChartProps>;
