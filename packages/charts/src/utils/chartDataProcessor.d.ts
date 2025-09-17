/**
 * Chart Data Processor
 * Handles dataset processing and color generation for charts
 */
import { Dataset } from "../types";
export interface ColorGenerator {
    generateColors: (count: number, alpha?: number) => string[];
}
export interface DataProcessorConfig {
    datasets: Dataset[];
    useOKLCH: boolean;
    colorTheme: string;
    colorGenerator?: (theme: string, label: string) => string;
    visualization: ColorGenerator;
}
/**
 * Process datasets with enhanced color generation
 */
export declare function processDatasets(config: DataProcessorConfig): Dataset[];
/**
 * Create chart data object
 */
export declare function createChartData(labels: string[], datasets: Dataset[]): {
    labels: string[];
    datasets: Dataset[];
};
/**
 * Update chart data incrementally for real-time updates
 */
export declare function updateChartDataIncremental(chart: any, labels: string[], datasets: Dataset[]): void;
