/**
 * Bar Chart Composable
 * Handles bar chart data processing and configuration
 */
import { createEffect, createSignal } from "solid-js";
import { createBarChartOptions } from "../utils/barChartConfig";
import { processBarChartData } from "../utils/barChartData";
import { useChartRegistration } from "./useChartRegistration";
export const useBarChart = (props) => {
    const { isRegistered } = useChartRegistration();
    const [chartData, setChartData] = createSignal(null);
    const [chartOptions, setChartOptions] = createSignal();
    createEffect(() => {
        const processedData = processBarChartData({
            labels: props.labels,
            datasets: props.datasets,
        });
        setChartData(processedData);
    });
    createEffect(() => {
        const options = createBarChartOptions({
            title: props.title,
            showGrid: props.showGrid ?? true,
            showLegend: props.showLegend ?? true,
            responsive: props.responsive ?? true,
            maintainAspectRatio: props.maintainAspectRatio ?? true,
            horizontal: props.horizontal ?? false,
            stacked: props.stacked ?? false,
            xAxis: props.xAxis,
            yAxis: props.yAxis,
            animation: props.animation,
            tooltip: props.tooltip,
            theme: props.theme,
        });
        setChartOptions(options);
    });
    return {
        isRegistered,
        chartData,
        chartOptions,
    };
};
