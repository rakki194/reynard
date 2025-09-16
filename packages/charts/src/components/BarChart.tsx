/**
 * Bar Chart Component
 * A responsive bar chart for categorical data
 */

import { BarController, BarElement, CategoryScale, Chart, Legend, LinearScale, Title, Tooltip } from "chart.js";
import { Component, Show, createEffect, createMemo, createSignal, onCleanup, onMount, splitProps } from "solid-js";
import { ChartConfig, Dataset, ReynardTheme } from "../types";
import { createBarChartOptions } from "../utils/barChartConfig";
import { BarChartData, processBarChartData } from "../utils/barChartData";
import "./BarChart.css";

export interface BarChartProps extends ChartConfig {
  /** Chart labels */
  labels: string[];
  /** Chart datasets */
  datasets: Dataset[];
  /** Whether bars are horizontal */
  horizontal?: boolean;
  /** Whether bars are stacked */
  stacked?: boolean;
  /** Custom class name */
  class?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Theme for the chart */
  theme?: ReynardTheme;
}

const defaultProps = {
  width: 400,
  height: 300,
  showGrid: true,
  showLegend: true,
  responsive: true,
  maintainAspectRatio: false,
  horizontal: false,
  stacked: false,
  emptyMessage: "No data available",
  theme: "light" as ReynardTheme,
};

const getContainerClasses = (horizontal: boolean, stacked: boolean, customClass?: string) => {
  const classes = ["reynard-bar-chart"];
  if (horizontal) classes.push("reynard-bar-chart--horizontal");
  if (stacked) classes.push("reynard-bar-chart--stacked");
  if (customClass) classes.push(customClass);
  return classes.join(" ");
};

const BarChartContent: Component<{
  chartData: BarChartData | null;
  loading: boolean;
  emptyMessage: string;
  width: number;
  height: number;
  options: ReturnType<typeof createBarChartOptions>;
}> = props => {
  const [isRegistered, setIsRegistered] = createSignal(false);
  const [chartInstance, setChartInstance] = createSignal<Chart | null>(null);

  // Register Chart.js components on mount
  onMount(() => {
    Chart.register(Title, Tooltip, Legend, BarController, CategoryScale, LinearScale, BarElement);
    setIsRegistered(true);
  });

  // Cleanup chart on unmount
  onCleanup(() => {
    const chart = chartInstance();
    if (chart) {
      chart.destroy();
    }
  });

  // Create chart instance
  const createChart = (canvas: HTMLCanvasElement) => {
    if (!isRegistered() || !props.chartData) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Destroy existing chart if it exists
    const existingChart = chartInstance();
    if (existingChart) {
      existingChart.destroy();
    }

    const config = {
      type: "bar" as const,
      data: props.chartData,
      options: props.options,
    };

    // Only create chart on client side
    if (typeof window !== "undefined") {
      const newChart = new Chart(ctx, config as any);
      setChartInstance(newChart);
    }
  };

  // Canvas ref function
  const canvasRef = (canvas: HTMLCanvasElement) => {
    if (canvas && props.chartData) {
      createChart(canvas);
    }
  };

  // Update chart when data changes
  createEffect(() => {
    const chart = chartInstance();
    if (chart && props.chartData) {
      chart.data = props.chartData as any;
      chart.update();
    }
  });

  return (
    <>
      <Show when={props.loading}>
        <div class="reynard-chart-loading">
          <div class="reynard-chart-spinner" />
          <span>Loading chart...</span>
        </div>
      </Show>

      <Show when={!props.loading && !props.chartData}>
        <div class="reynard-chart-empty">
          <span>{props.emptyMessage}</span>
        </div>
      </Show>

      <Show when={!props.loading && props.chartData}>
        <div class="reynard-chart-container" style={{ position: "relative", width: "100%", height: "100%" }}>
          <canvas
            ref={canvasRef}
            width={props.width}
            height={props.height}
            style={{ "max-width": "100%", "max-height": "100%" }}
            data-testid="bar-chart-canvas"
          />
        </div>
      </Show>
    </>
  );
};

export const BarChart: Component<BarChartProps> = props => {
  const merged = { ...defaultProps, ...props };
  const [local, others] = splitProps(merged, [
    "labels",
    "datasets",
    "title",
    "width",
    "height",
    "showGrid",
    "showLegend",
    "responsive",
    "maintainAspectRatio",
    "horizontal",
    "stacked",
    "xAxis",
    "yAxis",
    "colors",
    "class",
    "loading",
    "emptyMessage",
    "animation",
    "tooltip",
    "theme",
  ]);

  // Create chart data and options directly
  const chartData = createMemo(() => {
    if (!local.labels || !local.datasets || local.labels.length === 0 || local.datasets.length === 0) {
      return null;
    }

    return processBarChartData({
      labels: local.labels,
      datasets: local.datasets,
    });
  });

  const chartOptions = createMemo(() => {
    const barOptions = createBarChartOptions({
      horizontal: local.horizontal,
      stacked: local.stacked,
      showGrid: local.showGrid,
      showLegend: local.showLegend,
      responsive: local.responsive,
      maintainAspectRatio: local.maintainAspectRatio,
      title: local.title,
      theme: local.theme,
    });

    return barOptions;
  });

  return (
    <div
      class={getContainerClasses(local.horizontal, local.stacked, local.class)}
      classList={{
        "reynard-bar-chart--responsive": local.responsive,
        "reynard-bar-chart--fixed-width": !local.responsive,
      }}
      data-width={local.width}
      data-height={local.height}
      role="img"
      aria-label={local.title || "bar chart"}
      {...others}
    >
      <Show when={local.title}>
        <div class="reynard-chart-title">{local.title}</div>
      </Show>
      <BarChartContent
        chartData={chartData()}
        loading={local.loading || false}
        emptyMessage={local.emptyMessage}
        width={local.width}
        height={local.height}
        options={chartOptions()!}
      />
    </div>
  );
};
