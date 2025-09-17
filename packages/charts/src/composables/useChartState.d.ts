/**
 * Chart State Composable
 * Manages chart state and real-time updates
 */
import { ChartType, Dataset } from "../types";
export interface ChartStateConfig {
    type: ChartType;
    labels: string[];
    datasets: Dataset[];
    realTime?: boolean;
    updateInterval?: number;
    enablePerformanceMonitoring?: boolean;
}
export declare function useChartState(config: ChartStateConfig): {
    chartData: import("solid-js").Accessor<any>;
    setChartData: (data: any) => void;
    chartOptions: import("solid-js").Accessor<any>;
    setChartOptions: (options: any) => void;
    chartInstance: import("solid-js").Accessor<any>;
    setChartInstance: import("solid-js").Setter<any>;
    updateChart: (setupData: () => void) => void;
    handleIncrementalUpdate: (chart: any) => void;
};
