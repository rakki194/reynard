/**
 * EmbeddingDistributionChart Component
 * Advanced embedding distribution analysis with histogram and box plot visualization
 */

import {
  Component,
  onMount,
  createSignal,
  Show,
} from "solid-js";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  Colors,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  PointElement,
  LineElement,
  LineController,
} from "chart.js";
import { Bar, Line } from "solid-chartjs";
import { ChartConfig, ReynardTheme } from "../types";
import { useVisualizationEngine } from "../core/VisualizationEngine";

// Register Chart.js components
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  Colors,
  CategoryScale,
  LinearScale,
  BarController,
  BarElement,
  PointElement,
  LineElement,
  LineController
);

export interface EmbeddingDistributionData {
  /** Embedding values for histogram */
  values: number[];
  /** Bin edges for histogram */
  bins?: number[];
  /** Bin counts for histogram */
  binCounts?: number[];
  /** Statistics for box plot */
  statistics?: {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    mean: number;
    std: number;
  };
}

export interface EmbeddingDistributionChartProps extends ChartConfig {
  /** Chart title */
  title: string;
  /** Chart type */
  type: "histogram" | "boxplot";
  /** Embedding distribution data */
  data: EmbeddingDistributionData;
  /** X-axis label */
  xAxisLabel?: string;
  /** Y-axis label */
  yAxisLabel?: string;
  /** Number of bins for histogram (auto-calculated if not provided) */
  numBins?: number;
  /** Whether to show grid lines */
  showGrid?: boolean;
  /** Color for the chart */
  color?: string;
  /** Whether to show statistics overlay */
  showStatistics?: boolean;
  /** Whether to use OKLCH colors */
  useOKLCH?: boolean;
  /** Theme for color generation */
  colorTheme?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
}

export const EmbeddingDistributionChart: Component<EmbeddingDistributionChartProps> = (props) => {
  const [isRegistered, setIsRegistered] = createSignal(false);
  const visualizationEngine = useVisualizationEngine();

  // Register Chart.js components on mount
  onMount(() => {
    setIsRegistered(true);
  });

  // Calculate histogram bins and counts
  const histogramData = () => {
    if (props.type !== "histogram" || !props.data.values.length) {
      return { labels: [], datasets: [] };
    }

    const values = props.data.values;
    const numBins = props.numBins || Math.min(20, Math.ceil(Math.sqrt(values.length)));

    // Calculate bin edges
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binWidth = (max - min) / numBins;

    const bins: number[] = [];
    const binCounts: number[] = [];

    for (let i = 0; i <= numBins; i++) {
      bins.push(min + i * binWidth);
    }

    // Count values in each bin
    for (let i = 0; i < numBins; i++) {
      const binStart = bins[i];
      const binEnd = bins[i + 1];
      const count = values.filter((v) => v >= binStart && v < binEnd).length;
      binCounts.push(count);
    }

    // Create labels for bins (show range)
    const labels = binCounts.map((_, i) => {
      const start = bins[i].toFixed(2);
      const end = bins[i + 1].toFixed(2);
      return `${start}-${end}`;
    });

    const colors = props.useOKLCH
      ? visualizationEngine.generateOKLCHColors(1, props.colorTheme || "dark")
      : [props.color || "rgba(54, 162, 235, 0.6)"];

    return {
      labels,
      datasets: [
        {
          label: "Frequency",
          data: binCounts,
          backgroundColor: colors[0],
          borderColor: colors[0]?.replace("0.6", "1"),
          borderWidth: 1,
        },
      ],
    };
  };

  // Calculate box plot data
  const boxPlotData = () => {
    if (props.type !== "boxplot" || !props.data.values.length) {
      return { labels: [], datasets: [] };
    }

    const values = props.data.values.sort((a, b) => a - b);
    const n = values.length;

    // Calculate statistics
    const min = values[0];
    const max = values[n - 1];
    const q1 = values[Math.floor(n * 0.25)];
    const median = values[Math.floor(n * 0.5)];
    const q3 = values[Math.floor(n * 0.75)];
    const mean = values.reduce((sum, val) => sum + val, 0) / n;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const std = Math.sqrt(variance);

    // Create box plot data points
    const boxPlotPoints = [
      { label: "Min", value: min },
      { label: "Q1", value: q1 },
      { label: "Median", value: median },
      { label: "Q3", value: q3 },
      { label: "Max", value: max },
      { label: "Mean", value: mean },
    ];

    const colors = props.useOKLCH
      ? visualizationEngine.generateOKLCHColors(1, props.colorTheme || "dark")
      : [props.color || "rgba(255, 99, 132, 0.6)"];

    return {
      labels: boxPlotPoints.map((p) => p.label),
      datasets: [
        {
          label: "Value",
          data: boxPlotPoints.map((p) => p.value),
          backgroundColor: colors[0],
          borderColor: colors[0]?.replace("0.6", "1"),
          borderWidth: 2,
          pointBackgroundColor: colors[0]?.replace("0.6", "1"),
          pointBorderColor: "#fff",
          pointBorderWidth: 1,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };
  };

  // Chart options
  const chartOptions = () => {
    const isHistogram = props.type === "histogram";

    return {
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
          display: false,
        },
        tooltip: {
          mode: "index" as const,
          intersect: false,
          callbacks: {
            label: (context: any) => {
              if (isHistogram) {
                return `Frequency: ${context.parsed.y}`;
              } else {
                return `${context.label}: ${context.parsed.y.toFixed(4)}`;
              }
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: !!props.xAxisLabel,
            text: props.xAxisLabel || (isHistogram ? "Value Range" : "Statistic"),
          },
          grid: {
            display: props.showGrid !== false,
          },
        },
        y: {
          display: true,
          title: {
            display: !!props.yAxisLabel,
            text: props.yAxisLabel || (isHistogram ? "Frequency" : "Value"),
          },
          grid: {
            display: props.showGrid !== false,
          },
          beginAtZero: isHistogram,
        },
      },
      interaction: {
        mode: "nearest" as const,
        axis: "x" as const,
        intersect: false,
      },
    };
  };

  // Statistics overlay
  const statisticsOverlay = () => {
    if (!props.showStatistics || !props.data.statistics) return null;

    const stats = props.data.statistics;
    const isBoxPlot = props.type === "boxplot";

    return (
      <div class="statistics-overlay">
        <div class="stat-item">
          <span class="stat-label">Mean:</span>
          <span class="stat-value">{stats.mean.toFixed(4)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Std:</span>
          <span class="stat-value">{stats.std.toFixed(4)}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Min:</span>
          <span class="stat-value">{stats.min.toFixed(4)}</span>
        </div>
        {isBoxPlot && (
          <div class="stat-item">
            <span class="stat-label">Q1:</span>
            <span class="stat-value">{stats.q1.toFixed(4)}</span>
          </div>
        )}
        {isBoxPlot && (
          <div class="stat-item">
            <span class="stat-label">Median:</span>
            <span class="stat-value">{stats.median.toFixed(4)}</span>
          </div>
        )}
        {isBoxPlot && (
          <div class="stat-item">
            <span class="stat-label">Q3:</span>
            <span class="stat-value">{stats.q3.toFixed(4)}</span>
          </div>
        )}
        <div class="stat-item">
          <span class="stat-label">Max:</span>
          <span class="stat-value">{stats.max.toFixed(4)}</span>
        </div>
      </div>
    );
  };

  return (
    <div class="embedding-distribution-chart">
      <Show when={props.loading}>
        <div class="chart-loading">
          <div class="loading-spinner"></div>
          <p>Loading embedding distribution data...</p>
        </div>
      </Show>

      <Show when={!props.loading && (!props.data.values || props.data.values.length === 0)}>
        <div class="chart-empty">
          <p>{props.emptyMessage || "No embedding distribution data available"}</p>
        </div>
      </Show>

      <Show when={!props.loading && props.data.values && props.data.values.length > 0 && isRegistered()}>
        <Show when={props.type === "histogram"}>
          <Bar
            data={histogramData()}
            options={chartOptions()}
            width={props.width || 400}
            height={props.height || 300}
          />
        </Show>
        <Show when={props.type === "boxplot"}>
          <Bar
            data={boxPlotData()}
            options={chartOptions()}
            width={props.width || 400}
            height={props.height || 300}
          />
        </Show>
        {statisticsOverlay()}
      </Show>
    </div>
  );
};