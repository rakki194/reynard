/**
 * Pie Chart Component
 * A responsive pie/doughnut chart for proportional data
 */

import {
  Component,
  onMount,
  createSignal,
  createEffect,
  Show,
  splitProps,
  createMemo,
} from "solid-js";
import {
  Chart,
  Title,
  Tooltip,
  Legend,
  DoughnutController,
  PieController,
  ArcElement,
} from "chart.js";
import { Pie, Doughnut } from "solid-chartjs";
import { Dataset, ChartConfig, ReynardTheme } from "../types";
import { getDefaultConfig, generateColors } from "../utils";
import "./PieChart.css";

export interface PieChartProps extends ChartConfig {
  /** Chart labels */
  labels: string[];
  /** Chart data values */
  data: number[];
  /** Chart variant */
  variant?: "pie" | "doughnut";
  /** Doughnut cutout percentage (0-1) */
  cutout?: number;
  /** Custom colors */
  colors?: string[];
  /** Whether to show data values on hover */
  showValues?: boolean;
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
  showLegend: true,
  responsive: true,
  maintainAspectRatio: false,
  variant: "pie" as const,
  cutout: 0.5,
  showValues: true,
  emptyMessage: "No data available",
  theme: "light" as ReynardTheme,
};

export const PieChart: Component<PieChartProps> = (props) => {
  const merged = { ...defaultProps, ...props };
  const [local, others] = splitProps(merged, [
    "labels",
    "data",
    "title",
    "width",
    "height",
    "showLegend",
    "responsive",
    "maintainAspectRatio",
    "variant",
    "cutout",
    "colors",
    "showValues",
    "class",
    "loading",
    "emptyMessage",
    "animation",
    "tooltip",
    "theme",
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
      DoughnutController,
      PieController,
      ArcElement,
    );
    setIsRegistered(true);
  });

  // Process data
  createEffect(() => {
    if (local.labels && local.data && local.data.length > 0) {
      if (local.labels.length === local.data.length) {
        const colors = local.colors || generateColors(local.data.length, 0.8);
        const borderColors =
          local.colors || generateColors(local.data.length, 1);

        const dataset: Dataset = {
          label: "Data",
          data: local.data,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 2,
        };

        setChartData({
          labels: local.labels,
          datasets: [dataset],
        });
      } else {
        setChartData(null);
      }
    } else {
      setChartData(null);
    }
  });

  const getChartOptions = () => {
    const baseConfig = getDefaultConfig(local.variant);

    return {
      ...baseConfig,
      responsive: local.responsive,
      maintainAspectRatio: local.maintainAspectRatio,
      animation: local.animation || {
        duration: 750,
        easing: "easeOutCubic",
      },
      cutout: local.variant === "doughnut" ? `${local.cutout * 100}%` : 0,
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
          position: "right" as const,
          labels: {
            color: "var(--text-primary)",
            usePointStyle: true,
            padding: 20,
            generateLabels: (chart: {
              data: {
                labels?: string[];
                datasets: Array<{
                  data: number[];
                  backgroundColor?: string | string[];
                  borderColor?: string | string[];
                  borderWidth?: number;
                }>;
              };
            }) => {
              const data = chart.data;
              if (data.labels?.length && data.datasets.length) {
                const dataset = data.datasets[0];
                return data.labels.map((label: string, i: number) => {
                  const value = dataset.data[i];
                  const total = dataset.data.reduce(
                    (sum: number, val: number) => sum + val,
                    0,
                  );
                  const percentage = ((value / total) * 100).toFixed(1);

                  return {
                    text: local.showValues ? `${label}: ${percentage}%` : label,
                    fillStyle: dataset.backgroundColor?.[i] || "#000000",
                    strokeStyle:
                      dataset.borderColor?.[i] ||
                      dataset.backgroundColor?.[i] ||
                      "#000000",
                    lineWidth: dataset.borderWidth || 0,
                    hidden: false,
                    index: i,
                  };
                });
              }
              return [];
            },
          },
        },
        tooltip: {
          ...baseConfig.plugins?.tooltip,
          ...local.tooltip,
          callbacks: {
            label: (context: {
              label?: string;
              parsed: number;
              dataset: { data: number[] };
            }) => {
              const label = context.label || "";
              const value = context.parsed;
              const total = context.dataset.data.reduce(
                (sum: number, val: number) => sum + val,
                0,
              );
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: ${value} (${percentage}%)`;
            },
          },
        },
      },
    };
  };

  const getContainerClasses = () => {
    const classes = [
      "reynard-pie-chart",
      `reynard-pie-chart--${local.variant}`,
    ];

    if (local.responsive) {
      classes.push("reynard-pie-chart--responsive");
    } else {
      classes.push("reynard-pie-chart--fixed");
      // Add specific size classes for common dimensions
      if (local.width === 400 && local.height === 300) {
        classes.push("reynard-pie-chart--fixed-400x300");
      } else if (local.width === 600 && local.height === 400) {
        classes.push("reynard-pie-chart--fixed-600x400");
      } else if (local.width === 800 && local.height === 600) {
        classes.push("reynard-pie-chart--fixed-800x600");
      } else if (local.width === 1000 && local.height === 800) {
        classes.push("reynard-pie-chart--fixed-1000x800");
      } else {
        // For custom dimensions, use CSS custom properties
        classes.push("reynard-pie-chart--fixed-custom");
      }
    }

    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };

  const ChartComponent = createMemo(() =>
    local.variant === "doughnut" ? Doughnut : Pie,
  );

  return (
    <div
      class={getContainerClasses()}
      data-width={!local.responsive ? local.width : undefined}
      data-height={!local.responsive ? local.height : undefined}
      role="img"
      aria-label={local.title || `${local.variant} chart`}
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
        {ChartComponent()({
          data: chartData()!,
          options: getChartOptions(),
          width: local.width,
          height: local.height,
        })}
      </Show>
    </div>
  );
};
