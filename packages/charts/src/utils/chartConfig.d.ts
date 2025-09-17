/**
 * Chart Configuration Utilities
 * Handles Chart.js registration and configuration setup
 */
/**
 * Register all Chart.js components
 */
export declare function registerChartComponents(): void;
/**
 * Check if Chart.js components are registered
 */
export declare function isChartRegistered(): boolean;
/**
 * Default chart props configuration
 */
export declare const defaultChartProps: {
    readonly width: 400;
    readonly height: 300;
    readonly showGrid: true;
    readonly showLegend: true;
    readonly useOKLCH: true;
    readonly colorTheme: "dark";
    readonly realTime: false;
    readonly updateInterval: 1000;
    readonly loading: false;
    readonly emptyMessage: "No data available";
    readonly enablePerformanceMonitoring: true;
};
/**
 * Chart props that should be split from others
 */
export declare const chartPropsToSplit: readonly ["type", "labels", "datasets", "useOKLCH", "colorTheme", "realTime", "updateInterval", "colorGenerator", "loading", "emptyMessage", "enablePerformanceMonitoring", "showLegend", "showGrid", "xAxisLabel", "yAxisLabel"];
