/**
 * Chart Initialization Composable
 * Handles chart setup and lifecycle management
 */
export interface ChartInitializationConfig {
    enablePerformanceMonitoring?: boolean;
    visualization: {
        registerVisualization: () => void;
        unregisterVisualization: () => void;
    };
    onInitialize: () => void;
}
export declare function useChartInitialization(config: ChartInitializationConfig): void;
