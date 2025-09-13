/**
 * Bar Chart Composable
 * Handles bar chart data processing and configuration
 */

import { createSignal, createEffect } from "solid-js";
import { BarChartProps } from "../components/BarChart";
import { useChartRegistration } from "./useChartRegistration";
import { createBarChartOptions } from "../utils/barChartConfig";
import { processBarChartData, BarChartData } from "../utils/barChartData";

export const useBarChart = (props: BarChartProps) => {
  const { isRegistered } = useChartRegistration();
  const [chartData, setChartData] = createSignal<BarChartData | null>(null);
  const [chartOptions, setChartOptions] =
    createSignal<ReturnType<typeof createBarChartOptions>>();

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
      showGrid: props.showGrid,
      showLegend: props.showLegend,
      responsive: props.responsive,
      maintainAspectRatio: props.maintainAspectRatio,
      horizontal: props.horizontal,
      stacked: props.stacked,
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
