/**
 * Chart Configuration Composable
 * Handles chart configuration setup and management
 */
export function useChartConfiguration(config) {
    return {
        visualization: config.visualization,
        chartStateConfig: {
            type: config.type,
            labels: config.labels,
            datasets: config.datasets,
            realTime: config.realTime,
            updateInterval: config.updateInterval,
            enablePerformanceMonitoring: config.enablePerformanceMonitoring,
        },
        chartDataConfig: {
            type: config.type,
            labels: config.labels,
            datasets: config.datasets,
            useOKLCH: config.useOKLCH,
            colorTheme: config.colorTheme,
            colorGenerator: config.colorGenerator,
            showLegend: config.showLegend,
            showGrid: config.showGrid,
            xAxisLabel: config.xAxisLabel,
            yAxisLabel: config.yAxisLabel,
            title: config.title,
            visualization: config.visualization,
        },
        initializationConfig: {
            enablePerformanceMonitoring: config.enablePerformanceMonitoring,
            visualization: config.visualization,
        },
    };
}
