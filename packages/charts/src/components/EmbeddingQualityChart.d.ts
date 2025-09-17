/**
 * Embedding Quality Chart Component
 *
 * Visualizes embedding quality metrics and assessments.
 * Ported from Yipyap's EmbeddingQualityChart with Reynard integration.
 */
import { Component } from "solid-js";
import { ChartConfig, ReynardTheme } from "../types";
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
export interface EmbeddingQualityData {
    /** Overall quality score (0-100) */
    overall_score: number;
    /** Individual quality metrics */
    metrics: QualityMetric[];
    /** Quality assessment */
    assessment: {
        status: "excellent" | "good" | "fair" | "poor";
        issues: string[];
        recommendations: string[];
    };
}
export interface EmbeddingQualityChartProps extends ChartConfig {
    /** Chart title */
    title: string;
    /** Chart type */
    type: "quality-bar" | "quality-gauge" | "quality-radar";
    /** Embedding quality data */
    data: EmbeddingQualityData;
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
export declare const EmbeddingQualityChart: Component<EmbeddingQualityChartProps>;
