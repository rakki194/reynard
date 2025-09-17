/**
 * Chart Rendering Composable
 * Handles chart rendering logic and props
 */
import { defaultChartProps } from "../utils/chartConfig";
export function useChartRendering(config) {
    console.log("🦊 useChartRendering: Called with config", config);
    // Make the result reactive to chart state changes
    const result = () => {
        const chartData = config.chartData();
        const chartOptions = config.chartOptions();
        console.log("🦊 useChartRendering: Getting current chart state", {
            chartData,
            chartOptions,
        });
        return {
            type: config.type,
            data: chartData,
            options: chartOptions,
            width: config.width || defaultChartProps.width,
            height: config.height || defaultChartProps.height,
            loading: config.loading,
            emptyMessage: config.emptyMessage,
            enablePerformanceMonitoring: config.enablePerformanceMonitoring,
            performanceStats: config.performanceStats(),
            onChartRef: (chart) => {
                if (chart && config.realTime) {
                    config.onChartRef(chart);
                }
            },
        };
    };
    console.log("🦊 useChartRendering: Returning reactive render props function");
    return result;
}
