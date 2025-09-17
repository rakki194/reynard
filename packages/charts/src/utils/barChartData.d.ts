/**
 * Bar Chart Data Processing Utilities
 * Handles data validation and processing for bar charts
 */
import { Dataset } from "../types";
export interface BarChartData {
    labels: string[];
    datasets: Dataset[];
}
export interface BarChartDataOptions {
    labels: string[];
    datasets: Dataset[];
}
export declare const processBarChartData: (options: BarChartDataOptions) => BarChartData | null;
