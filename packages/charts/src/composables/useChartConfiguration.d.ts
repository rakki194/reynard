/**
 * Chart Configuration Composable
 * Handles chart configuration setup and management
 */
import { ChartType, Dataset } from "../types";
export interface ChartConfigurationConfig {
    type: ChartType;
    labels: string[];
    datasets: Dataset[];
    useOKLCH?: boolean;
    colorTheme?: string;
    colorGenerator?: (theme: string, label: string) => string;
    showLegend?: boolean;
    showGrid?: boolean;
    xAxisLabel?: string;
    yAxisLabel?: string;
    realTime?: boolean;
    updateInterval?: number;
    enablePerformanceMonitoring?: boolean;
    title?: string;
    visualization: {
        generateColors: (count: number, alpha?: number) => string[];
        registerVisualization: () => void;
        unregisterVisualization: () => void;
        stats: () => any;
    };
}
export declare function useChartConfiguration(config: ChartConfigurationConfig): {
    visualization: {
        generateColors: (count: number, alpha?: number) => string[];
        registerVisualization: () => void;
        unregisterVisualization: () => void;
        stats: () => any;
    };
    chartStateConfig: {
        type: ChartType;
        labels: string[];
        datasets: Dataset[];
        realTime: boolean | undefined;
        updateInterval: number | undefined;
        enablePerformanceMonitoring: boolean | undefined;
    };
    chartDataConfig: {
        type: ChartType;
        labels: string[];
        datasets: Dataset[];
        useOKLCH: boolean;
        colorTheme: string;
        colorGenerator: ((theme: string, label: string) => string) | undefined;
        showLegend: boolean | undefined;
        showGrid: boolean | undefined;
        xAxisLabel: string | undefined;
        yAxisLabel: string | undefined;
        title: string | undefined;
        visualization: {
            generateColors: (count: number, alpha?: number) => string[];
            registerVisualization: () => void;
            unregisterVisualization: () => void;
            stats: () => any;
        };
    };
    initializationConfig: {
        enablePerformanceMonitoring: boolean | undefined;
        visualization: {
            generateColors: (count: number, alpha?: number) => string[];
            registerVisualization: () => void;
            unregisterVisualization: () => void;
            stats: () => any;
        };
    };
};
