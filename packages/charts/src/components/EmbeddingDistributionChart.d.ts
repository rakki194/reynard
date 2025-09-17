/**
 * EmbeddingDistributionChart Component
 * Advanced embedding distribution analysis with histogram and box plot visualization
 */
import { Component } from "solid-js";
import { ChartConfig } from "../types";
export interface EmbeddingDistributionData {
    /** Embedding values for histogram */
    values: number[];
    /** Bin edges for histogram */
    bins?: number[];
    /** Bin counts for histogram */
    binCounts?: number[];
    /** Statistics for box plot */
    statistics?: {
        min: number;
        q1: number;
        median: number;
        q3: number;
        max: number;
        mean: number;
        std: number;
    };
}
export interface EmbeddingDistributionChartProps extends ChartConfig {
    /** Chart title */
    title: string;
    /** Chart type */
    type: "histogram" | "boxplot";
    /** Embedding distribution data */
    data: EmbeddingDistributionData;
    /** X-axis label */
    xAxisLabel?: string;
    /** Y-axis label */
    yAxisLabel?: string;
    /** Number of bins for histogram (auto-calculated if not provided) */
    numBins?: number;
    /** Whether to show grid lines */
    showGrid?: boolean;
    /** Color for the chart */
    color?: string;
    /** Whether to show statistics overlay */
    showStatistics?: boolean;
    /** Whether to use OKLCH colors */
    useOKLCH?: boolean;
    /** Theme for color generation */
    colorTheme?: string;
    /** Loading state */
    loading?: boolean;
    /** Empty state message */
    emptyMessage?: string;
}
export declare const EmbeddingDistributionChart: Component<EmbeddingDistributionChartProps>;
