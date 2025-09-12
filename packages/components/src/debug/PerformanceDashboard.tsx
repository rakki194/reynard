/**
 * PerformanceDashboard Component
 * Main orchestrator for performance monitoring dashboard
 */

import { usePerformanceMonitor } from "reynard-composables";
import {
  Component,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";
import { Button } from "../primitives/Button";
import { Tabs } from "../Tabs";
import { PerformanceAlertsTab } from "./PerformanceAlertsTab";
import { PerformanceExportTab } from "./PerformanceExportTab";
import { PerformanceMemoryTab } from "./PerformanceMemoryTab";
import { PerformanceMetricsTab } from "./PerformanceMetricsTab";
import { PerformanceOverviewTab } from "./PerformanceOverviewTab";

export interface PerformanceDashboardProps {
  isVisible: boolean;
  onClose: () => void;
  datasetSize?: number;
  selectionCount?: number;
  refreshInterval?: number;
}

export interface PerformanceWarning {
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

export const PerformanceDashboard: Component<PerformanceDashboardProps> = (
  props,
) => {
  const performanceMonitor = usePerformanceMonitor();
  const [activeTab, setActiveTab] = createSignal("overview");
  const [isRecording, setIsRecording] = createSignal(false);
  const [memoryUsage, setMemoryUsage] = createSignal<number>(0);
  const [browserResponsiveness, setBrowserResponsiveness] =
    createSignal<number>(0);
  const [frameRate, setFrameRate] = createSignal<number>(60);
  const [warnings, setWarnings] = createSignal<PerformanceWarning[]>([]);
  const [performanceHistory, setPerformanceHistory] = createSignal<
    PerformanceHistory[]
  >([]);
  const [lastUpdate, setLastUpdate] = createSignal<Date | null>(null);

  // Auto-refresh functionality
  let refreshInterval: ReturnType<typeof setInterval> | undefined;
  let frameCount = 0;
  let lastFrameTime = performance.now();

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

  // Update performance metrics
  const updateMetrics = async () => {
    try {
      const metrics = performanceMonitor.metrics();
      const currentWarnings = performanceMonitor.warnings();

      const memory = await performanceMonitor.measureMemoryUsage();
      setMemoryUsage(memory);

      const responsiveness =
        await performanceMonitor.checkBrowserResponsiveness();
      setBrowserResponsiveness(responsiveness);

      updateFrameRate();

      // Convert warnings to our format
      const convertedWarnings: PerformanceWarning[] = currentWarnings.map(
        (warning, index) => ({
          type: warning.severity,
          message: warning.message,
          value: warning.value,
          threshold: warning.threshold,
          timestamp: warning.timestamp,
          severity: warning.severity,
        }),
      );
      setWarnings(convertedWarnings);

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
          return updated.slice(-100); // Keep only last 100 data points
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

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Tabs configuration
  const tabs: TabItem[] = [
    { id: "overview", label: "Overview" },
    { id: "metrics", label: "Metrics" },
    { id: "memory", label: "Memory" },
    { id: "alerts", label: "Alerts" },
    { id: "export", label: "Export" },
  ];

  return (
    <Show when={props.isVisible}>
      <div class="performance-dashboard-overlay">
        <div class="performance-dashboard">
          {/* Header */}
          <div class="dashboard-header">
            <div class="dashboard-title">
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

          {/* Tab Content */}
          <Show when={activeTab() === "overview"}>
            <PerformanceOverviewTab
              datasetSize={props.datasetSize || 0}
              selectionCount={props.selectionCount || 0}
              memoryUsage={memoryUsage()}
              browserResponsiveness={browserResponsiveness()}
              frameRate={frameRate()}
              isRecording={isRecording()}
              onToggleRecording={toggleRecording}
              onClearMetrics={clearMetrics}
              onExportData={exportPerformanceData}
            />
          </Show>

          <Show when={activeTab() === "metrics"}>
            <PerformanceMetricsTab
              performanceHistory={performanceHistory()}
              refreshInterval={props.refreshInterval}
            />
          </Show>

          <Show when={activeTab() === "memory"}>
            <PerformanceMemoryTab
              memoryUsage={memoryUsage()}
              performanceHistory={performanceHistory()}
              refreshInterval={props.refreshInterval}
            />
          </Show>

          <Show when={activeTab() === "alerts"}>
            <PerformanceAlertsTab
              warnings={warnings()}
              refreshInterval={props.refreshInterval}
            />
          </Show>

          <Show when={activeTab() === "export"}>
            <PerformanceExportTab
              performanceHistory={performanceHistory()}
              warnings={warnings()}
              onExport={exportPerformanceData}
            />
          </Show>

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
