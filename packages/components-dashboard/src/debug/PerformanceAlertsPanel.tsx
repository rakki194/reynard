/**
 * PerformanceAlertsPanel Component
 * Performance alerts and warnings management
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
import { Button } from "reynard-components-core/primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";

export interface PerformanceAlertsPanelProps {
  /** Performance warnings */
  warnings: Array<{
    id: string;
    type: "critical" | "high" | "medium" | "low";
    message: string;
    value: number;
    threshold: number;
    timestamp: number;
    severity: "critical" | "high" | "medium" | "low";
  }>;
  /** Auto-refresh interval in milliseconds */
  refreshInterval?: number;
}

export interface PerformanceAlert {
  id: string;
  type: "critical" | "high" | "medium" | "low";
  message: string;
  value: number;
  threshold: number;
  timestamp: number;
  severity: "critical" | "high" | "medium" | "low";
  acknowledged: boolean;
  resolved: boolean;
  category: string;
  impact: string;
  recommendation: string;
}

export interface AlertSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  acknowledged: number;
  resolved: number;
  unresolved: number;
}

export const PerformanceAlertsPanel: Component<PerformanceAlertsPanelProps> = (
  props,
) => {
  const [alerts, setAlerts] = createSignal<PerformanceAlert[]>([]);
  const [alertSummary, setAlertSummary] = createSignal<AlertSummary>({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    acknowledged: 0,
    resolved: 0,
    unresolved: 0,
  });
  const [selectedSeverity, setSelectedSeverity] = createSignal<string>("all");
  const [selectedStatus, setSelectedStatus] = createSignal<string>("all");
  const [isRefreshing, setIsRefreshing] = createSignal(false);
  const [lastUpdate, setLastUpdate] = createSignal<Date | null>(null);

  // Auto-refresh functionality
  let refreshInterval: ReturnType<typeof setInterval> | undefined;

  onMount(() => {
    // Initial data load
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
      // Convert warnings to alerts
      const newAlerts: PerformanceAlert[] = props.warnings.map((warning) => ({
        ...warning,
        acknowledged: false,
        resolved: false,
        category: getAlertCategory(warning.type),
        impact: getAlertImpact(warning.severity),
        recommendation: getAlertRecommendation(warning.type, warning.severity),
      }));

      setAlerts(newAlerts);

      // Calculate alert summary
      const summary: AlertSummary = {
        total: newAlerts.length,
        critical: newAlerts.filter((alert) => alert.severity === "critical")
          .length,
        high: newAlerts.filter((alert) => alert.severity === "high").length,
        medium: newAlerts.filter((alert) => alert.severity === "medium").length,
        low: newAlerts.filter((alert) => alert.severity === "low").length,
        acknowledged: newAlerts.filter((alert) => alert.acknowledged).length,
        resolved: newAlerts.filter((alert) => alert.resolved).length,
        unresolved: newAlerts.filter((alert) => !alert.resolved).length,
      };

      setAlertSummary(summary);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to update alerts:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Get alert category
  const getAlertCategory = (type: string): string => {
    switch (type) {
      case "critical":
        return "Performance";
      case "high":
        return "Performance";
      case "medium":
        return "Performance";
      case "low":
        return "Performance";
      default:
        return "Unknown";
    }
  };

  // Get alert impact
  const getAlertImpact = (severity: string): string => {
    switch (severity) {
      case "critical":
        return "Critical - Immediate action required";
      case "high":
        return "High - Action required soon";
      case "medium":
        return "Medium - Monitor closely";
      case "low":
        return "Low - Minor impact";
      default:
        return "Unknown";
    }
  };

  // Get alert recommendation
  const getAlertRecommendation = (type: string, severity: string): string => {
    if (severity === "critical") {
      return "Immediate action required - investigate and resolve immediately";
    } else if (severity === "high") {
      return "High priority - investigate and resolve within 1 hour";
    } else if (severity === "medium") {
      return "Medium priority - investigate and resolve within 4 hours";
    } else {
      return "Low priority - investigate and resolve when convenient";
    }
  };

  // Acknowledge alert
  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert,
      ),
    );
  };

  // Resolve alert
  const resolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId ? { ...alert, resolved: true } : alert,
      ),
    );
  };

  // Acknowledge all alerts
  const acknowledgeAllAlerts = () => {
    setAlerts((prev) =>
      prev.map((alert) => ({ ...alert, acknowledged: true })),
    );
  };

  // Resolve all alerts
  const resolveAllAlerts = () => {
    setAlerts((prev) => prev.map((alert) => ({ ...alert, resolved: true })));
  };

  // Clear resolved alerts
  const clearResolvedAlerts = () => {
    setAlerts((prev) => prev.filter((alert) => !alert.resolved));
  };

  // Get filtered alerts
  const getFilteredAlerts = () => {
    let filtered = alerts();

    // Filter by severity
    if (selectedSeverity() !== "all") {
      filtered = filtered.filter(
        (alert) => alert.severity === selectedSeverity(),
      );
    }

    // Filter by status
    if (selectedStatus() === "acknowledged") {
      filtered = filtered.filter((alert) => alert.acknowledged);
    } else if (selectedStatus() === "resolved") {
      filtered = filtered.filter((alert) => alert.resolved);
    } else if (selectedStatus() === "unresolved") {
      filtered = filtered.filter((alert) => !alert.resolved);
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

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return fluentIconsPackage.getIcon("dismiss-circle");
      case "high":
        return fluentIconsPackage.getIcon("warning");
      case "medium":
        return fluentIconsPackage.getIcon("info");
      case "low":
        return fluentIconsPackage.getIcon("info");
      default:
        return fluentIconsPackage.getIcon("info");
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
  const statuses = ["all", "unresolved", "acknowledged", "resolved"];

  return (
    <div class="performance-alerts-panel">
      {/* Header */}
      <div class="alerts-panel-header">
        <div class="alerts-panel-title">
          <span class="icon">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("warning")?.outerHTML || ""}
            />
          </span>
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

      {/* Bulk Actions */}
      <div class="bulk-actions">
        <Button variant="secondary" onClick={acknowledgeAllAlerts}>
          Acknowledge All
        </Button>
        <Button variant="secondary" onClick={resolveAllAlerts}>
          Resolve All
        </Button>
        <Button variant="secondary" onClick={clearResolvedAlerts}>
          Clear Resolved
        </Button>
      </div>

      {/* Alerts List */}
      <div class="alerts-list">
        <For each={getFilteredAlerts()}>
          {(alert) => (
            <div class={`alert-item ${getSeverityColor(alert.severity)}`}>
              <div class="alert-header">
                <div class="alert-severity">
                  <span class="severity-icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={
                        getSeverityIcon(alert.severity)?.outerHTML || ""
                      }
                    />
                  </span>
                  <span class="severity-text">
                    {alert.severity.toUpperCase()}
                  </span>
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
                  <div class="alert-metric">
                    <label>Category:</label>
                    <span class="value">{alert.category}</span>
                  </div>
                  <div class="alert-metric">
                    <label>Impact:</label>
                    <span class="value">{alert.impact}</span>
                  </div>
                </div>
                <div class="alert-recommendation">
                  <strong>Recommendation:</strong> {alert.recommendation}
                </div>
              </div>

              <div class="alert-actions">
                <Show when={!alert.acknowledged}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => acknowledgeAlert(alert.id)}
                  >
                    Acknowledge
                  </Button>
                </Show>
                <Show when={!alert.resolved}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => resolveAlert(alert.id)}
                  >
                    Resolve
                  </Button>
                </Show>
                <Show when={alert.acknowledged && !alert.resolved}>
                  <span class="acknowledged-badge">Acknowledged</span>
                </Show>
                <Show when={alert.resolved}>
                  <span class="resolved-badge">Resolved</span>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* No Alerts Message */}
      <Show when={getFilteredAlerts().length === 0}>
        <div class="no-alerts">
          <div class="no-alerts-icon">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={
                fluentIconsPackage.getIcon("checkmark-circle")?.outerHTML || ""
              }
            />
          </div>
          <div class="no-alerts-message">
            <h4>No alerts found</h4>
            <p>No performance alerts match the current filters.</p>
          </div>
        </div>
      </Show>

      {/* Last Update */}
      <Show when={lastUpdate()}>
        <div class="last-update">
          Last updated: {lastUpdate()!.toLocaleString()}
        </div>
      </Show>
    </div>
  );
};
