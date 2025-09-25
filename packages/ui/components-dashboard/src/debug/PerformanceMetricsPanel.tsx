/**
 * PerformanceMetricsPanel Component
 * Real-time performance metrics visualization and analysis
 */
import { Chart } from "reynard-charts";
import { Button } from "reynard-components-core/primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { For, Show, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { log } from "reynard-error-boundaries";

// Type definitions
interface PerformanceHistoryEntry {
  timestamp: number;
  frameRate: number;
  memoryUsage: number;
  browserResponsiveness: number;
  selectionDuration?: number;
  itemsPerSecond?: number;
  domUpdateCount?: number;
  styleApplicationCount?: number;
  frameDropCount?: number;
}

interface PerformanceMetrics {
  averageFrameRate: number;
  averageMemoryUsage: number;
  averageBrowserResponsiveness: number;
  averageSelectionDuration: number;
  averageItemsPerSecond: number;
  totalDomUpdates: number;
  totalStyleApplications: number;
  totalFrameDrops: number;
  performanceScore: number;
}

interface PerformanceMetricsPanelProps {
  performanceHistory: PerformanceHistoryEntry[];
  refreshInterval?: number;
}

type TimeRange = "1m" | "5m" | "15m" | "30m" | "1h";
type MetricType = "frameRate" | "memoryUsage" | "browserResponsiveness" | "selectionDuration" | "itemsPerSecond" | "domUpdateCount" | "styleApplicationCount" | "frameDropCount";

export const PerformanceMetricsPanel = (props: PerformanceMetricsPanelProps) => {
  const [metrics, setMetrics] = createSignal<PerformanceMetrics>({
    averageFrameRate: 0,
    averageMemoryUsage: 0,
    averageBrowserResponsiveness: 0,
    averageSelectionDuration: 0,
    averageItemsPerSecond: 0,
    totalDomUpdates: 0,
    totalStyleApplications: 0,
    totalFrameDrops: 0,
    performanceScore: 0,
  });
  const [selectedMetric, setSelectedMetric] = createSignal<MetricType>("frameRate");
  const [timeRange, setTimeRange] = createSignal<TimeRange>("5m");
  const [isRefreshing, setIsRefreshing] = createSignal(false);
  const [lastUpdate, setLastUpdate] = createSignal<Date | null>(null);
  // Auto-refresh functionality
  let refreshInterval: NodeJS.Timeout | undefined;
  onMount(() => {
    // Initial data load
    updateMetrics();
  });
  onCleanup(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
  });
  createEffect(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    if (props.refreshInterval && props.refreshInterval > 0) {
      refreshInterval = setInterval(() => {
        updateMetrics();
      }, props.refreshInterval);
    }
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  });
  // Update metrics
  const updateMetrics = async () => {
    setIsRefreshing(true);
    try {
      const history = props.performanceHistory;
      if (history.length === 0) {
        setLastUpdate(() => new Date());
        return;
      }
      // Calculate time range filter
      const now = Date.now();
      const timeRangeMs = getTimeRangeMs(timeRange());
      const filteredHistory = history.filter((entry: PerformanceHistoryEntry) => now - entry.timestamp <= timeRangeMs);
      if (filteredHistory.length === 0) {
        setLastUpdate(() => new Date());
        return;
      }
      // Calculate metrics
      const averageFrameRate =
        filteredHistory.reduce((sum: number, entry: PerformanceHistoryEntry) => sum + entry.frameRate, 0) / filteredHistory.length;
      const averageMemoryUsage =
        filteredHistory.reduce((sum: number, entry: PerformanceHistoryEntry) => sum + entry.memoryUsage, 0) / filteredHistory.length;
      const averageBrowserResponsiveness =
        filteredHistory.reduce((sum: number, entry: PerformanceHistoryEntry) => sum + entry.browserResponsiveness, 0) / filteredHistory.length;
      const averageSelectionDuration =
        filteredHistory.reduce((sum: number, entry: PerformanceHistoryEntry) => sum + (entry.selectionDuration || 0), 0) / filteredHistory.length;
      const averageItemsPerSecond =
        filteredHistory.reduce((sum: number, entry: PerformanceHistoryEntry) => sum + (entry.itemsPerSecond || 0), 0) / filteredHistory.length;
      const totalDomUpdates = filteredHistory.reduce((sum: number, entry: PerformanceHistoryEntry) => sum + (entry.domUpdateCount || 0), 0);
      const totalStyleApplications = filteredHistory.reduce(
        (sum: number, entry: PerformanceHistoryEntry) => sum + (entry.styleApplicationCount || 0),
        0
      );
      const totalFrameDrops = filteredHistory.reduce((sum: number, entry: PerformanceHistoryEntry) => sum + (entry.frameDropCount || 0), 0);
      // Calculate performance score (0-100)
      const performanceScore = calculatePerformanceScore({
        averageFrameRate,
        averageBrowserResponsiveness,
        totalFrameDrops,
        dataPoints: filteredHistory.length,
      });
      const newMetrics = {
        averageFrameRate,
        averageMemoryUsage,
        averageBrowserResponsiveness,
        averageSelectionDuration,
        averageItemsPerSecond,
        totalDomUpdates,
        totalStyleApplications,
        totalFrameDrops,
        performanceScore,
      };
      setMetrics(newMetrics);
      setLastUpdate(() => new Date());
    } catch (error) {
      log.error("Failed to update performance metrics", error instanceof Error ? error : new Error(String(error)), undefined, {
        component: "PerformanceMetricsPanel",
        function: "updateMetrics"
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  // Get time range in milliseconds
  const getTimeRangeMs = (range: TimeRange): number => {
    switch (range) {
      case "1m":
        return 60 * 1000;
      case "5m":
        return 5 * 60 * 1000;
      case "15m":
        return 15 * 60 * 1000;
      case "30m":
        return 30 * 60 * 1000;
      case "1h":
        return 60 * 60 * 1000;
      default:
        return 5 * 60 * 1000;
    }
  };
  // Calculate performance score
  const calculatePerformanceScore = (data: { averageFrameRate: number; averageBrowserResponsiveness: number; totalFrameDrops: number; dataPoints: number }): number => {
    let score = 100;
    // Frame rate penalty
    if (data.averageFrameRate < 30) {
      score -= 40;
    } else if (data.averageFrameRate < 45) {
      score -= 20;
    } else if (data.averageFrameRate < 55) {
      score -= 10;
    }
    // Browser responsiveness penalty
    if (data.averageBrowserResponsiveness > 100) {
      score -= 30;
    } else if (data.averageBrowserResponsiveness > 50) {
      score -= 15;
    } else if (data.averageBrowserResponsiveness > 20) {
      score -= 5;
    }
    // Frame drops penalty
    const frameDropRate = data.totalFrameDrops / data.dataPoints;
    if (frameDropRate > 0.1) {
      score -= 20;
    } else if (frameDropRate > 0.05) {
      score -= 10;
    } else if (frameDropRate > 0.01) {
      score -= 5;
    }
    return Math.max(0, Math.min(100, score));
  };
  // Get performance score color
  const getPerformanceScoreColor = (score: number): string => {
    if (score >= 80) return "success";
    if (score >= 60) return "warning";
    return "error";
  };
  // Get performance score message
  const getPerformanceScoreMessage = (score: number): string => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Poor";
  };
  // Format memory usage
  const formatMemory = (bytes: number): string => {
    if (bytes > 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    } else if (bytes > 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else if (bytes > 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${bytes} B`;
    }
  };
  // Format duration
  const formatDuration = (ms: number): string => {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`;
    } else {
      return `${(ms / 1000).toFixed(2)}s`;
    }
  };
  // Get chart data for selected metric
  const getChartData = (): Array<{ timestamp: number; value: number }> => {
    const history = props.performanceHistory;
    const timeRangeMs = getTimeRangeMs(timeRange());
    const now = Date.now();
    const filteredHistory = history.filter((entry: PerformanceHistoryEntry) => now - entry.timestamp <= timeRangeMs);
    return filteredHistory.map((entry: PerformanceHistoryEntry) => ({
      timestamp: entry.timestamp,
      value: getMetricValue(entry, selectedMetric()),
    }));
  };
  // Get metric value from history entry
  const getMetricValue = (entry: PerformanceHistoryEntry, metric: MetricType): number => {
    switch (metric) {
      case "frameRate":
        return entry.frameRate;
      case "memoryUsage":
        return entry.memoryUsage;
      case "browserResponsiveness":
        return entry.browserResponsiveness;
      case "selectionDuration":
        return entry.selectionDuration || 0;
      case "itemsPerSecond":
        return entry.itemsPerSecond || 0;
      case "domUpdateCount":
        return entry.domUpdateCount || 0;
      case "styleApplicationCount":
        return entry.styleApplicationCount || 0;
      case "frameDropCount":
        return entry.frameDropCount || 0;
      default:
        return 0;
    }
  };
  // Get metric label
  const getMetricLabel = (metric: MetricType): string => {
    switch (metric) {
      case "frameRate":
        return "Frame Rate (fps)";
      case "memoryUsage":
        return "Memory Usage (bytes)";
      case "browserResponsiveness":
        return "Browser Responsiveness (ms)";
      case "selectionDuration":
        return "Selection Duration (ms)";
      case "itemsPerSecond":
        return "Items Per Second";
      case "domUpdateCount":
        return "DOM Updates";
      case "styleApplicationCount":
        return "Style Applications";
      case "frameDropCount":
        return "Frame Drops";
      default:
        return "Unknown Metric";
    }
  };
  const availableMetrics: MetricType[] = [
    "frameRate",
    "memoryUsage",
    "browserResponsiveness",
    "selectionDuration",
    "itemsPerSecond",
    "domUpdateCount",
    "styleApplicationCount",
    "frameDropCount",
  ];
  const timeRanges: TimeRange[] = ["1m", "5m", "15m", "30m", "1h"];
  return (
    <div class="performance-metrics-panel">
      {/* Header */}
      <div class="metrics-panel-header">
        <div class="metrics-panel-title">
          <span class="icon">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("chart-line")?.outerHTML || ""}
            />
          </span>
          <h3>Performance Metrics</h3>
        </div>

        <div class="metrics-panel-actions">
          <Button variant="secondary" onClick={updateMetrics} disabled={isRefreshing()}>
            <Show when={isRefreshing()} fallback="Refresh">
              <span class="spinner" />
              Refreshing...
            </Show>
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div class="metrics-controls">
        <div class="control-group">
          <label>Metric:</label>
          <select value={selectedMetric()} onChange={e => setSelectedMetric(e.currentTarget.value as MetricType)}>
            <For each={availableMetrics}>{metric => <option value={metric}>{getMetricLabel(metric)}</option>}</For>
          </select>
        </div>

        <div class="control-group">
          <label>Time Range:</label>
          <select value={timeRange()} onChange={e => setTimeRange(e.currentTarget.value as TimeRange)}>
            <For each={timeRanges}>{range => <option value={range}>{range}</option>}</For>
          </select>
        </div>
      </div>

      {/* Performance Score */}
      <div class="performance-score">
        <div class="score-header">
          <h4>Performance Score</h4>
          <span class={`score-value ${getPerformanceScoreColor(metrics().performanceScore)}`}>
            {metrics().performanceScore.toFixed(0)}
          </span>
        </div>
        <div class="score-message">{getPerformanceScoreMessage(metrics().performanceScore)}</div>
      </div>

      {/* Metrics Summary */}
      <div class="metrics-summary">
        <div class="summary-grid">
          <div class="summary-item">
            <label>Average Frame Rate</label>
            <span class="value">{metrics().averageFrameRate.toFixed(1)} fps</span>
          </div>
          <div class="summary-item">
            <label>Average Memory Usage</label>
            <span class="value">{formatMemory(metrics().averageMemoryUsage)}</span>
          </div>
          <div class="summary-item">
            <label>Average Browser Response</label>
            <span class="value">{formatDuration(metrics().averageBrowserResponsiveness)}</span>
          </div>
          <div class="summary-item">
            <label>Average Selection Duration</label>
            <span class="value">{formatDuration(metrics().averageSelectionDuration)}</span>
          </div>
          <div class="summary-item">
            <label>Average Items/Second</label>
            <span class="value">{metrics().averageItemsPerSecond.toFixed(1)}</span>
          </div>
          <div class="summary-item">
            <label>Total DOM Updates</label>
            <span class="value">{metrics().totalDomUpdates.toLocaleString()}</span>
          </div>
          <div class="summary-item">
            <label>Total Style Applications</label>
            <span class="value">{metrics().totalStyleApplications.toLocaleString()}</span>
          </div>
          <div class="summary-item">
            <label>Total Frame Drops</label>
            <span class="value">{metrics().totalFrameDrops.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div class="performance-chart">
        <h4>{getMetricLabel(selectedMetric())}</h4>
        <Chart
          type="line"
          labels={getChartData().map((entry: { timestamp: number; value: number }) => new Date(entry.timestamp).toLocaleTimeString())}
          datasets={[
            {
              label: getMetricLabel(selectedMetric()),
              data: getChartData().map((entry: { timestamp: number; value: number }) => entry.value),
              borderColor: "oklch(0.7 0.15 200)",
              backgroundColor: "oklch(0.7 0.15 200 / 0.1)",
              tension: 0.1,
            },
          ]}
          width={800}
          height={300}
          useOKLCH={true}
        />
      </div>

      {/* Last Update */}
      <Show when={lastUpdate()}>
        <div class="last-update">Last updated: {lastUpdate()?.toLocaleString()}</div>
      </Show>
    </div>
  );
};
