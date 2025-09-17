/**
 * ModelUsageChart Component
 * Advanced model usage analytics and performance tracking with OKLCH color integration
 */
import { Component } from "solid-js";
import { ChartConfig } from "../types";
export interface ModelUsageData {
    /** Model identifier */
    model_id: string;
    /** Model type (e.g., 'llm', 'embedding', 'diffusion') */
    model_type: string;
    /** Last used timestamp */
    last_used: number;
    /** Total usage count */
    usage_count: number;
    /** Whether model is currently loaded */
    is_loaded: boolean;
    /** VRAM unload timeout in seconds */
    vram_unload_timeout: number;
    /** RAM unload timeout in seconds */
    ram_unload_timeout: number;
}
export interface ModelUsageChartProps extends ChartConfig {
    /** Chart title */
    title: string;
    /** Chart type */
    type: "line" | "bar" | "doughnut" | "pie";
    /** Model usage data */
    data: Record<string, ModelUsageData>;
    /** Whether to show legend */
    showLegend?: boolean;
    /** Custom colors array */
    colors?: string[];
    /** Metric to display */
    metric?: "usage_count" | "last_used" | "timeout_ratio";
    /** Whether to use OKLCH colors */
    useOKLCH?: boolean;
    /** Theme for color generation */
    colorTheme?: string;
    /** Loading state */
    loading?: boolean;
    /** Empty state message */
    emptyMessage?: string;
}
export declare const ModelUsageChart: Component<ModelUsageChartProps>;
