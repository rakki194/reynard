/**
 * PerformanceDashboard Component
 * Comprehensive real-time performance monitoring dashboard for debugging and optimization
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
import { Button, Tabs, TabItem } from "reynard-components";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { usePerformanceMonitor } from "reynard-composables";
import { PerformanceChart, MultiDatasetChart } from "reynard-charts";
import { PerformanceMetricsPanel } from "./PerformanceMetricsPanel";
import { MemoryTrackingPanel } from "./MemoryTrackingPanel";
import { PerformanceAlertsPanel } from "./PerformanceAlertsPanel";
import { PerformanceExportPanel } from "./PerformanceExportPanel";

export interface PerformanceDashboardProps {
  /** Whether the dashboard is visible */
  isVisible: boolean;
  /** Callback to close the dashboard */
  onClose: () => void;
  /** Current dataset size */
  datasetSize?: number;
  /** Current selection count */
  selectionCount?: number;
  /** Whether to show real-time monitoring */
  showRealTimeMonitoring?: boolean;
  /** Whether to show memory tracking */
  showMemoryTracking?: boolean;
  /** Whether to show performance alerts */
  showPerformanceAlerts?: boolean;
  /** Whether to show export functionality */
  showExportFunctionality?: boolean;
  /** Auto-refresh interval in milliseconds */
  refreshInterval?: number;
}

export interface PerformanceWarning {
  id: string;
  type: "critical" | "high" | "medium" | "low";
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
  severity: "critical" | "high" | "medium" | "low";
}

export interface PerformanceHistory {
  timestamp: number;
  memoryUsage: number;
  browserResponsiveness: number;
  frameRate: number;
  selectionDuration?: number;
  itemsPerSecond?: number;
  domUpdateCount?: number;
  styleApplicationCount?: number;
  frameDropCount?: number;
}

export const PerformanceDashboard: Component<PerformanceDashboardProps> = (props) => {
  const performanceMonitor = usePerformanceMonitor();

  const [activeTab, setActiveTab] = createSignal("overview");
  const [isRecording, setIsRecording] = createSignal(false);
  const [memoryUsage, setMemoryUsage] = createSignal<number>(0);
  const [browserResponsiveness, setBrowserResponsiveness] = createSignal<number>(0);
  const [frameRate, setFrameRate] = createSignal<number>(60);
  const [warnings, setWarnings] = createSignal<PerformanceWarning[]>([]);
  const [performanceHistory, setPerformanceHistory] = createSignal<PerformanceHistory[]>([]);
  const [lastUpdate, setLastUpdate] = createSignal<Date | null>(null);

  // Auto-refresh functionality
  let refreshInterval: ReturnType<typeof setInterval> | undefined;
  let frameCount = 0;
  let lastFrameTime = performance.now();

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

  // Update performance metrics
  const updateMetrics = async () => {
    try {
      // Get current performance metrics
      const metrics = performanceMonitor.metrics();
      const currentWarnings = performanceMonitor.warnings();

      // Update memory usage
      const memory = await performanceMonitor.measureMemoryUsage();
      setMemoryUsage(memory);

      // Update browser responsiveness
      const responsiveness = await performanceMonitor.checkBrowserResponsiveness();
      setBrowserResponsiveness(responsiveness);

      // Update frame rate
      updateFrameRate();

      // Update warnings
      setWarnings(currentWarnings);

      // Update performance history
      if (metrics) {
        const historyEntry: PerformanceHistory = {
          timestamp: Date.now(),
          memoryUsage: memory,
          browserResponsiveness: responsiveness,
          frameRate: frameRate(),
          selectionDuration: metrics.operationDuration,
          itemsPerSecond: metrics.itemsPerSecond,
          domUpdateCount: metrics.domUpdateCount,
          styleApplicationCount: metrics.styleApplicationCount,
          frameDropCount: metrics.frameDropCount,
        };

        setPerformanceHistory((prev) => {
          const updated = [...prev, historyEntry];
          // Keep only last 100 data points
          return updated.slice(-100);
        });
      }

      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to update performance metrics:", error);
    }
  };

  // Update frame rate
  const updateFrameRate = () => {
    frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - lastFrameTime;

    if (deltaTime >= 1000) {
      const fps = Math.round((frameCount * 1000) / deltaTime);
      setFrameRate(fps);
      frameCount = 0;
      lastFrameTime = currentTime;
    }
  };

  // Start/stop recording
  const toggleRecording = () => {
    if (isRecording()) {
      performanceMonitor.stopRenderingMonitoring();
      setIsRecording(false);
    } else {
      performanceMonitor.monitorRenderingPerformance();
      setIsRecording(true);
    }
  };

  // Clear metrics
  const clearMetrics = () => {
    performanceMonitor.clearMetrics();
    setPerformanceHistory([]);
    setWarnings([]);
  };

  // Export performance data
  const exportPerformanceData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      datasetSize: props.datasetSize || 0,
      selectionCount: props.selectionCount || 0,
      currentMetrics: performanceMonitor.metrics(),
      warnings: warnings(),
      performanceHistory: performanceHistory(),
      memoryUsage: memoryUsage(),
      browserResponsiveness: browserResponsiveness(),
      frameRate: frameRate(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  // Get performance status
  const getPerformanceStatus = () => {
    const currentWarnings = warnings();
    const criticalWarnings = currentWarnings.filter((w) => w.severity === "critical").length;
    const highWarnings = currentWarnings.filter((w) => w.severity === "high").length;

    if (criticalWarnings > 0) {
      return "critical";
    } else if (highWarnings > 0) {
      return "warning";
    } else if (frameRate() < 30) {
      return "warning";
    } else if (browserResponsiveness() > 100) {
      return "warning";
    } else {
      return "healthy";
    }
  };

  // Get status icon
  const getStatusIcon = () => {
    const status = getPerformanceStatus();

    switch (status) {
      case "healthy":
        return fluentIconsPackage.getIcon("checkmark-circle");
      case "warning":
        return fluentIconsPackage.getIcon("warning");
      case "critical":
        return fluentIconsPackage.getIcon("dismiss-circle");
      default:
        return fluentIconsPackage.getIcon("info");
    }
  };

  // Get status class
  const getStatusClass = () => {
    const status = getPerformanceStatus();

    switch (status) {
      case "healthy":
        return "status-healthy";
      case "warning":
        return "status-warning";
      case "critical":
        return "status-critical";
      default:
        return "status-unknown";
    }
  };

  // Get status message
  const getStatusMessage = () => {
    const status = getPerformanceStatus();
    const currentWarnings = warnings();

    switch (status) {
      case "healthy":
        return "Performance is optimal";
      case "warning":
        return `${currentWarnings.filter((w) => w.severity === "high").length} performance warnings`;
      case "critical":
        return `${currentWarnings.filter((w) => w.severity === "critical").length} critical issues`;
      default:
        return "Performance status unknown";
    }
  };

  // Tabs configuration
  const tabs: TabItem[] = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div class="overview-tab">
          <div class="overview-grid">
            {/* Current Status */}
            <div class="status-card">
              <h3>Current Status</h3>
              <div class="status-grid">
                <div class="status-item">
                  <label>Dataset Size</label>
                  <span class="value">{(props.datasetSize || 0).toLocaleString()}</span>
                </div>
                <div class="status-item">
                  <label>Selected Items</label>
                  <span class="value">{(props.selectionCount || 0).toLocaleString()}</span>
                </div>
                <div class="status-item">
                  <label>Memory Usage</label>
                  <span class="value">{formatMemory(memoryUsage())}</span>
                </div>
                <div class="status-item">
                  <label>Browser Response</label>
                  <span
                    class="value"
                    classList={{
                      warning: browserResponsiveness() > 50,
                      error: browserResponsiveness() > 100,
                    }}
                  >
                    {formatDuration(browserResponsiveness())}
                  </span>
                </div>
                <div class="status-item">
                  <label>Frame Rate</label>
                  <span
                    class="value"
                    classList={{
                      warning: frameRate() < 55,
                      error: frameRate() < 30,
                    }}
                  >
                    {frameRate()} fps
                  </span>
                </div>
                <div class="status-item">
                  <label>Recording</label>
                  <span class="value" classList={{ recording: isRecording() }}>
                    {isRecording() ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Status */}
            <div class="status-card">
              <h3>Performance Status</h3>
              <div class={`performance-status ${getStatusClass()}`}>
                <span class="status-icon">
                  <div
                    // eslint-disable-next-line solid/no-innerhtml
                    innerHTML={getStatusIcon()?.outerHTML || ""}
                  />
                </span>
                <span class="status-message">{getStatusMessage()}</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div class="status-card">
              <h3>Quick Actions</h3>
              <div class="quick-actions">
                <Button
                  variant={isRecording() ? "error" : "primary"}
                  onClick={toggleRecording}
                >
                  {isRecording() ? "Stop Recording" : "Start Recording"}
                </Button>
                <Button variant="secondary" onClick={clearMetrics}>
                  Clear Metrics
                </Button>
                <Button variant="secondary" onClick={exportPerformanceData}>
                  Export Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "metrics",
      label: "Metrics",
      content: (
        <div class="metrics-tab">
          <PerformanceMetricsPanel
            performanceHistory={performanceHistory()}
            refreshInterval={props.refreshInterval}
          />
        </div>
      ),
    },
    {
      id: "memory",
      label: "Memory",
      content: (
        <div class="memory-tab">
          <MemoryTrackingPanel
            memoryUsage={memoryUsage()}
            performanceHistory={performanceHistory()}
            refreshInterval={props.refreshInterval}
          />
        </div>
      ),
    },
    {
      id: "alerts",
      label: "Alerts",
      content: (
        <div class="alerts-tab">
          <PerformanceAlertsPanel
            warnings={warnings()}
            refreshInterval={props.refreshInterval}
          />
        </div>
      ),
    },
    {
      id: "export",
      label: "Export",
      content: (
        <div class="export-tab">
          <PerformanceExportPanel
            performanceHistory={performanceHistory()}
            warnings={warnings()}
            onExport={exportPerformanceData}
          />
        </div>
      ),
    },
  ];

  return (
    <Show when={props.isVisible}>
      <div class="performance-dashboard-overlay">
        <div class="performance-dashboard">
          {/* Header */}
          <div class="dashboard-header">
            <div class="dashboard-title">
              <span class="icon">
                <div
                  // eslint-disable-next-line solid/no-innerhtml
                  innerHTML={fluentIconsPackage.getIcon("chart-multiple")?.outerHTML || ""}
                />
              </span>
              <h2>Performance Dashboard</h2>
            </div>

            <div class="dashboard-actions">
              <Button variant="secondary" onClick={props.onClose}>
                Close
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs
            items={tabs}
            activeTab={activeTab()}
            onTabChange={setActiveTab}
            variant="underline"
            size="lg"
          />

          {/* Last Update */}
          <Show when={lastUpdate()}>
            <div class="last-update">
              Last updated: {lastUpdate()!.toLocaleString()}
            </div>
          </Show>
        </div>
      </div>
    </Show>
  );
};
