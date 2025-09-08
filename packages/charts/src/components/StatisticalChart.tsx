/**
 * Statistical Chart Component
 * Advanced statistical visualizations including histograms, box plots, and distributions
 * Based on yipyap's EmbeddingDistributionChart and EmbeddingQualityChart
 */

import {
  Component,
  createSignal,
  createEffect,
  onMount,
  Show,
  splitProps,
} from "solid-js";
import { Chart } from "./Chart";
import { useVisualizationEngine } from "../core/VisualizationEngine";
import { ChartConfig, Dataset, ReynardTheme } from "../types";

export interface StatisticalData {
  /** Raw values for histogram */
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

export interface QualityData {
  /** Overall quality score (0-100) */
  overallScore: number;
  /** Individual quality metrics */
  metrics: QualityMetric[];
  /** Quality assessment */
  assessment: {
    status: 'excellent' | 'good' | 'fair' | 'poor';
    issues: string[];
    recommendations: string[];
  };
}

export interface StatisticalChartProps extends ChartConfig {
  /** Chart type */
  type: 'histogram' | 'boxplot' | 'quality-bar' | 'quality-gauge';
  /** Statistical data */
  data: StatisticalData | QualityData;
  /** Number of bins for histogram (auto-calculated if not provided) */
  numBins?: number;
  /** Whether to show statistics overlay */
  showStatistics?: boolean;
  /** Whether to show assessment details */
  showAssessment?: boolean;
  /** Color scheme */
  colorScheme?: 'default' | 'gradient' | 'status';
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
  numBins: 20,
  showStatistics: true,
  showAssessment: true,
  colorScheme: 'default',
  loading: false,
  emptyMessage: "No data available",
};

export const StatisticalChart: Component<StatisticalChartProps> = (props) => {
  const [local, others] = splitProps(props, [
    "type",
    "data",
    "numBins",
    "showStatistics",
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
    if (!local.data) {
      setChartData(null);
      return;
    }

    switch (local.type) {
      case 'histogram':
        setChartData(processHistogramData(local.data as StatisticalData));
        break;
      case 'boxplot':
        setChartData(processBoxPlotData(local.data as StatisticalData));
        break;
      case 'quality-bar':
        setChartData(processQualityBarData(local.data as QualityData));
        break;
      case 'quality-gauge':
        setChartData(processQualityGaugeData(local.data as QualityData));
        break;
      default:
        setChartData(null);
    }
  };

  const processHistogramData = (data: StatisticalData) => {
    if (!data.values || data.values.length === 0) {
      return null;
    }

    const values = data.values;
    const numBins = local.numBins || Math.min(20, Math.ceil(Math.sqrt(values.length)));

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
      const count = values.filter(v => v >= binStart && v < binEnd).length;
      binCounts.push(count);
    }

    // Create labels for bins (show range)
    const labels = binCounts.map((_, i) => {
      const start = bins[i].toFixed(2);
      const end = bins[i + 1].toFixed(2);
      return `${start}-${end}`;
    });

    const colors = visualization.generateColors(1);
    const backgroundColor = colors[0]?.replace("1)", "0.6)") || "rgba(54, 162, 235, 0.6)";
    const borderColor = colors[0] || "rgba(54, 162, 235, 1)";

    return {
      labels,
      datasets: [{
        label: 'Frequency',
        data: binCounts,
        backgroundColor,
        borderColor,
        borderWidth: 1,
      }],
    };
  };

  const processBoxPlotData = (data: StatisticalData) => {
    if (!data.values || data.values.length === 0) {
      return null;
    }

    const values = data.values.sort((a, b) => a - b);
    const n = values.length;

    // Calculate statistics
    const min = values[0];
    const max = values[n - 1];
    const q1 = values[Math.floor(n * 0.25)];
    const median = values[Math.floor(n * 0.5)];
    const q3 = values[Math.floor(n * 0.75)];
    const mean = values.reduce((sum, val) => sum + val, 0) / n;

    // Create box plot data points
    const boxPlotPoints = [
      { label: 'Min', value: min },
      { label: 'Q1', value: q1 },
      { label: 'Median', value: median },
      { label: 'Q3', value: q3 },
      { label: 'Max', value: max },
      { label: 'Mean', value: mean },
    ];

    const colors = visualization.generateColors(1);
    const backgroundColor = colors[0]?.replace("1)", "0.6)") || "rgba(255, 99, 132, 0.6)";
    const borderColor = colors[0] || "rgba(255, 99, 132, 1)";

    return {
      labels: boxPlotPoints.map(p => p.label),
      datasets: [{
        label: 'Value',
        data: boxPlotPoints.map(p => p.value),
        backgroundColor,
        borderColor,
        borderWidth: 2,
        pointBackgroundColor: borderColor,
        pointBorderColor: '#fff',
        pointBorderWidth: 1,
        pointRadius: 6,
        pointHoverRadius: 8,
      }],
    };
  };

  const processQualityBarData = (data: QualityData) => {
    const labels = data.metrics.map(m => m.name);
    const values = data.metrics.map(m => m.value);
    const colors = data.metrics.map(m => getMetricColor(m));

    return {
      labels,
      datasets: [{
        label: 'Quality Score',
        data: values,
        backgroundColor: colors.map(c => c.replace('1)', '0.6)')),
        borderColor: colors,
        borderWidth: 2,
      }],
    };
  };

  const processQualityGaugeData = (data: QualityData) => {
    const score = data.overallScore;
    const remaining = 100 - score;

    // Determine color based on score
    let color = 'rgba(255, 99, 132, 1)'; // Red
    if (score >= 80) {
      color = 'rgba(75, 192, 192, 1)'; // Green
    } else if (score >= 60) {
      color = 'rgba(255, 205, 86, 1)'; // Yellow
    }

    return {
      labels: ['Quality Score', 'Remaining'],
      datasets: [{
        label: 'Quality Score',
        data: [score, remaining],
        backgroundColor: [color, 'rgba(200, 200, 200, 0.3)'],
        borderColor: [color, 'rgba(200, 200, 200, 0.5)'],
        borderWidth: 2,
      }],
    };
  };

  const getMetricColor = (metric: QualityMetric) => {
    if (metric.color) return metric.color;

    if (metric.goodThreshold !== undefined && metric.warningThreshold !== undefined) {
      if (metric.higherIsBetter) {
        if (metric.value >= metric.goodThreshold) return 'rgba(75, 192, 192, 1)'; // Green
        if (metric.value >= metric.warningThreshold) return 'rgba(255, 205, 86, 1)'; // Yellow
        return 'rgba(255, 99, 132, 1)'; // Red
      } else {
        if (metric.value <= metric.goodThreshold) return 'rgba(75, 192, 192, 1)'; // Green
        if (metric.value <= metric.warningThreshold) return 'rgba(255, 205, 86, 1)'; // Yellow
        return 'rgba(255, 99, 132, 1)'; // Red
      }
    }

    return 'rgba(54, 162, 235, 1)'; // Default blue
  };

  const renderStatisticsOverlay = () => {
    if (!local.showStatistics || !('statistics' in local.data)) return null;

    const stats = (local.data as StatisticalData).statistics;
    if (!stats) return null;

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
        <div class="stat-item">
          <span class="stat-label">Max:</span>
          <span class="stat-value">{stats.max.toFixed(4)}</span>
        </div>
      </div>
    );
  };

  const renderQualityAssessment = () => {
    if (!local.showAssessment || !('assessment' in local.data)) return null;

    const assessment = (local.data as QualityData).assessment;
    const statusColors = {
      excellent: 'rgba(75, 192, 192, 1)',
      good: 'rgba(54, 162, 235, 1)',
      fair: 'rgba(255, 205, 86, 1)',
      poor: 'rgba(255, 99, 132, 1)',
    };

    return (
      <div class="quality-assessment">
        <div class="assessment-header">
          <h4>Quality Assessment</h4>
          <div
            class="status-badge"
            style={{
              'background-color': statusColors[assessment.status],
              color: 'white',
              padding: '4px 8px',
              'border-radius': '4px',
              'font-size': '12px',
              'font-weight': 'bold',
            }}
          >
            {assessment.status.toUpperCase()}
          </div>
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

  return (
    <div class={`reynard-statistical-chart ${local.class || ''}`}>
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
          <span style={{ "margin-left": "10px" }}>Loading statistical data...</span>
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
        <Chart
          type={local.type === 'quality-gauge' ? 'doughnut' : 'bar'}
          labels={chartData()!.labels}
          datasets={chartData()!.datasets}
          width={others.width}
          height={others.height}
          title={others.title}
          xAxisLabel={others.xAxisLabel || (local.type === 'histogram' ? 'Value Range' : 'Metric')}
          yAxisLabel={others.yAxisLabel || (local.type === 'histogram' ? 'Frequency' : 'Value')}
          showGrid={others.showGrid}
          showLegend={others.showLegend}
          useOKLCH={true}
          colorTheme={local.theme}
        />
        
        {renderStatisticsOverlay()}
        {renderQualityAssessment()}
      </Show>
    </div>
  );
};
