/**
 * AdvancedChartingDashboard Component
 * Comprehensive dashboard combining all advanced charting components
 */
import { Component } from "solid-js";
import { ChartConfig } from "../types";
import { EmbeddingDistributionData } from "./EmbeddingDistributionChart";
import { ModelUsageData } from "./ModelUsageChart";
import { PCAVarianceData } from "./PCAVarianceChart";
export interface AdvancedChartingDashboardProps {
    /** Dashboard title */
    title?: string;
    /** Model usage data */
    modelUsageData?: Record<string, ModelUsageData>;
    /** Embedding distribution data */
    embeddingDistributionData?: EmbeddingDistributionData;
    /** PCA variance data */
    pcaVarianceData?: PCAVarianceData;
    /** Whether to show loading states */
    showLoading?: boolean;
    /** Custom chart configuration */
    chartConfig?: Partial<ChartConfig>;
    /** Whether to use OKLCH colors */
    useOKLCH?: boolean;
    /** Theme for color generation */
    colorTheme?: string;
    /** Dashboard width */
    width?: number;
    /** Dashboard height */
    height?: number;
}
export declare const AdvancedChartingDashboard: Component<AdvancedChartingDashboardProps>;
