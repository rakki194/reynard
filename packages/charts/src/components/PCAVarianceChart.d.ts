/**
 * PCAVarianceChart Component
 * Principal Component Analysis variance visualization with recommendations
 */
import { Component } from "solid-js";
import { ChartConfig } from "../types";
export interface PCAVarianceData {
    /** Component numbers (1, 2, 3, ...) */
    components: number[];
    /** Explained variance ratio for each component */
    explainedVarianceRatio: number[];
    /** Cumulative explained variance ratio */
    cumulativeVarianceRatio: number[];
    /** Explained variance (not ratio) for each component */
    explainedVariance?: number[];
    /** Optimal component recommendations */
    recommendations?: {
        conservative: number;
        balanced: number;
        comprehensive: number;
        elbowMethod: number;
    };
}
export interface PCAVarianceChartProps extends ChartConfig {
    /** Chart title */
    title: string;
    /** PCA variance data */
    data: PCAVarianceData;
    /** X-axis label */
    xAxisLabel?: string;
    /** Y-axis label */
    yAxisLabel?: string;
    /** Whether to show grid lines */
    showGrid?: boolean;
    /** Whether to show cumulative variance line */
    showCumulative?: boolean;
    /** Whether to show recommendations */
    showRecommendations?: boolean;
    /** Maximum number of components to display */
    maxComponents?: number;
    /** Color for individual variance bars */
    varianceColor?: string;
    /** Color for cumulative variance line */
    cumulativeColor?: string;
    /** Whether to use OKLCH colors */
    useOKLCH?: boolean;
    /** Theme for color generation */
    colorTheme?: string;
    /** Loading state */
    loading?: boolean;
    /** Empty state message */
    emptyMessage?: string;
}
export declare const PCAVarianceChart: Component<PCAVarianceChartProps>;
