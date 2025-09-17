/**
 * Real-Time Chart Component
 * Advanced real-time chart with live data streaming and performance optimization
 */
import { Component } from "solid-js";
import { ChartConfig, ChartType, ReynardTheme } from "../types";
export interface RealTimeDataPoint {
    /** Timestamp in milliseconds */
    timestamp: number;
    /** Data value */
    value: number;
    /** Optional label */
    label?: string;
    /** Optional metadata */
    metadata?: Record<string, any>;
}
export interface RealTimeChartProps extends ChartConfig {
    /** Chart type */
    type: ChartType;
    /** Real-time data points */
    data: RealTimeDataPoint[];
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
    onDataUpdate?: (data: RealTimeDataPoint[]) => void;
    /** Theme for the chart */
    theme?: ReynardTheme;
    /** Performance monitoring */
    enablePerformanceMonitoring?: boolean;
    /** Data streaming settings */
    streaming?: {
        /** Enable data streaming */
        enabled: boolean;
        /** Stream URL */
        url?: string;
        /** WebSocket connection */
        websocket?: WebSocket;
        /** Data parser function */
        parser?: (data: any) => RealTimeDataPoint;
    };
}
export declare const RealTimeChart: Component<RealTimeChartProps>;
