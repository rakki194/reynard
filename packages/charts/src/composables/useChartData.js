/**
 * Chart Data Composable
 * Handles chart data processing and options generation
 */
import { getDefaultChartOptions, enhanceChartOptions, } from "../utils/chartOptions";
import { processDatasets, createChartData } from "../utils/chartDataProcessor";
export function useChartData(config) {
    const setupChartData = () => {
        console.log("🦊 useChartData: setupChartData called with config", config);
        // Process datasets with enhanced color generation
        const enhancedDatasets = processDatasets({
            datasets: config.datasets,
            useOKLCH: config.useOKLCH,
            colorTheme: config.colorTheme,
            colorGenerator: config.colorGenerator,
            visualization: config.visualization,
        });
        console.log("🦊 useChartData: Enhanced datasets", enhancedDatasets);
        const data = createChartData(config.labels, enhancedDatasets);
        console.log("🦊 useChartData: Created chart data", data);
        // Generate chart options
        const theme = {
            text: config.useOKLCH
                ? config.visualization.generateColors(1)[0]
                : "#ffffff",
            background: config.useOKLCH
                ? config.visualization.generateColors(1, 0.8)[0]
                : "rgba(0, 0, 0, 0.8)",
            grid: config.useOKLCH
                ? config.visualization.generateColors(1, 0.3)[0]
                : "rgba(255, 255, 255, 0.1)",
        };
        const baseOptions = getDefaultChartOptions({
            type: config.type,
            theme,
            showLegend: config.showLegend,
            showGrid: config.showGrid,
            xAxisLabel: config.xAxisLabel,
            yAxisLabel: config.yAxisLabel,
        });
        const enhancedOptions = enhanceChartOptions(baseOptions, {
            title: config.title,
            showLegend: config.showLegend,
            showGrid: config.showGrid,
            xAxisLabel: config.xAxisLabel,
            yAxisLabel: config.yAxisLabel,
            type: config.type,
        });
        console.log("🦊 useChartData: Final result", {
            data,
            options: enhancedOptions,
        });
        return { data, options: enhancedOptions };
    };
    return { setupChartData };
}
