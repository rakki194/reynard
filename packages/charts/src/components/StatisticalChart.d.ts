/**
 * Statistical Chart Component
 * Advanced statistical visualizations including histograms, box plots, and distributions
 * Based on yipyap's EmbeddingDistributionChart and EmbeddingQualityChart
 */
import { Component } from "solid-js";
import { ChartConfig, ReynardTheme } from "../types";
export interface StatisticalData {
    /** Raw values for histogram */
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
export interface QualityMetric {
    /** Metric name */
    name: string;
    /** Metric value */
    value: number;
    /** Metric unit or description */
    unit?: string;
    /** Whether higher values are better */
    higherIsBetter?: boolean;
    /** Threshold for good quality */
    goodThreshold?: number;
    /** Threshold for warning quality */
    warningThreshold?: number;
    /** Color for the metric */
    color?: string;
}
export interface QualityData {
    /** Overall quality score (0-100) */
    overallScore: number;
    /** Individual quality metrics */
    metrics: QualityMetric[];
    /** Quality assessment */
    assessment: {
        status: "excellent" | "good" | "fair" | "poor";
        issues: string[];
        recommendations: string[];
    };
}
export interface StatisticalChartProps extends ChartConfig {
    /** Chart type */
    type: "histogram" | "boxplot" | "quality-bar" | "quality-gauge";
    /** Statistical data */
    data: StatisticalData | QualityData;
    /** Number of bins for histogram (auto-calculated if not provided) */
    numBins?: number;
    /** Whether to show statistics overlay */
    showStatistics?: boolean;
    /** Whether to show assessment details */
    showAssessment?: boolean;
    /** Color scheme */
    colorScheme?: "default" | "gradient" | "status";
    /** Custom class name */
    class?: string;
    /** Loading state */
    loading?: boolean;
    /** Empty state message */
    emptyMessage?: string;
    /** Theme for the chart */
    theme?: ReynardTheme;
}
export declare const StatisticalChart: Component<StatisticalChartProps>;
