/**
 * Chart Component
 * Professional unified chart component with OKLCH color integration and real-time capabilities
 */
import { createEffect, splitProps } from "solid-js";
import { useVisualizationEngine } from "../core/VisualizationEngine";
import { ChartRenderer } from "./ChartRenderer";
import { chartPropsToSplit } from "../utils/chartConfig";
import { useChartState } from "../composables/useChartState";
import { useChartData } from "../composables/useChartData";
import { useChartInitialization } from "../composables/useChartInitialization";
import { useChartConfiguration } from "../composables/useChartConfiguration";
import { useChartRendering } from "../composables/useChartRendering";
export const Chart = (props) => {
    console.log("🦊 Chart: Component initialized with props", props);
    const [local, others] = splitProps(props, chartPropsToSplit);
    console.log("🦊 Chart: Split props", { local, others });
    // Initialize visualization engine
    const visualization = useVisualizationEngine({
        theme: local.colorTheme,
        useOKLCH: local.useOKLCH,
    });
    // Get chart configuration
    const config = useChartConfiguration({
        type: local.type,
        labels: local.labels,
        datasets: local.datasets,
        useOKLCH: local.useOKLCH,
        colorTheme: local.colorTheme,
        colorGenerator: local.colorGenerator,
        showLegend: local.showLegend,
        showGrid: local.showGrid,
        xAxisLabel: local.xAxisLabel,
        yAxisLabel: local.yAxisLabel,
        realTime: local.realTime,
        updateInterval: local.updateInterval,
        enablePerformanceMonitoring: local.enablePerformanceMonitoring,
        title: others.title,
        visualization,
    });
    // Initialize chart state
    const chartState = useChartState(config.chartStateConfig);
    // Initialize chart data processing
    const chartData = useChartData(config.chartDataConfig);
    const updateChart = () => {
        console.log("🦊 Chart: updateChart called");
        const { data, options } = chartData.setupChartData();
        console.log("🦊 Chart: Setting chart data", { data, options });
        chartState.setChartData(data);
        chartState.setChartOptions(options);
        console.log("🦊 Chart: Chart state after update", {
            chartData: chartState.chartData(),
            chartOptions: chartState.chartOptions(),
        });
    };
    // Initialize chart lifecycle
    useChartInitialization({
        ...config.initializationConfig,
        onInitialize: updateChart,
    });
    // Update chart when props change
    createEffect(() => {
        updateChart();
    });
    // Get rendering props
    const renderProps = useChartRendering({
        type: local.type,
        chartData: chartState.chartData,
        chartOptions: chartState.chartOptions,
        width: others.width,
        height: others.height,
        loading: local.loading,
        emptyMessage: local.emptyMessage,
        enablePerformanceMonitoring: local.enablePerformanceMonitoring,
        performanceStats: visualization.stats,
        realTime: local.realTime,
        onChartRef: chartState.setChartInstance,
    });
    console.log("🦊 Chart: About to render ChartRenderer with props", renderProps());
    return <ChartRenderer {...renderProps()}/>;
};
