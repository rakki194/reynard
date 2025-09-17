/**
 * PerformanceMetricsTab Component
 * Metrics tab for performance dashboard
 */
import { For, Show, createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { Button } from "reynard-components-core/primitives";
export const PerformanceMetricsTab = props => {
    const [selectedMetric, setSelectedMetric] = createSignal("frameRate");
    const [timeRange, setTimeRange] = createSignal("5m");
    const [isRefreshing, setIsRefreshing] = createSignal(false);
    const [lastUpdate, setLastUpdate] = createSignal(null);
    // Auto-refresh functionality
    let refreshInterval;
    onMount(() => {
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
            // Simulate metrics update
            setLastUpdate(new Date());
        }
        catch (error) {
            console.error("Failed to update performance metrics:", error);
        }
        finally {
            setIsRefreshing(false);
        }
    };
    // Get time range in milliseconds
    const getTimeRangeMs = (range) => {
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
    // Get metric label
    const getMetricLabel = (metric) => {
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
    const availableMetrics = [
        "frameRate",
        "memoryUsage",
        "browserResponsiveness",
        "selectionDuration",
        "itemsPerSecond",
        "domUpdateCount",
        "styleApplicationCount",
        "frameDropCount",
    ];
    const timeRanges = ["1m", "5m", "15m", "30m", "1h"];
    return (<div class="performance-metrics-panel">
      {/* Header */}
      <div class="metrics-panel-header">
        <div class="metrics-panel-title">
          <h3>Performance Metrics</h3>
        </div>

        <div class="metrics-panel-actions">
          <Button variant="secondary" onClick={updateMetrics} disabled={isRefreshing()}>
            <Show when={isRefreshing()} fallback="Refresh">
              <span class="spinner"/>
              Refreshing...
            </Show>
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div class="metrics-controls">
        <div class="control-group">
          <label>Metric:</label>
          <select value={selectedMetric()} onChange={e => setSelectedMetric(e.currentTarget.value)}>
            <For each={availableMetrics}>{metric => <option value={metric}>{getMetricLabel(metric)}</option>}</For>
          </select>
        </div>

        <div class="control-group">
          <label>Time Range:</label>
          <select value={timeRange()} onChange={e => setTimeRange(e.currentTarget.value)}>
            <For each={timeRanges}>{range => <option value={range}>{range}</option>}</For>
          </select>
        </div>
      </div>

      {/* Metrics Summary */}
      <div class="metrics-summary">
        <div class="summary-grid">
          <div class="summary-item">
            <label>Selected Metric</label>
            <span class="value">{getMetricLabel(selectedMetric())}</span>
          </div>
          <div class="summary-item">
            <label>Time Range</label>
            <span class="value">{timeRange()}</span>
          </div>
          <div class="summary-item">
            <label>Data Points</label>
            <span class="value">{props.performanceHistory.length}</span>
          </div>
        </div>
      </div>

      {/* Performance Chart Placeholder */}
      <div class="performance-chart">
        <h4>{getMetricLabel(selectedMetric())}</h4>
        <div class="chart-placeholder">
          <p>Chart visualization will be implemented here.</p>
          <p>Selected metric: {selectedMetric()}</p>
          <p>Time range: {timeRange()}</p>
        </div>
      </div>

      {/* Last Update */}
      <Show when={lastUpdate()}>
        <div class="last-update">Last updated: {lastUpdate().toLocaleString()}</div>
      </Show>
    </div>);
};
