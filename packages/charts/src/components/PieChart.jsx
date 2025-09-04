/**
 * Pie Chart Component
 * A responsive pie/doughnut chart for proportional data
 */
import {
  onMount,
  createSignal,
  createEffect,
  Show,
  splitProps,
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
import { getDefaultConfig, generateColors } from "../utils";
const defaultProps = {
  width: 400,
  height: 300,
  showLegend: true,
  responsive: true,
  maintainAspectRatio: false,
  variant: "pie",
  cutout: 0.5,
  showValues: true,
  emptyMessage: "No data available",
  theme: "light",
};
export const PieChart = (props) => {
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
  const [chartData, setChartData] = createSignal(null);
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
        const colors =
          local.colors || generateColors(local.data.length, 0.8, local.theme);
        const borderColors =
          local.colors || generateColors(local.data.length, 1, local.theme);
        const dataset = {
          label: "Data",
          data: local.data,
          backgroundColor: colors,
          borderColor: borderColors,
          borderWidth: 2,
          hoverOffset: 4,
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
      animation: local.animation || baseConfig.animation,
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
          position: "right",
          labels: {
            color: "var(--text-primary)",
            usePointStyle: true,
            padding: 20,
            generateLabels: (chart) => {
              const data = chart.data;
              if (data.labels?.length && data.datasets.length) {
                const dataset = data.datasets[0];
                return data.labels.map((label, i) => {
                  const value = dataset.data[i];
                  const total = dataset.data.reduce((sum, val) => sum + val, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return {
                    text: local.showValues ? `${label}: ${percentage}%` : label,
                    fillStyle: dataset.backgroundColor[i],
                    strokeStyle:
                      dataset.borderColor?.[i] || dataset.backgroundColor[i],
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
            label: (context) => {
              const label = context.label || "";
              const value = context.parsed;
              const total = context.dataset.data.reduce(
                (sum, val) => sum + val,
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
    if (local.class) classes.push(local.class);
    return classes.join(" ");
  };
  const ChartComponent = local.variant === "doughnut" ? Doughnut : Pie;
  return (
    <div
      class={getContainerClasses()}
      style={{
        width: local.responsive ? "100%" : `${local.width}px`,
        height: local.responsive ? "100%" : `${local.height}px`,
        position: "relative",
      }}
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
        <ChartComponent
          data={chartData()}
          options={getChartOptions()}
          width={local.width}
          height={local.height}
        />
      </Show>
    </div>
  );
};
