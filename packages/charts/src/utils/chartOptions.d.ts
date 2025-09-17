/**
 * Chart Options Generator
 * Generates Chart.js configuration options for different chart types
 */
import { ChartType } from "../types";
export interface ChartTheme {
    text: string;
    background: string;
    grid: string;
}
export interface ChartOptionsConfig {
    type: ChartType;
    theme: ChartTheme;
    showLegend?: boolean;
    showGrid?: boolean;
    title?: string;
    xAxisLabel?: string;
    yAxisLabel?: string;
}
/**
 * Get default chart options for a given type
 */
export declare function getDefaultChartOptions(config: ChartOptionsConfig): any;
/**
 * Enhance chart options with additional configuration
 */
export declare function enhanceChartOptions(baseOptions: any, config: {
    title?: string;
    showLegend?: boolean;
    showGrid?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;
    type: ChartType;
}): any;
