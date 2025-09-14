/**
 * ModelUsageChart Component
 * Advanced model usage analytics and performance tracking with OKLCH color integration
 */

import { Component, Show, createMemo } from "solid-js";
import { ChartConfig } from "../types";
import { useVisualizationEngine } from "../core/VisualizationEngine";
import { t } from "../utils/i18n";

export interface ModelUsageData {
  /** Model identifier */
  model_id: string;
  /** Model type (e.g., 'llm', 'embedding', 'diffusion') */
  model_type: string;
  /** Last used timestamp */
  last_used: number;
  /** Total usage count */
  usage_count: number;
  /** Whether model is currently loaded */
  is_loaded: boolean;
  /** VRAM unload timeout in seconds */
  vram_unload_timeout: number;
  /** RAM unload timeout in seconds */
  ram_unload_timeout: number;
}

export interface ModelUsageChartProps extends ChartConfig {
  /** Chart title */
  title: string;
  /** Chart type */
  type: "line" | "bar" | "doughnut" | "pie";
  /** Model usage data */
  data: Record<string, ModelUsageData>;
  /** Whether to show legend */
  showLegend?: boolean;
  /** Custom colors array */
  colors?: string[];
  /** Metric to display */
  metric?: "usage_count" | "last_used" | "timeout_ratio";
  /** Whether to use OKLCH colors */
  useOKLCH?: boolean;
  /** Theme for color generation */
  colorTheme?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
}

const defaultColors = [
  "rgba(255, 99, 132, 0.8)",
  "rgba(54, 162, 235, 0.8)",
  "rgba(255, 206, 86, 0.8)",
  "rgba(75, 192, 192, 0.8)",
  "rgba(153, 102, 255, 0.8)",
  "rgba(255, 159, 64, 0.8)",
];

export const ModelUsageChart: Component<ModelUsageChartProps> = (props) => {
  const visualizationEngine = useVisualizationEngine();

  const chartData = createMemo(() => {
    const dataEntries = Object.entries(props.data);

    if (props.type === "doughnut" || props.type === "pie") {
      // For pie/doughnut charts, show usage count by model type
      const modelTypeData: Record<string, number> = {};

      dataEntries.forEach(([_, info]) => {
        const modelType = info.model_type;
        if (!modelTypeData[modelType]) {
          modelTypeData[modelType] = 0;
        }
        modelTypeData[modelType] += info.usage_count;
      });

      const colors = props.useOKLCH
        ? visualizationEngine.generateOKLCHColors(
            Object.keys(modelTypeData).length,
            props.colorTheme || "dark",
          )
        : props.colors || defaultColors;

      return {
        labels: Object.keys(modelTypeData),
        datasets: [
          {
            label: "Usage Count",
            data: Object.values(modelTypeData),
            backgroundColor: colors,
            borderColor: colors.map((c) => c.replace("0.8", "1")),
            borderWidth: 2,
          },
        ],
      };
    } else {
      // For line/bar charts, show individual model data
      const labels = dataEntries.map(([modelId, _]) => modelId);
      let data: number[];
      let label: string;

      switch (props.metric) {
        case "usage_count":
          data = dataEntries.map(([_, info]) => info.usage_count);
          label = "Usage Count";
          break;
        case "last_used":
          data = dataEntries.map(([_, info]) => {
            const hoursSince = (Date.now() - info.last_used) / (1000 * 60 * 60);
            return Math.round(hoursSince * 100) / 100;
          });
          label = "Hours Since Last Used";
          break;
        case "timeout_ratio":
          data = dataEntries.map(([_, info]) => {
            return (
              Math.round(
                (info.vram_unload_timeout / info.ram_unload_timeout) * 100,
              ) / 100
            );
          });
          label = "VRAM/RAM Timeout Ratio";
          break;
        default:
          data = dataEntries.map(([_, info]) => info.usage_count);
          label = "Usage Count";
      }

      const colors = props.useOKLCH
        ? visualizationEngine.generateOKLCHColors(1, props.colorTheme || "dark")
        : props.colors || defaultColors;

      return {
        labels,
        datasets: [
          {
            label,
            data,
            backgroundColor: colors[0],
            borderColor: colors[0]?.replace("0.8", "1"),
            borderWidth: 2,
            fill: props.type === "line",
            tension: 0.4,
          },
        ],
      };
    }
  });

  const _chartOptions = () => {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: props.title,
          font: {
            size: 16,
            weight: "bold",
          },
        },
        legend: {
          display: props.showLegend !== false,
          position: "top" as const,
        },
        tooltip: {
          mode: "index" as const,
          intersect: false,
          callbacks: {
            label: (context: any) => {
              const label = context.dataset.label || "";
              const value = context.parsed.y || context.parsed;

              if (props.metric === "last_used") {
                return `${label}: ${value} ${t("hoursAgo")}`;
              } else if (props.metric === "timeout_ratio") {
                return `${label}: ${value}`;
              } else {
                return `${label}: ${value}`;
              }
            },
          },
        },
      },
    };

    if (props.type === "line" || props.type === "bar") {
      return {
        ...baseOptions,
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: t("models"),
            },
          },
          y: {
            display: true,
            title: {
              display: true,
              text: chartData().datasets[0].label,
            },
            beginAtZero: true,
          },
        },
      };
    }

    return baseOptions;
  };

  return (
    <div class="model-usage-chart">
      <Show when={props.loading}>
        <div class="chart-loading">
          <div class="loading-spinner"></div>
          <p>Loading model usage data...</p>
        </div>
      </Show>

      <Show when={!props.loading && Object.keys(props.data).length === 0}>
        <div class="chart-empty">
          <p>{props.emptyMessage || "No model usage data available"}</p>
        </div>
      </Show>

      <Show when={!props.loading && Object.keys(props.data).length > 0}>
        <div
          class="reynard-chart-container"
          style={{ position: "relative", width: "100%", height: "100%" }}
        >
          <canvas
            width={props.width || 400}
            height={props.height || 300}
            style={{ "max-width": "100%", "max-height": "100%" }}
            data-testid="model-usage-chart-canvas"
          />
        </div>
      </Show>
    </div>
  );
};
