/**
 * PerformanceMemoryTab Component
 * Memory tracking tab for performance dashboard
 */

import {
  Component,
  For,
  Show,
  createSignal,
  createEffect,
  onMount,
  onCleanup,
} from "solid-js";
import { Button } from "../primitives";

export interface PerformanceMemoryTabProps {
  memoryUsage: number;
  performanceHistory: Array<{
    timestamp: number;
    memoryUsage: number;
    browserResponsiveness: number;
    frameRate: number;
    selectionDuration?: number;
    itemsPerSecond?: number;
    domUpdateCount?: number;
    styleApplicationCount?: number;
    frameDropCount?: number;
  }>;
  refreshInterval?: number;
}

export const PerformanceMemoryTab: Component<PerformanceMemoryTabProps> = (
  props,
) => {
  const [isMonitoring, setIsMonitoring] = createSignal(false);
  const [isRefreshing, setIsRefreshing] = createSignal(false);
  const [lastUpdate, setLastUpdate] = createSignal<Date | null>(null);
  const [memoryStats, setMemoryStats] = createSignal({
    currentUsage: 0,
    peakUsage: 0,
    averageUsage: 0,
    usageTrend: "stable" as "increasing" | "stable" | "decreasing",
    memoryPressure: "low" as "low" | "medium" | "high" | "critical",
  });

  // Auto-refresh functionality
  let refreshInterval: ReturnType<typeof setInterval> | undefined;
  let monitoringInterval: ReturnType<typeof setInterval> | undefined;

  onMount(() => {
    updateMemoryStats();
  });

  onCleanup(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
    }
  });

  createEffect(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    if (props.refreshInterval && props.refreshInterval > 0) {
      refreshInterval = setInterval(() => {
        updateMemoryStats();
      }, props.refreshInterval);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  });

  // Update memory statistics
  const updateMemoryStats = async () => {
    setIsRefreshing(true);
    try {
      const history = props.performanceHistory;
      if (history.length === 0) {
        setLastUpdate(new Date());
        return;
      }

      // Calculate memory statistics
      const memoryUsages = history.map((entry) => entry.memoryUsage);
      const currentUsage = props.memoryUsage;
      const peakUsage = Math.max(...memoryUsages);
      const averageUsage =
        memoryUsages.reduce((sum, usage) => sum + usage, 0) /
        memoryUsages.length;

      // Calculate usage trend
      const recentUsages = memoryUsages.slice(-10);
      const olderUsages = memoryUsages.slice(-20, -10);
      const recentAverage =
        recentUsages.reduce((sum, usage) => sum + usage, 0) /
        recentUsages.length;
      const olderAverage =
        olderUsages.reduce((sum, usage) => sum + usage, 0) / olderUsages.length;

      let usageTrend: "increasing" | "stable" | "decreasing" = "stable";
      if (recentAverage > olderAverage * 1.1) {
        usageTrend = "increasing";
      } else if (recentAverage < olderAverage * 0.9) {
        usageTrend = "decreasing";
      }

      // Calculate memory pressure
      let memoryPressure: "low" | "medium" | "high" | "critical" = "low";
      if (currentUsage > 500 * 1024 * 1024) {
        // 500MB
        memoryPressure = "critical";
      } else if (currentUsage > 200 * 1024 * 1024) {
        // 200MB
        memoryPressure = "high";
      } else if (currentUsage > 100 * 1024 * 1024) {
        // 100MB
        memoryPressure = "medium";
      }

      setMemoryStats({
        currentUsage,
        peakUsage,
        averageUsage,
        usageTrend,
        memoryPressure,
      });

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to update memory statistics:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Start/stop memory monitoring
  const toggleMonitoring = () => {
    if (isMonitoring()) {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
        monitoringInterval = undefined;
      }
      setIsMonitoring(false);
    } else {
      monitoringInterval = setInterval(() => {
        updateMemoryStats();
      }, 1000); // Monitor every second
      setIsMonitoring(true);
    }
  };

  // Force garbage collection (if available)
  const forceGarbageCollection = () => {
    if (window.gc) {
      window.gc();
    } else {
      console.warn("Garbage collection not available in this environment");
    }
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

  // Get memory pressure color
  const getMemoryPressureColor = (pressure: string) => {
    switch (pressure) {
      case "low":
        return "success";
      case "medium":
        return "warning";
      case "high":
        return "error";
      case "critical":
        return "error";
      default:
        return "neutral";
    }
  };

  return (
    <div class="memory-tracking-panel">
      {/* Header */}
      <div class="memory-panel-header">
        <div class="memory-panel-title">
          <h3>Memory Tracking</h3>
        </div>

        <div class="memory-panel-actions">
          <Button
            variant={isMonitoring() ? "danger" : "primary"}
            onClick={toggleMonitoring}
          >
            {isMonitoring() ? "Stop Monitoring" : "Start Monitoring"}
          </Button>

          <Button
            variant="secondary"
            onClick={updateMemoryStats}
            disabled={isRefreshing()}
          >
            <Show when={isRefreshing()} fallback="Refresh">
              <span class="spinner"></span>
              Refreshing...
            </Show>
          </Button>

          <Button variant="secondary" onClick={forceGarbageCollection}>
            Force GC
          </Button>
        </div>
      </div>

      {/* Memory Statistics */}
      <div class="memory-stats">
        <div class="stats-grid">
          <div class="stat-item">
            <label>Current Usage</label>
            <span class="value">
              {formatMemory(memoryStats().currentUsage)}
            </span>
          </div>
          <div class="stat-item">
            <label>Peak Usage</label>
            <span class="value">{formatMemory(memoryStats().peakUsage)}</span>
          </div>
          <div class="stat-item">
            <label>Average Usage</label>
            <span class="value">
              {formatMemory(memoryStats().averageUsage)}
            </span>
          </div>
          <div class="stat-item">
            <label>Usage Trend</label>
            <span class="value trend">{memoryStats().usageTrend}</span>
          </div>
          <div class="stat-item">
            <label>Memory Pressure</label>
            <span
              class={`value ${getMemoryPressureColor(memoryStats().memoryPressure)}`}
            >
              {memoryStats().memoryPressure}
            </span>
          </div>
        </div>
      </div>

      {/* Memory Usage Chart Placeholder */}
      <div class="memory-chart">
        <h4>Memory Usage Over Time</h4>
        <div class="chart-placeholder">
          <p>Memory usage chart will be implemented here.</p>
          <p>Current usage: {formatMemory(props.memoryUsage)}</p>
          <p>Data points: {props.performanceHistory.length}</p>
        </div>
      </div>

      {/* Last Update */}
      <Show when={lastUpdate()}>
        <div class="last-update">
          Last updated: {lastUpdate()!.toLocaleString()}
        </div>
      </Show>
    </div>
  );
};
