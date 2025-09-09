/**
 * PCAVarianceChart Component
 * Principal Component Analysis variance visualization with recommendations
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
  PointElement,
  LineElement,
  LineController,
} from "chart.js";
import { Line } from "solid-chartjs";
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
  PointElement,
  LineElement,
  LineController
);

export interface PCAVarianceData {
  /** Component numbers (1, 2, 3, ...) */
  components: number[];
  /** Explained variance ratio for each component */
  explainedVarianceRatio: number[];
  /** Cumulative explained variance ratio */
  cumulativeVarianceRatio: number[];
  /** Explained variance (not ratio) for each component */
  explainedVariance?: number[];
  /** Optimal component recommendations */
  recommendations?: {
    conservative: number;
    balanced: number;
    comprehensive: number;
    elbowMethod: number;
  };
}

export interface PCAVarianceChartProps extends ChartConfig {
  /** Chart title */
  title: string;
  /** PCA variance data */
  data: PCAVarianceData;
  /** X-axis label */
  xAxisLabel?: string;
  /** Y-axis label */
  yAxisLabel?: string;
  /** Whether to show grid lines */
  showGrid?: boolean;
  /** Whether to show cumulative variance line */
  showCumulative?: boolean;
  /** Whether to show recommendations */
  showRecommendations?: boolean;
  /** Maximum number of components to display */
  maxComponents?: number;
  /** Color for individual variance bars */
  varianceColor?: string;
  /** Color for cumulative variance line */
  cumulativeColor?: string;
  /** Whether to use OKLCH colors */
  useOKLCH?: boolean;
  /** Theme for color generation */
  colorTheme?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
}

export const PCAVarianceChart: Component<PCAVarianceChartProps> = (props) => {
  const [isRegistered, setIsRegistered] = createSignal(false);
  const visualizationEngine = useVisualizationEngine();

  // Register Chart.js components on mount
  onMount(() => {
    setIsRegistered(true);
  });

  // Prepare chart data
  const chartData = () => {
    const maxComps = props.maxComponents || props.data.components.length;
    const components = props.data.components.slice(0, maxComps);
    const varianceRatio = props.data.explainedVarianceRatio.slice(0, maxComps);
    const cumulativeRatio = props.data.cumulativeVarianceRatio.slice(0, maxComps);

    const colors = props.useOKLCH
      ? visualizationEngine.generateOKLCHColors(2, props.colorTheme || "dark")
      : [
          props.varianceColor || "rgba(54, 162, 235, 0.2)",
          props.cumulativeColor || "rgba(255, 99, 132, 0.2)",
        ];

    const datasets = [
      {
        label: "Explained Variance Ratio",
        data: varianceRatio,
        backgroundColor: colors[0],
        borderColor: colors[0]?.replace("0.2", "1"),
        borderWidth: 2,
        pointBackgroundColor: colors[0]?.replace("0.2", "1"),
        pointBorderColor: "#fff",
        pointBorderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
        fill: false,
      },
    ];

    if (props.showCumulative !== false) {
      datasets.push({
        label: "Cumulative Variance Ratio",
        data: cumulativeRatio,
        backgroundColor: colors[1],
        borderColor: colors[1]?.replace("0.2", "1"),
        borderWidth: 2,
        pointBackgroundColor: colors[1]?.replace("0.2", "1"),
        pointBorderColor: "#fff",
        pointBorderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.1,
        fill: false,
      });
    }

    return {
      labels: components.map((c) => `PC${c}`),
      datasets,
    };
  };

  // Chart options
  const chartOptions = () => ({
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
        display: true,
        position: "top" as const,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
        callbacks: {
          label: (context: any) => {
            const value = context.parsed.y;
            const percentage = (value * 100).toFixed(2);
            return `${context.dataset.label}: ${percentage}% (${value.toFixed(4)})`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: !!props.xAxisLabel,
          text: props.xAxisLabel || "Principal Components",
        },
        grid: {
          display: props.showGrid !== false,
        },
      },
      y: {
        display: true,
        title: {
          display: !!props.yAxisLabel,
          text: props.yAxisLabel || "Explained Variance Ratio",
        },
        grid: {
          display: props.showGrid !== false,
        },
        beginAtZero: true,
        max: 1,
        ticks: {
          callback: (value: number) => `${(value * 100).toFixed(0)}%`,
        },
      },
    },
    interaction: {
      mode: "nearest" as const,
      axis: "x" as const,
      intersect: false,
    },
  });

  // Recommendations overlay
  const recommendationsOverlay = () => {
    if (!props.showRecommendations || !props.data.recommendations) return null;

    const recs = props.data.recommendations;
    return (
      <div class="recommendations-overlay">
        <h4>Component Recommendations</h4>
        <div class="recommendation-item">
          <span class="rec-label">Conservative (80% variance):</span>
          <span class="rec-value">PC{recs.conservative}</span>
        </div>
        <div class="recommendation-item">
          <span class="rec-label">Balanced (90% variance):</span>
          <span class="rec-value">PC{recs.balanced}</span>
        </div>
        <div class="recommendation-item">
          <span class="rec-label">Comprehensive (95% variance):</span>
          <span class="rec-value">PC{recs.comprehensive}</span>
        </div>
        <div class="recommendation-item">
          <span class="rec-label">Elbow Method:</span>
          <span class="rec-value">PC{recs.elbowMethod}</span>
        </div>
      </div>
    );
  };

  // Summary statistics
  const summaryStats = () => {
    const totalVariance =
      props.data.cumulativeVarianceRatio[props.data.cumulativeVarianceRatio.length - 1];
    const topComponents = props.data.components.slice(0, 5);
    const topVariance = props.data.explainedVarianceRatio.slice(0, 5);

    return (
      <div class="summary-stats">
        <div class="stat-item">
          <span class="stat-label">Total Variance Explained:</span>
          <span class="stat-value">{(totalVariance * 100).toFixed(2)}%</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Top 5 Components:</span>
          <span class="stat-value">
            {topComponents
              .map((comp, i) => `PC${comp}(${(topVariance[i] * 100).toFixed(1)}%)`)
              .join(", ")}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div class="pca-variance-chart">
      <Show when={props.loading}>
        <div class="chart-loading">
          <div class="loading-spinner"></div>
          <p>Loading PCA variance data...</p>
        </div>
      </Show>

      <Show when={!props.loading && (!props.data.components || props.data.components.length === 0)}>
        <div class="chart-empty">
          <p>{props.emptyMessage || "No PCA variance data available"}</p>
        </div>
      </Show>

      <Show when={!props.loading && props.data.components && props.data.components.length > 0 && isRegistered()}>
        <Line
          data={chartData()}
          options={chartOptions()}
          width={props.width || 600}
          height={props.height || 400}
        />
        {recommendationsOverlay()}
        {summaryStats()}
      </Show>
    </div>
  );
};