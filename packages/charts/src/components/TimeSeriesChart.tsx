/**
 * Time Series Chart Component
 * Advanced real-time chart with automatic data management
 */

import { Component, onMount, createSignal, createEffect, Show, splitProps, onCleanup } from "solid-js";
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
import "chartjs-adapter-date-fns";
import { Line } from "solid-chartjs";
import { ChartConfig, TimeSeriesDataPoint } from "../types";
import { getDefaultConfig, formatTimestamp, debounce } from "../utils";

export interface TimeSeriesChartProps extends ChartConfig {
  /** Time series data */
  data: TimeSeriesDataPoint[];
  /** Maximum number of data points to display */
  maxDataPoints?: number;
  /** Auto-update interval in milliseconds */
  updateInterval?: number;
  /** Whether to auto-scroll to latest data */
  autoScroll?: boolean;
  /** Time range to display (in milliseconds) */
  timeRange?: number;
  /** Data aggregation interval (in milliseconds) */
  aggregationInterval?: number;
  /** Custom data point colors */
  pointColors?: (value: number, timestamp: number) => string;
  /** Value formatter */
  valueFormatter?: (value: number) => string;
  /** Custom class name */
  class?: string;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Real-time data callback */
  onDataUpdate?: (data: TimeSeriesDataPoint[]) => void;
}

const defaultProps = {
  width: 400,
  height: 300,
  showGrid: true,
  showLegend: false,
  responsive: true,
  maintainAspectRatio: false,
  maxDataPoints: 100,
  updateInterval: 1000,
  autoScroll: true,
  emptyMessage: "No data available",
};

export const TimeSeriesChart: Component<TimeSeriesChartProps> = (props) => {
  const merged = { ...defaultProps, ...props };
  const [local, others] = splitProps(merged, [
    "data",
    "title",
    "width",
    "height",
    "showGrid",
    "showLegend",
    "responsive",
    "maintainAspectRatio",
    "maxDataPoints",
    "updateInterval",
    "autoScroll",
    "timeRange",
    "aggregationInterval",
    "pointColors",
    "valueFormatter",
    "xAxis",
    "yAxis",
    "class",
    "loading",
    "emptyMessage",
    "animation",
    "tooltip",
    "onDataUpdate",
  ]);

  const [isRegistered, setIsRegistered] = createSignal(false);
  const [processedData, setProcessedData] = createSignal<{
    labels: string[];
    datasets: any[];
  } | null>(null);
  
  let updateTimer: NodeJS.Timeout | null = null;

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

  // Cleanup timer on unmount
  onCleanup(() => {
    if (updateTimer) {
      clearInterval(updateTimer);
    }
  });

  // Debounced data processing
  const debouncedProcess = debounce(() => {
    processTimeSeriesData();
  }, 100);

  // Process time series data
  const processTimeSeriesData = () => {
    if (!local.data || local.data.length === 0) {
      setProcessedData(null);
      return;
    }

    let dataToProcess = [...local.data];

    // Sort by timestamp
    dataToProcess.sort((a, b) => a.timestamp - b.timestamp);

    // Apply time range filter if specified
    if (local.timeRange) {
      const now = Date.now();
      const cutoff = now - local.timeRange;
      dataToProcess = dataToProcess.filter(point => point.timestamp >= cutoff);
    }

    // Limit data points
    if (dataToProcess.length > local.maxDataPoints) {
      dataToProcess = dataToProcess.slice(-local.maxDataPoints);
    }

    // Aggregate data if specified
    if (local.aggregationInterval) {
      dataToProcess = aggregateData(dataToProcess, local.aggregationInterval);
    }

    // Prepare chart data
    const labels = dataToProcess.map(point => formatTimestamp(point.timestamp, "time"));
    const values = dataToProcess.map(point => point.value);
    
    // Generate point colors if function provided
    let pointBackgroundColors: string[] | undefined;
    let pointBorderColors: string[] | undefined;
    
    if (local.pointColors) {
      pointBackgroundColors = dataToProcess.map(point => 
        local.pointColors!(point.value, point.timestamp)
      );
      pointBorderColors = pointBackgroundColors;
    }

    const dataset = {
      label: "Value",
      data: values,
      borderColor: "var(--accent)",
      backgroundColor: "transparent",
      pointBackgroundColor: pointBackgroundColors || "var(--accent)",
      pointBorderColor: pointBorderColors || "var(--accent)",
      pointRadius: 3,
      pointHoverRadius: 5,
      borderWidth: 2,
      fill: false,
      tension: 0.4,
    };

    setProcessedData({
      labels,
      datasets: [dataset],
    });

    // Trigger data update callback
    local.onDataUpdate?.(dataToProcess);
  };

  // Aggregate data by intervals
  const aggregateData = (data: TimeSeriesDataPoint[], intervalMs: number): TimeSeriesDataPoint[] => {
    const aggregated = new Map<number, { sum: number; count: number; label: string }>();
    
    for (const point of data) {
      const intervalStart = Math.floor(point.timestamp / intervalMs) * intervalMs;
      const existing = aggregated.get(intervalStart) || { sum: 0, count: 0, label: point.label };
      
      aggregated.set(intervalStart, {
        sum: existing.sum + point.value,
        count: existing.count + 1,
        label: existing.label,
      });
    }
    
    return Array.from(aggregated.entries())
      .map(([timestamp, { sum, count, label }]) => ({
        timestamp,
        value: sum / count, // Average
        label,
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  // Update data when props change
  createEffect(() => {
    debouncedProcess();
  });

  // Set up auto-update timer
  createEffect(() => {
    if (local.updateInterval && local.data.length > 0) {
      updateTimer = setInterval(() => {
        processTimeSeriesData();
      }, local.updateInterval);
    }

    return () => {
      if (updateTimer) {
        clearInterval(updateTimer);
        updateTimer = null;
      }
    };
  });

  const getChartOptions = () => {
    const baseConfig = getDefaultConfig("line");
    
    return {
      ...baseConfig,
      responsive: local.responsive,
      maintainAspectRatio: local.maintainAspectRatio,
      animation: local.animation || {
        duration: 750,
        easing: "easeOutCubic",
      },
      interaction: {
        intersect: false,
        mode: "index" as const,
      },
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
          callbacks: {
            label: (context: any) => {
              const value = context.parsed.y;
              const formattedValue = local.valueFormatter 
                ? local.valueFormatter(value)
                : value.toLocaleString();
              return `${context.dataset.label}: ${formattedValue}`;
            },
          },
        },
      },
      scales: {
        x: {
          type: "time",
          time: {
            displayFormats: {
              second: "HH:mm:ss",
              minute: "HH:mm",
              hour: "HH:mm",
              day: "MM/dd",
            },
          },
          display: local.xAxis?.display !== false,
          title: {
            display: !!local.xAxis?.label,
            text: local.xAxis?.label || "Time",
            color: "var(--text-primary)",
          },
          grid: {
            display: local.showGrid && local.xAxis?.grid?.display !== false,
            color: local.xAxis?.grid?.color || "var(--border-color)",
            lineWidth: local.xAxis?.grid?.lineWidth || 1,
          },
          ticks: {
            color: "var(--text-secondary)",
            maxTicksLimit: 10,
            ...local.xAxis?.ticks,
          },
        },
        y: {
          type: "linear",
          display: local.yAxis?.display !== false,
          position: local.yAxis?.position || "left",
          title: {
            display: !!local.yAxis?.label,
            text: local.yAxis?.label || "Value",
            color: "var(--text-primary)",
          },
          grid: {
            display: local.showGrid && local.yAxis?.grid?.display !== false,
            color: local.yAxis?.grid?.color || "var(--border-color)",
            lineWidth: local.yAxis?.grid?.lineWidth || 1,
          },
          ticks: {
            color: "var(--text-secondary)",
            callback: (value: any) => {
              return local.valueFormatter 
                ? local.valueFormatter(value)
                : value.toLocaleString();
            },
            ...local.yAxis?.ticks,
          },
          min: local.yAxis?.min,
          max: local.yAxis?.max,
        },
      },
    };
  };

  const getContainerClasses = () => {
    const classes = ["reynard-timeseries-chart"];
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

      <Show when={!local.loading && !processedData()}>
        <div class="reynard-chart-empty">
          <span>{local.emptyMessage}</span>
        </div>
      </Show>

      <Show when={!local.loading && processedData() && isRegistered()}>
        <Line
          data={processedData()!}
          options={getChartOptions()}
          width={local.width}
          height={local.height}
        />
      </Show>
    </div>
  );
};
