/**
 * Chart Rendering Composable
 * Handles chart rendering logic and props
 */
import { ChartType } from "../types";
export interface ChartRenderingConfig {
    type: ChartType;
    chartData: () => any;
    chartOptions: () => any;
    width?: number;
    height?: number;
    loading?: boolean;
    emptyMessage?: string;
    enablePerformanceMonitoring?: boolean;
    performanceStats: () => any;
    realTime?: boolean;
    onChartRef: (chart: any) => void;
}
export declare function useChartRendering(config: ChartRenderingConfig): () => {
    type: ChartType;
    data: any;
    options: any;
    width: number;
    height: number;
    loading: boolean | undefined;
    emptyMessage: string | undefined;
    enablePerformanceMonitoring: boolean | undefined;
    performanceStats: any;
    onChartRef: (chart: any) => void;
};
