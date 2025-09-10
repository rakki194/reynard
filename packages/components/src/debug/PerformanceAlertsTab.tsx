/**
 * PerformanceAlertsTab Component
 * Performance alerts tab for performance dashboard
 */

import { Component, For, Show, createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { Button } from "../primitives/Button";

export interface PerformanceAlertsTabProps {
  warnings: Array<{
    type: "critical" | "high" | "medium" | "low";
    message: string;
    value: number;
    threshold: number;
    timestamp: number;
    severity: "critical" | "high" | "medium" | "low";
  }>;
  refreshInterval?: number;
}

export const PerformanceAlertsTab: Component<PerformanceAlertsTabProps> = (props) => {
  const [selectedSeverity, setSelectedSeverity] = createSignal<string>("all");
  const [selectedStatus, setSelectedStatus] = createSignal<string>("all");
  const [isRefreshing, setIsRefreshing] = createSignal(false);
  const [lastUpdate, setLastUpdate] = createSignal<Date | null>(null);
  const [alertSummary, setAlertSummary] = createSignal({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    unresolved: 0,
  });

  // Auto-refresh functionality
  let refreshInterval: ReturnType<typeof setInterval> | undefined;

  onMount(() => {
    updateAlerts();
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
        updateAlerts();
      }, props.refreshInterval);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  });

  // Update alerts
  const updateAlerts = async () => {
    setIsRefreshing(true);
    try {
      const warnings = props.warnings;

      // Calculate alert summary
      const summary = {
        total: warnings.length,
        critical: warnings.filter((w) => w.severity === "critical").length,
        high: warnings.filter((w) => w.severity === "high").length,
        medium: warnings.filter((w) => w.severity === "medium").length,
        low: warnings.filter((w) => w.severity === "low").length,
        unresolved: warnings.length, // All warnings are unresolved for now
      };

      setAlertSummary(summary);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to update alerts:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get filtered alerts
  const getFilteredAlerts = () => {
    let filtered = props.warnings;

    // Filter by severity
    if (selectedSeverity() !== "all") {
      filtered = filtered.filter((alert) => alert.severity === selectedSeverity());
    }

    // Filter by status (all are unresolved for now)
    if (selectedStatus() === "unresolved") {
      filtered = filtered.filter((alert) => true); // All are unresolved
    } else if (selectedStatus() === "resolved") {
      filtered = []; // None are resolved
    }

    return filtered;
  };

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "error";
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "neutral";
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp: number): string => {
    return new Date(timestamp).toLocaleString();
  };

  // Format duration
  const formatDuration = (ms: number): string => {
    if (ms < 1000) {
      return `${ms.toFixed(0)}ms`;
    } else {
      return `${(ms / 1000).toFixed(2)}s`;
    }
  };

  const severities = ["all", "critical", "high", "medium", "low"];
  const statuses = ["all", "unresolved", "resolved"];

  return (
    <div class="performance-alerts-panel">
      {/* Header */}
      <div class="alerts-panel-header">
        <div class="alerts-panel-title">
          <h3>Performance Alerts</h3>
        </div>

        <div class="alerts-panel-actions">
          <Button
            variant="secondary"
            onClick={updateAlerts}
            disabled={isRefreshing()}
          >
            <Show when={isRefreshing()} fallback="Refresh">
              <span class="spinner"></span>
              Refreshing...
            </Show>
          </Button>
        </div>
      </div>

      {/* Alert Summary */}
      <div class="alert-summary">
        <div class="summary-grid">
          <div class="summary-item">
            <label>Total Alerts</label>
            <span class="value">{alertSummary().total}</span>
          </div>
          <div class="summary-item critical">
            <label>Critical</label>
            <span class="value">{alertSummary().critical}</span>
          </div>
          <div class="summary-item high">
            <label>High</label>
            <span class="value">{alertSummary().high}</span>
          </div>
          <div class="summary-item medium">
            <label>Medium</label>
            <span class="value">{alertSummary().medium}</span>
          </div>
          <div class="summary-item low">
            <label>Low</label>
            <span class="value">{alertSummary().low}</span>
          </div>
          <div class="summary-item">
            <label>Unresolved</label>
            <span class="value">{alertSummary().unresolved}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div class="alert-filters">
        <div class="filter-group">
          <label>Severity:</label>
          <select
            value={selectedSeverity()}
            onChange={(e) => setSelectedSeverity(e.currentTarget.value)}
            title="Filter by severity"
          >
            <For each={severities}>
              {(severity) => <option value={severity}>{severity}</option>}
            </For>
          </select>
        </div>

        <div class="filter-group">
          <label>Status:</label>
          <select
            value={selectedStatus()}
            onChange={(e) => setSelectedStatus(e.currentTarget.value)}
            title="Filter by status"
          >
            <For each={statuses}>
              {(status) => <option value={status}>{status}</option>}
            </For>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div class="alerts-list">
        <For each={getFilteredAlerts()}>
          {(alert) => (
            <div class={`alert-item ${getSeverityColor(alert.severity)}`}>
              <div class="alert-header">
                <div class="alert-severity">
                  <span class="severity-text">{alert.severity.toUpperCase()}</span>
                </div>
                <div class="alert-timestamp">
                  {formatTimestamp(alert.timestamp)}
                </div>
              </div>

              <div class="alert-content">
                <div class="alert-message">{alert.message}</div>
                <div class="alert-details">
                  <div class="alert-metric">
                    <label>Value:</label>
                    <span class="value">{formatDuration(alert.value)}</span>
                  </div>
                  <div class="alert-metric">
                    <label>Threshold:</label>
                    <span class="value">{formatDuration(alert.threshold)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* No Alerts Message */}
      <Show when={getFilteredAlerts().length === 0}>
        <div class="no-alerts">
          <div class="no-alerts-message">
            <h4>No alerts found</h4>
            <p>No performance alerts match the current filters.</p>
          </div>
        </div>
      </Show>

      {/* Last Update */}
      <Show when={lastUpdate()}>
        <div class="last-update">Last updated: {lastUpdate()!.toLocaleString()}</div>
      </Show>
    </div>
  );
};
