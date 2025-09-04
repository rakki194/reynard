/**
 * Line Chart Component
 * A responsive line chart with time series support
 */

import { Component, onMount, createSignal, createEffect, Show, splitProps } from "solid-js";
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  LineController,
  CategoryScale,
  PointElement,
  LineElement,
  LinearScale,
  TimeScale,
} from "chart.js";
import { Line } from "solid-chartjs";
import { Dataset, ChartConfig, TimeSeriesDataPoint } from "../types";
import { getDefaultConfig, prepareDatasets, processTimeSeriesData, validateChartData } from "../utils";

export interface LineChartProps extends ChartConfig {
  /** Chart labels */
  labels?: string[];
  /** Chart datasets */
  datasets?: Dataset[];
  /** Time series data (alternative to labels/datasets) */
  timeSeriesData?: TimeSeriesDataPoint[];
  /** Maximum number of data points for time series */
  maxDataPoints?: number;
  /** Whether to use time scale */
  useTimeScale?: boolean;
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
  maxDataPoints: 100,
  useTimeScale: false,
  emptyMessage: "No data available",
};

export const LineChart: Component<LineChartProps> = (props) => {
  const merged = { ...defaultProps, ...props };
  const [local, others] = splitProps(merged, [
    "labels",
    "datasets",
    "timeSeriesData",
    "title",
    "width",
    "height",
    "showGrid",
    "showLegend",
    "responsive",
    "maintainAspectRatio",
    "xAxis",
    "yAxis",
    "colors",
    "maxDataPoints",
    "useTimeScale",
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
      LineController,
      CategoryScale,
      PointElement,
      LineElement,
      LinearScale,
      TimeScale
    );
    setIsRegistered(true);
  });

  // Process data
  createEffect(() => {
    if (local.timeSeriesData && local.timeSeriesData.length > 0) {
      // Process time series data
      const processed = processTimeSeriesData(local.timeSeriesData, local.maxDataPoints);
      const datasets = prepareDatasets([{
        label: "Value",
        data: processed.data,
        fill: false,
        tension: 0.4,
      }]);

      setChartData({
        labels: processed.labels,
        datasets,
      });
    } else if (local.labels && local.datasets) {
      // Use provided labels and datasets
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
    const baseConfig = getDefaultConfig("line");
    
    return {
      ...baseConfig,
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
        x: {
          type: local.useTimeScale ? "time" : "category",
          display: local.xAxis?.display !== false,
          title: {
            display: !!local.xAxis?.label,
            text: local.xAxis?.label,
            color: "var(--text-primary)",
          },
          grid: {
            display: local.showGrid && local.xAxis?.grid?.display !== false,
            color: local.xAxis?.grid?.color || "var(--border-color)",
            lineWidth: local.xAxis?.grid?.lineWidth || 1,
          },
          ticks: {
            color: "var(--text-secondary)",
            ...local.xAxis?.ticks,
          },
          min: local.xAxis?.min,
          max: local.xAxis?.max,
        },
        y: {
          type: "linear",
          display: local.yAxis?.display !== false,
          position: local.yAxis?.position || "left",
          title: {
            display: !!local.yAxis?.label,
            text: local.yAxis?.label,
            color: "var(--text-primary)",
          },
          grid: {
            display: local.showGrid && local.yAxis?.grid?.display !== false,
            color: local.yAxis?.grid?.color || "var(--border-color)",
            lineWidth: local.yAxis?.grid?.lineWidth || 1,
          },
          ticks: {
            color: "var(--text-secondary)",
            ...local.yAxis?.ticks,
          },
          min: local.yAxis?.min,
          max: local.yAxis?.max,
          beginAtZero: local.yAxis?.min === undefined,
        },
      },
    };
  };

  const getContainerClasses = () => {
    const classes = ["reynard-line-chart"];
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
        <Line
          data={chartData()!}
          options={getChartOptions()}
          width={local.width}
          height={local.height}
        />
      </Show>
    </div>
  );
};
