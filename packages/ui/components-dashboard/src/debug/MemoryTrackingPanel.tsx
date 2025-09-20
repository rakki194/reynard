/**
 * MemoryTrackingPanel Component
 * Comprehensive memory usage tracking and leak detection
 */
import { For, Show, createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { Button } from "reynard-components-core/primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { Chart } from "reynard-charts";
export const MemoryTrackingPanel = props => {
  const [memoryStats, setMemoryStats] = createSignal({
    currentUsage: 0,
    peakUsage: 0,
    averageUsage: 0,
    usageTrend: "stable",
    memoryPressure: "low",
    gcFrequency: 0,
    gcEfficiency: 0,
  });
  const [leakDetection, setLeakDetection] = createSignal({
    isLeakDetected: false,
    leakSeverity: "low",
    leakRate: 0,
    estimatedLeakSize: 0,
    timeToCritical: 0,
    recommendations: [],
  });
  const [memoryHistory, setMemoryHistory] = createSignal([]);
  const [isMonitoring, setIsMonitoring] = createSignal(false);
  const [isRefreshing, setIsRefreshing] = createSignal(false);
  const [lastUpdate, setLastUpdate] = createSignal(null);
  // Auto-refresh functionality
  let refreshInterval;
  let monitoringInterval;
  onMount(() => {
    // Initial data load
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
      const memoryUsages = history.map(entry => entry.memoryUsage);
      const currentUsage = props.memoryUsage;
      const peakUsage = Math.max(...memoryUsages);
      const averageUsage = memoryUsages.reduce((sum, usage) => sum + usage, 0) / memoryUsages.length;
      // Calculate usage trend
      const recentUsages = memoryUsages.slice(-10);
      const olderUsages = memoryUsages.slice(-20, -10);
      const recentAverage = recentUsages.reduce((sum, usage) => sum + usage, 0) / recentUsages.length;
      const olderAverage = olderUsages.reduce((sum, usage) => sum + usage, 0) / olderUsages.length;
      let usageTrend = "stable";
      if (recentAverage > olderAverage * 1.1) {
        usageTrend = "increasing";
      } else if (recentAverage < olderAverage * 0.9) {
        usageTrend = "decreasing";
      }
      // Calculate memory pressure
      let memoryPressure = "low";
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
      // Simulate GC statistics (in a real implementation, these would come from the browser)
      const gcFrequency = Math.random() * 10; // GC events per minute
      const gcEfficiency = Math.random() * 100; // Percentage of memory freed
      const newStats = {
        currentUsage,
        peakUsage,
        averageUsage,
        usageTrend,
        memoryPressure,
        gcFrequency,
        gcEfficiency,
      };
      setMemoryStats(newStats);
      // Update memory history
      const newHistoryEntry = {
        timestamp: Date.now(),
        usage: currentUsage,
        gcCount: Math.floor(gcFrequency),
        gcTime: gcEfficiency,
      };
      setMemoryHistory(prev => {
        const updated = [...prev, newHistoryEntry];
        // Keep only last 100 data points
        return updated.slice(-100);
      });
      // Perform leak detection
      performLeakDetection(newStats, memoryUsages);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to update memory statistics:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  // Perform memory leak detection
  const performLeakDetection = (stats, memoryUsages) => {
    if (memoryUsages.length < 10) {
      return;
    }
    // Calculate leak rate (bytes per second)
    const timeSpan = ((memoryUsages.length - 1) * (props.refreshInterval || 1000)) / 1000; // seconds
    const memoryIncrease = memoryUsages[memoryUsages.length - 1] - memoryUsages[0];
    const leakRate = memoryIncrease / timeSpan;
    // Determine leak severity
    let leakSeverity = "low";
    let isLeakDetected = false;
    if (leakRate > 1024 * 1024) {
      // 1MB per second
      leakSeverity = "critical";
      isLeakDetected = true;
    } else if (leakRate > 100 * 1024) {
      // 100KB per second
      leakSeverity = "high";
      isLeakDetected = true;
    } else if (leakRate > 10 * 1024) {
      // 10KB per second
      leakSeverity = "medium";
      isLeakDetected = true;
    } else if (leakRate > 1024) {
      // 1KB per second
      leakSeverity = "low";
      isLeakDetected = true;
    }
    // Calculate estimated leak size
    const estimatedLeakSize = Math.max(0, leakRate * 60); // bytes per minute
    // Calculate time to critical (assuming 500MB is critical)
    const timeToCritical =
      isLeakDetected && leakRate > 0 ? (500 * 1024 * 1024 - stats.currentUsage) / leakRate : Infinity;
    // Generate recommendations
    const recommendations = [];
    if (isLeakDetected) {
      recommendations.push("Memory leak detected - investigate for potential causes");
      if (leakSeverity === "critical" || leakSeverity === "high") {
        recommendations.push("Consider restarting the application to free memory");
        recommendations.push("Check for event listeners that are not being removed");
        recommendations.push("Review component cleanup and disposal logic");
      }
      if (leakSeverity === "medium" || leakSeverity === "low") {
        recommendations.push("Monitor memory usage closely");
        recommendations.push("Consider implementing memory cleanup routines");
      }
    } else {
      recommendations.push("No memory leaks detected");
      recommendations.push("Memory usage appears stable");
    }
    const newLeakDetection = {
      isLeakDetected,
      leakSeverity,
      leakRate,
      estimatedLeakSize,
      timeToCritical,
      recommendations,
    };
    setLeakDetection(newLeakDetection);
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
  const formatMemory = bytes => {
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
  const formatDuration = seconds => {
    if (seconds === Infinity) {
      return "Never";
    } else if (seconds < 60) {
      return `${seconds.toFixed(0)}s`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ${(seconds % 60).toFixed(0)}s`;
    } else {
      return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    }
  };
  // Get memory pressure color
  const getMemoryPressureColor = pressure => {
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
  // Get leak severity color
  const getLeakSeverityColor = severity => {
    switch (severity) {
      case "low":
        return "info";
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
  // Get usage trend icon
  const getUsageTrendIcon = trend => {
    switch (trend) {
      case "increasing":
        return fluentIconsPackage.getIcon("arrow-up");
      case "decreasing":
        return fluentIconsPackage.getIcon("arrow-down");
      case "stable":
        return fluentIconsPackage.getIcon("arrow-right");
      default:
        return fluentIconsPackage.getIcon("info");
    }
  };
  // Get chart data for memory usage
  const getMemoryChartData = () => {
    return memoryHistory().map(entry => ({
      timestamp: entry.timestamp,
      value: entry.usage,
    }));
  };
  return (
    <div class="memory-tracking-panel">
      {/* Header */}
      <div class="memory-panel-header">
        <div class="memory-panel-title">
          <span class="icon">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("memory")?.outerHTML || ""}
            />
          </span>
          <h3>Memory Tracking</h3>
        </div>

        <div class="memory-panel-actions">
          <Button variant={isMonitoring() ? "danger" : "primary"} onClick={toggleMonitoring}>
            {isMonitoring() ? "Stop Monitoring" : "Start Monitoring"}
          </Button>

          <Button variant="secondary" onClick={updateMemoryStats} disabled={isRefreshing()}>
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
            <span class="value">{formatMemory(memoryStats().currentUsage)}</span>
          </div>
          <div class="stat-item">
            <label>Peak Usage</label>
            <span class="value">{formatMemory(memoryStats().peakUsage)}</span>
          </div>
          <div class="stat-item">
            <label>Average Usage</label>
            <span class="value">{formatMemory(memoryStats().averageUsage)}</span>
          </div>
          <div class="stat-item">
            <label>Usage Trend</label>
            <span class="value trend">
              <span class="trend-icon">
                <div
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={getUsageTrendIcon(memoryStats().usageTrend)?.outerHTML || ""}
                />
              </span>
              {memoryStats().usageTrend}
            </span>
          </div>
          <div class="stat-item">
            <label>Memory Pressure</label>
            <span class={`value ${getMemoryPressureColor(memoryStats().memoryPressure)}`}>
              {memoryStats().memoryPressure}
            </span>
          </div>
          <div class="stat-item">
            <label>GC Frequency</label>
            <span class="value">{memoryStats().gcFrequency.toFixed(1)}/min</span>
          </div>
          <div class="stat-item">
            <label>GC Efficiency</label>
            <span class="value">{memoryStats().gcEfficiency.toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* Memory Leak Detection */}
      <div class="leak-detection">
        <h4>Memory Leak Detection</h4>
        <div class="leak-status">
          <div class="leak-indicator">
            <span class={`leak-status-badge ${getLeakSeverityColor(leakDetection().leakSeverity)}`}>
              {leakDetection().isLeakDetected ? "Leak Detected" : "No Leak"}
            </span>
            <Show when={leakDetection().isLeakDetected}>
              <span class="leak-severity">Severity: {leakDetection().leakSeverity}</span>
            </Show>
          </div>
        </div>

        <Show when={leakDetection().isLeakDetected}>
          <div class="leak-details">
            <div class="leak-metric">
              <label>Leak Rate:</label>
              <span class="value">{formatMemory(leakDetection().leakRate)}/s</span>
            </div>
            <div class="leak-metric">
              <label>Estimated Leak Size:</label>
              <span class="value">{formatMemory(leakDetection().estimatedLeakSize)}/min</span>
            </div>
            <div class="leak-metric">
              <label>Time to Critical:</label>
              <span class="value">{formatDuration(leakDetection().timeToCritical)}</span>
            </div>
          </div>
        </Show>

        <div class="leak-recommendations">
          <h5>Recommendations:</h5>
          <ul>
            <For each={leakDetection().recommendations}>{recommendation => <li>{recommendation}</li>}</For>
          </ul>
        </div>
      </div>

      {/* Memory Usage Chart */}
      <div class="memory-chart">
        <h4>Memory Usage Over Time</h4>
        <Chart
          type="line"
          labels={getMemoryChartData().map(entry => new Date(entry.timestamp).toLocaleTimeString())}
          datasets={[
            {
              label: "Memory Usage",
              data: getMemoryChartData().map(entry => entry.value),
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
        <div class="last-update">Last updated: {lastUpdate().toLocaleString()}</div>
      </Show>
    </div>
  );
};
