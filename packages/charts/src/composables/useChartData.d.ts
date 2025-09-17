/**
 * Chart Data Composable
 * Handles chart data processing and options generation
 */
import { ChartType, Dataset } from "../types";
export interface ChartDataConfig {
    type: ChartType;
    labels: string[];
    datasets: Dataset[];
    useOKLCH: boolean;
    colorTheme: string;
    colorGenerator?: (theme: string, label: string) => string;
    showLegend?: boolean;
    showGrid?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;
    title?: string;
    visualization: {
        generateColors: (count: number, alpha?: number) => string[];
    };
}
export declare function useChartData(config: ChartDataConfig): {
    setupChartData: () => {
        data: {
            labels: string[];
            datasets: Dataset[];
        };
        options: any;
    };
};
