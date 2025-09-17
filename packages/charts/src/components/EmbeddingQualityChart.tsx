/**
 * Embedding Quality Chart Component
 *
 * Visualizes embedding quality metrics and assessments.
 * Ported from Yipyap's EmbeddingQualityChart with Reynard integration.
 */

import { Component, createSignal, createEffect, onMount, Show, splitProps } from "solid-js";
import { Chart } from "./Chart";
import { useVisualizationEngine } from "../core/VisualizationEngine";
import { ChartConfig, Dataset, ReynardTheme } from "../types";
import { t, getLoadingMessage } from "../utils/i18n";

export interface QualityMetric {
  /** Metric name */
  name: string;
  /** Metric value */
  value: number;
  /** Metric unit or description */
  unit?: string;
  /** Whether higher values are better */
  higherIsBetter?: boolean;
  /** Threshold for good quality */
  goodThreshold?: number;
  /** Threshold for warning quality */
  warningThreshold?: number;
  /** Color for the metric */
  color?: string;
}

export interface EmbeddingQualityData {
  /** Overall quality score (0-100) */
  overall_score: number;
  /** Individual quality metrics */
  metrics: QualityMetric[];
  /** Quality assessment */
  assessment: {
    status: "excellent" | "good" | "fair" | "poor";
    issues: string[];
    recommendations: string[];
  };
}

export interface EmbeddingQualityChartProps extends ChartConfig {
  /** Chart title */
  title: string;
  /** Chart type */
  type: "quality-bar" | "quality-gauge" | "quality-radar";
  /** Embedding quality data */
  data: EmbeddingQualityData;
  /** Whether to show assessment details */
  showAssessment?: boolean;
  /** Color scheme */
  colorScheme?: "default" | "gradient" | "status";
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
  showAssessment: true,
  colorScheme: "default",
  loading: false,
  emptyMessage: "No embedding quality data available",
};

export const EmbeddingQualityChart: Component<EmbeddingQualityChartProps> = props => {
  const [local, others] = splitProps(props, [
    "type",
    "data",
    "showAssessment",
    "colorScheme",
    "class",
    "loading",
    "emptyMessage",
    "theme",
  ]);

  const [chartData, setChartData] = createSignal<{
    labels: string[];
    datasets: Dataset[];
  } | null>(null);

  // Initialize visualization engine
  const visualization = useVisualizationEngine({
    theme: local.theme as any,
    useOKLCH: true,
  });

  onMount(() => {
    processData();
  });

  createEffect(() => {
    processData();
  });

  const processData = () => {
    if (!local.data || !local.data.metrics || local.data.metrics.length === 0) {
      setChartData(null);
      return;
    }

    switch (local.type) {
      case "quality-bar":
        setChartData(processQualityBarData(local.data));
        break;
      case "quality-gauge":
        setChartData(processQualityGaugeData(local.data));
        break;
      case "quality-radar":
        setChartData(processQualityRadarData(local.data));
        break;
      default:
        setChartData(null);
    }
  };

  const processQualityBarData = (data: EmbeddingQualityData) => {
    const labels = data.metrics.map(m => m.name);
    const values = data.metrics.map(m => m.value);
    const colors = data.metrics.map(m => getMetricColor(m));

    return {
      labels,
      datasets: [
        {
          label: "Quality Score",
          data: values,
          backgroundColor: colors.map(c => c.replace("1)", "0.6)")),
          borderColor: colors,
          borderWidth: 2,
        },
      ],
    };
  };

  const processQualityGaugeData = (data: EmbeddingQualityData) => {
    const score = data.overall_score;
    const remaining = 100 - score;

    // Determine color based on score
    let color = "rgba(255, 99, 132, 1)"; // Red
    if (score >= 80) {
      color = "rgba(75, 192, 192, 1)"; // Green
    } else if (score >= 60) {
      color = "rgba(255, 205, 86, 1)"; // Yellow
    }

    return {
      labels: ["Quality Score", "Remaining"],
      datasets: [
        {
          label: "Quality Score",
          data: [score, remaining],
          backgroundColor: [color, "rgba(200, 200, 200, 0.3)"],
          borderColor: [color, "rgba(200, 200, 200, 0.5)"],
          borderWidth: 2,
        },
      ],
    };
  };

  const processQualityRadarData = (data: EmbeddingQualityData) => {
    const labels = data.metrics.map(m => m.name);
    const values = data.metrics.map(m => m.value);

    // Generate colors using visualization engine
    const colors = visualization.generateColors(1);
    const backgroundColor = colors[0]?.replace("1)", "0.3)") || "rgba(54, 162, 235, 0.3)";
    const borderColor = colors[0] || "rgba(54, 162, 235, 1)";

    return {
      labels,
      datasets: [
        {
          label: "Quality Metrics",
          data: values,
          backgroundColor,
          borderColor,
          borderWidth: 2,
          pointBackgroundColor: borderColor,
          pointBorderColor: "#fff",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  };

  const getMetricColor = (metric: QualityMetric) => {
    if (metric.color) return metric.color;

    if (metric.goodThreshold !== undefined && metric.warningThreshold !== undefined) {
      if (metric.higherIsBetter) {
        if (metric.value >= metric.goodThreshold) return "rgba(75, 192, 192, 1)"; // Green
        if (metric.value >= metric.warningThreshold) return "rgba(255, 205, 86, 1)"; // Yellow
        return "rgba(255, 99, 132, 1)"; // Red
      } else {
        if (metric.value <= metric.goodThreshold) return "rgba(75, 192, 192, 1)"; // Green
        if (metric.value <= metric.warningThreshold) return "rgba(255, 205, 86, 1)"; // Yellow
        return "rgba(255, 99, 132, 1)"; // Red
      }
    }

    return "rgba(54, 162, 235, 1)"; // Default blue
  };

  const renderQualityAssessment = () => {
    if (!local.showAssessment || !local.data.assessment) return null;

    const assessment = local.data.assessment;
    const statusColors = {
      excellent: "rgba(75, 192, 192, 1)",
      good: "rgba(54, 162, 235, 1)",
      fair: "rgba(255, 205, 86, 1)",
      poor: "rgba(255, 99, 132, 1)",
    };

    return (
      <div class="embedding-quality-assessment">
        <div class="assessment-header">
          <h4>Quality Assessment</h4>
          <div
            class="status-badge"
            style={{
              "background-color": statusColors[assessment.status],
              color: "white",
              padding: "4px 8px",
              "border-radius": "4px",
              "font-size": "12px",
              "font-weight": "bold",
            }}
          >
            {assessment.status.toUpperCase()}
          </div>
        </div>

        <div class="overall-score">
          <div class="score-label">Overall Score:</div>
          <div class="score-value">{local.data.overall_score.toFixed(1)}/100</div>
        </div>

        <Show when={assessment.issues.length > 0}>
          <div class="issues-section">
            <h5>Issues Found:</h5>
            <ul>
              {assessment.issues.map(issue => (
                <li>{issue}</li>
              ))}
            </ul>
          </div>
        </Show>

        <Show when={assessment.recommendations.length > 0}>
          <div class="recommendations-section">
            <h5>Recommendations:</h5>
            <ul>
              {assessment.recommendations.map(rec => (
                <li>{rec}</li>
              ))}
            </ul>
          </div>
        </Show>
      </div>
    );
  };

  const renderQualityMetrics = () => {
    if (!local.data || !local.data.metrics) return null;

    return (
      <div class="quality-metrics-details">
        <div class="metrics-header">
          <h4>Quality Metrics</h4>
        </div>

        <div class="metrics-grid">
          {local.data.metrics.map(metric => (
            <div class="metric-item">
              <div class="metric-name">{metric.name}</div>
              <div class="metric-value">
                {metric.value.toFixed(2)}
                {metric.unit && <span class="metric-unit">{metric.unit}</span>}
              </div>
              <div
                class="metric-bar"
                style={{
                  width: `${Math.min(100, Math.max(0, metric.value))}%`,
                  "background-color": getMetricColor(metric),
                }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div class={`reynard-embedding-quality-chart ${local.class || ""}`}>
      <Show when={local.loading}>
        <div
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            height: `${others.height || 300}px`,
            color: "var(--text-muted, #666)",
          }}
        >
          <div class="loading-spinner"></div>
          <span style={{ "margin-left": "10px" }}>{t("loadingEmbeddingQuality")}</span>
        </div>
      </Show>

      <Show when={!local.loading && !chartData()}>
        <div
          style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "center",
            height: `${others.height || 300}px`,
            color: "var(--text-muted, #666)",
            "font-style": "italic",
          }}
        >
          {local.emptyMessage}
        </div>
      </Show>

      <Show when={!local.loading && chartData()}>
        <div class="quality-chart-container">
          <Chart
            type={local.type === "quality-gauge" ? "doughnut" : "bar"}
            labels={chartData()!.labels}
            datasets={chartData()!.datasets}
            width={others.width}
            height={others.height}
            title={others.title}
            xAxisLabel={others.xAxisLabel || t("qualityMetrics")}
            yAxisLabel={others.yAxisLabel || t("score")}
            showGrid={others.showGrid}
            showLegend={others.showLegend}
            useOKLCH={true}
            colorTheme={local.theme}
          />

          <div class="quality-analysis-panels">
            {renderQualityMetrics()}
            {renderQualityAssessment()}
          </div>
        </div>
      </Show>
    </div>
  );
};
