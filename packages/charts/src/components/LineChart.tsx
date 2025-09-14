/**
 * Line Chart Component
 * A responsive line chart with time series support
 */

import {
  CategoryScale,
  Chart,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  TimeScale,
  Title,
  Tooltip,
} from "chart.js";
import { Component, Show, createEffect, createMemo, createSignal, onCleanup, onMount, splitProps } from "solid-js";
import { ChartConfig, ChartOptions, Dataset, ReynardTheme, TimeSeriesDataPoint } from "../types";
import { getDefaultConfig, prepareDatasets, processTimeSeriesData, validateChartData } from "../utils";
import "./LineChart.css";

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
  maxDataPoints: 100,
  useTimeScale: false,
  emptyMessage: "No data available",
  theme: "light" as ReynardTheme,
};

export const LineChart: Component<LineChartProps> = props => {
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
    "theme",
  ]);

  // Process data using createMemo for better performance
  const chartData = createMemo(() => {
    if (local.timeSeriesData && local.timeSeriesData.length > 0) {
      // Process time series data
      const processed = processTimeSeriesData(local.timeSeriesData, local.maxDataPoints);
      const datasets = prepareDatasets([
        {
          label: "Value",
          data: processed.data,
          fill: false,
          tension: 0.4,
        },
      ]);

      return {
        labels: processed.labels,
        datasets,
      };
    } else if (local.labels && local.datasets) {
      // Use provided labels and datasets
      if (validateChartData(local.datasets, local.labels)) {
        const processedDatasets = prepareDatasets(local.datasets);
        return {
          labels: local.labels,
          datasets: processedDatasets,
        };
      }
    }
    return null;
  });

  const [isRegistered, setIsRegistered] = createSignal(false);
  const [chartInstance, setChartInstance] = createSignal<Chart | null>(null);

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

  // Cleanup chart on unmount
  onCleanup(() => {
    const chart = chartInstance();
    if (chart) {
      chart.destroy();
    }
  });

  // Create chart instance
  const createChart = (canvas: HTMLCanvasElement) => {
    if (!isRegistered() || !chartData()) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Destroy existing chart if it exists
    const existingChart = chartInstance();
    if (existingChart) {
      existingChart.destroy();
    }

    const config = {
      type: "line" as const,
      data: chartData()!,
      options: getChartOptions(),
    };

    // Only create chart on client side
    if (typeof window !== "undefined") {
      const newChart = new Chart(ctx, config);
      setChartInstance(newChart);
    }
  };

  // Canvas ref function
  const canvasRef = (canvas: HTMLCanvasElement) => {
    if (canvas && chartData()) {
      createChart(canvas);
    }
  };

  // Update chart when data changes
  createEffect(() => {
    const chart = chartInstance();
    if (chart && chartData()) {
      chart.data = chartData()!;
      chart.update();
    }
  });

  const getChartOptions = () => {
    const baseConfig = getDefaultConfig("line");

    return {
      ...baseConfig,
      responsive: local.responsive,
      maintainAspectRatio: local.maintainAspectRatio,
      animation: local.animation
        ? {
            duration: local.animation.duration,
            easing: local.animation.easing as
              | "linear"
              | "easeInQuad"
              | "easeOutQuad"
              | "easeInOutQuad"
              | "easeInCubic"
              | "easeOutCubic"
              | "easeInOutCubic"
              | "easeInQuart"
              | "easeOutQuart"
              | "easeInOutQuart"
              | "easeInQuint"
              | "easeOutQuint"
              | "easeInOutQuint"
              | "easeInSine"
              | "easeOutSine"
              | "easeInOutSine"
              | "easeInExpo"
              | "easeOutExpo"
              | "easeInOutExpo"
              | "easeInCirc"
              | "easeOutCirc"
              | "easeInOutCirc"
              | "easeInElastic"
              | "easeOutElastic"
              | "easeInOutElastic"
              | "easeInBack"
              | "easeOutBack"
              | "easeInOutBack"
              | "easeInBounce"
              | "easeOutBounce"
              | "easeInOutBounce",
          }
        : (baseConfig as ChartOptions).animation,
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
    if (local.responsive) classes.push("responsive");
    if (!local.responsive) classes.push("fixed-size");
    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };

  const getSizeClass = () => {
    if (local.responsive) return "";

    const area = local.width * local.height;

    if (area <= 60000) return "size-small"; // 300x200
    if (area <= 120000) return "size-medium"; // 400x300
    if (area <= 240000) return "size-large"; // 600x400
    return "size-xl"; // 800x500+
  };

  return (
    <div
      class={`${getContainerClasses()} ${getSizeClass()}`}
      role="img"
      aria-label={local.title || "line chart"}
      {...others}
    >
      <Show when={local.title}>
        <div class="reynard-chart-title">{local.title}</div>
      </Show>
      <div class="reynard-chart-wrapper">
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

        <Show when={!local.loading && chartData()}>
          <div class="reynard-chart-container" style={{ position: "relative", width: "100%", height: "100%" }}>
            <canvas
              ref={canvasRef}
              width={local.width}
              height={local.height}
              style={{ "max-width": "100%", "max-height": "100%" }}
              data-testid="line-chart-canvas"
            />
          </div>
        </Show>
      </div>
    </div>
  );
};
