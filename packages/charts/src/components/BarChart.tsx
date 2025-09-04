/**
 * Bar Chart Component
 * A responsive bar chart for categorical data
 */

import { Component, onMount, createSignal, createEffect, Show, splitProps } from "solid-js";
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  BarController,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Bar } from "solid-chartjs";
import { Dataset, ChartConfig } from "../types";
import { getDefaultConfig, prepareDatasets, validateChartData } from "../utils";

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
};

export const BarChart: Component<BarChartProps> = (props) => {
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
  ]);

  const [isRegistered, setIsRegistered] = createSignal(false);
  const [chartData, setChartData] = createSignal<{
    labels: string[];
    datasets: Dataset[];
  } | null>(null);

  // Register Chart.js components on mount
  onMount(() => {
    Chart.register(
      Title,
      Tooltip,
      Legend,
      BarController,
      CategoryScale,
      LinearScale,
      BarElement
    );
    setIsRegistered(true);
  });

  // Process data
  createEffect(() => {
    if (local.labels && local.datasets) {
      if (validateChartData(local.datasets, local.labels)) {
        const processedDatasets = prepareDatasets(local.datasets);
        setChartData({
          labels: local.labels,
          datasets: processedDatasets,
        });
      } else {
        setChartData(null);
      }
    } else {
      setChartData(null);
    }
  });

  const getChartOptions = () => {
    const baseConfig = getDefaultConfig("bar");
    
    // Determine which axis is categorical vs numeric based on orientation
    const categoryAxis = local.horizontal ? "y" : "x";
    const valueAxis = local.horizontal ? "x" : "y";
    
    return {
      ...baseConfig,
      indexAxis: local.horizontal ? "y" : "x",
      responsive: local.responsive,
      maintainAspectRatio: local.maintainAspectRatio,
      animation: local.animation || (baseConfig as any).animation,
      plugins: {
        ...baseConfig.plugins,
        title: {
          display: !!local.title,
          text: local.title,
          color: "var(--text-primary)",
          font: {
            size: 16,
            weight: "600",
          },
          padding: {
            top: 10,
            bottom: 30,
          },
        },
        legend: {
          ...baseConfig.plugins?.legend,
          display: local.showLegend,
        },
        tooltip: {
          ...baseConfig.plugins?.tooltip,
          ...local.tooltip,
        },
      },
      scales: {
        [categoryAxis]: {
          type: "category",
          display: categoryAxis === "x" ? local.xAxis?.display !== false : local.yAxis?.display !== false,
          title: {
            display: categoryAxis === "x" ? !!local.xAxis?.label : !!local.yAxis?.label,
            text: categoryAxis === "x" ? local.xAxis?.label : local.yAxis?.label,
            color: "var(--text-primary)",
          },
          grid: {
            display: false, // Usually hide grid for category axis
          },
          ticks: {
            color: "var(--text-secondary)",
            ...(categoryAxis === "x" ? local.xAxis?.ticks : local.yAxis?.ticks),
          },
          stacked: local.stacked,
        },
        [valueAxis]: {
          type: "linear",
          display: valueAxis === "x" ? local.xAxis?.display !== false : local.yAxis?.display !== false,
          position: valueAxis === "y" ? (local.yAxis?.position || "left") : (local.xAxis?.position || "bottom"),
          title: {
            display: valueAxis === "x" ? !!local.xAxis?.label : !!local.yAxis?.label,
            text: valueAxis === "x" ? local.xAxis?.label : local.yAxis?.label,
            color: "var(--text-primary)",
          },
          grid: {
            display: local.showGrid,
            color: "var(--border-color)",
            lineWidth: 1,
          },
          ticks: {
            color: "var(--text-secondary)",
            ...(valueAxis === "x" ? local.xAxis?.ticks : local.yAxis?.ticks),
          },
          beginAtZero: true,
          stacked: local.stacked,
          min: valueAxis === "x" ? local.xAxis?.min : local.yAxis?.min,
          max: valueAxis === "x" ? local.xAxis?.max : local.yAxis?.max,
        },
      },
    };
  };

  const getContainerClasses = () => {
    const classes = ["reynard-bar-chart"];
    if (local.horizontal) classes.push("reynard-bar-chart--horizontal");
    if (local.stacked) classes.push("reynard-bar-chart--stacked");
    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };

  return (
    <div 
      class={getContainerClasses()}
      style={{
        width: local.responsive ? "100%" : `${local.width}px`,
        height: local.responsive ? "100%" : `${local.height}px`,
        position: "relative",
      }}
      {...others}
    >
      <Show when={local.loading}>
        <div class="reynard-chart-loading">
          <div class="reynard-chart-spinner" />
          <span>Loading chart...</span>
        </div>
      </Show>

      <Show when={!local.loading && !chartData()}>
        <div class="reynard-chart-empty">
          <span>{local.emptyMessage}</span>
        </div>
      </Show>

      <Show when={!local.loading && chartData() && isRegistered()}>
        <Bar
          data={chartData()!}
          options={getChartOptions()}
          width={local.width}
          height={local.height}
        />
      </Show>
    </div>
  );
};
