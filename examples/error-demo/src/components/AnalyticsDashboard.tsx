/**
 * Analytics Dashboard Component
 * Displays error analytics and recovery statistics
 */

import { Component, createSignal, createEffect, Show, For } from "solid-js";
// Simple icon components for demo
interface IconProps {
  size?: number;
  style?: Record<string, string>;
  [key: string]: unknown;
}

const Database = (props: IconProps) => <span {...props}>🗄️</span>;
const Bug = (props: IconProps) => <span {...props}>🐛</span>;
// Unused icons removed
const CheckmarkCircle = (props: IconProps) => <span {...props}>✅</span>;
const XCircle = (props: IconProps) => <span {...props}>❌</span>;
const AlertTriangle = (props: IconProps) => <span {...props}>⚠️</span>;
const Info = (props: IconProps) => <span {...props}>ℹ️</span>;
const Refresh = (props: IconProps) => <span {...props}>🔄</span>;

interface AnalyticsData {
  total_errors?: number;
  recovery_attempts?: number;
  success_rate?: number;
  average_recovery_time?: number;
  error_rate?: number;
  uptime?: number;
}

interface AnalyticsProps {
  analytics: AnalyticsData | null;
  onRefresh: () => void;
}

interface ErrorReport {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  severity: "low" | "medium" | "high" | "critical";
  category: "network" | "validation" | "authentication" | "rendering";
  resolved: boolean;
}

const AnalyticsDashboard: Component<AnalyticsProps> = (props) => {
  const [loading, setLoading] = createSignal(false);
  const [errorReports, setErrorReports] = createSignal<ErrorReport[]>([]);
  const [_recoveryStats, setRecoveryStats] = createSignal<AnalyticsData | null>(
    null,
  );

  createEffect(() => {
    if (props.analytics) {
      setRecoveryStats(props.analytics);
    }
  });

  const loadErrorReports = async () => {
    setLoading(true);
    try {
      // Simulate loading error reports
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock error reports data
      const mockReports: ErrorReport[] = [
        {
          id: "error-1",
          type: "NetworkError",
          message: "Failed to fetch user data",
          timestamp: Date.now() - 300000,
          severity: "medium",
          category: "network",
          resolved: true,
        },
        {
          id: "error-2",
          type: "ValidationError",
          message: "Invalid email format",
          timestamp: Date.now() - 600000,
          severity: "low",
          category: "validation",
          resolved: true,
        },
        {
          id: "error-3",
          type: "AuthError",
          message: "Session expired",
          timestamp: Date.now() - 900000,
          severity: "high",
          category: "authentication",
          resolved: false,
        },
        {
          id: "error-4",
          type: "RenderingError",
          message: "Component failed to render",
          timestamp: Date.now() - 1200000,
          severity: "medium",
          category: "rendering",
          resolved: true,
        },
      ];

      setErrorReports(mockReports);
    } catch (error) {
      console.error("Failed to load error reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    setLoading(true);
    try {
      await props.onRefresh();
      await loadErrorReports();
    } catch (error) {
      console.error("Failed to refresh analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  createEffect(() => {
    loadErrorReports();
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "network":
        return <Database size={16} />;
      case "validation":
        return <AlertTriangle size={16} />;
      case "authentication":
        return <XCircle size={16} />;
      case "rendering":
        return <Bug size={16} />;
      default:
        return <Info size={16} />;
    }
  };

  return (
    <div class="error-demo-container">
      <div class="error-demo-header">
        <Database size={32} />
        <div>
          <h2>Error Analytics Dashboard</h2>
          <p>
            Real-time error monitoring, recovery statistics, and performance
            metrics
          </p>
        </div>
        <button
          class="btn btn-primary"
          onClick={refreshAnalytics}
          disabled={loading()}
        >
          <Refresh size={16} />
          Refresh
        </button>
      </div>

      {/* Analytics Overview */}
      <Show when={props.analytics}>
        <div class="analytics-grid">
          <div class="analytics-card">
            <h4>Total Errors</h4>
            <div class="value">{props.analytics?.total_errors || 0}</div>
          </div>
          <div class="analytics-card">
            <h4>Recovery Attempts</h4>
            <div class="value">{props.analytics?.recovery_attempts || 0}</div>
          </div>
          <div class="analytics-card">
            <h4>Success Rate</h4>
            <div
              class={`value ${(props.analytics?.success_rate || 0) > 0.7 ? "analytics-success-rate" : "analytics-warning-rate"}`}
            >
              {Math.round((props.analytics?.success_rate || 0) * 100)}%
            </div>
          </div>
          <div class="analytics-card">
            <h4>Avg Recovery Time</h4>
            <div class="value">
              {(props.analytics?.average_recovery_time || 0).toFixed(2)}s
            </div>
          </div>
        </div>
      </Show>

      <div class="error-demo-content">
        <div class="error-demo-sidebar">
          <h3>Error Categories</h3>
          <div class="error-categories">
            <div class="error-category-item">
              <Database size={16} />
              <span>Network Errors</span>
            </div>
            <div class="error-category-item">
              <AlertTriangle size={16} />
              <span>Validation Errors</span>
            </div>
            <div class="error-category-item">
              <XCircle size={16} />
              <span>Authentication Errors</span>
            </div>
            <div class="error-category-item">
              <Bug size={16} />
              <span>Rendering Errors</span>
            </div>
          </div>

          <div class="system-status-card">
            <h4 class="system-status-title">System Status</h4>
            <div class="system-status-content">
              <div class="system-status-item">
                <CheckmarkCircle size={16} style={{ color: "#10b981" }} />
                <span>Error Boundaries Active</span>
              </div>
              <div class="system-status-item">
                <CheckmarkCircle size={16} style={{ color: "#10b981" }} />
                <span>Recovery Strategies Ready</span>
              </div>
              <div class="system-status-item">
                <CheckmarkCircle size={16} style={{ color: "#10b981" }} />
                <span>Error Reporting Active</span>
              </div>
            </div>
          </div>
        </div>

        <div class="error-demo-main">
          <h3>Recent Error Reports</h3>

          <Show when={loading()}>
            <div class="loading">Loading error reports...</div>
          </Show>

          <Show when={!loading() && errorReports().length > 0}>
            <div class="error-reports-list">
              <For each={errorReports()}>
                {(report) => (
                  <div class="error-report-card">
                    <div class="error-report-header">
                      <div class="error-report-info">
                        {getCategoryIcon(report.category)}
                        <strong>{report.type}</strong>
                        <div
                          class={`severity-indicator severity-${report.severity}`}
                        />
                      </div>
                      <div class="error-report-meta">
                        {report.resolved ? (
                          <CheckmarkCircle
                            size={16}
                            style={{ color: "#10b981" }}
                          />
                        ) : (
                          <XCircle size={16} style={{ color: "#ef4444" }} />
                        )}
                        <span class="error-report-timestamp">
                          {new Date(report.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                    <p class="error-report-message">{report.message}</p>
                  </div>
                )}
              </For>
            </div>
          </Show>

          <Show when={!loading() && errorReports().length === 0}>
            <div class="status-message status-info">
              <Info size={16} />
              <span>
                No error reports available. Try triggering some errors in the
                Error Demos section.
              </span>
            </div>
          </Show>
        </div>
      </div>

      {/* Performance Metrics */}
      <div class="performance-metrics">
        <h3>Performance Metrics</h3>
        <div class="analytics-grid">
          <div class="analytics-card">
            <h4>Error Rate</h4>
            <div class="value performance-error-rate">
              {props.analytics?.error_rate
                ? (props.analytics.error_rate * 100).toFixed(2)
                : 0}
              %
            </div>
          </div>
          <div class="analytics-card">
            <h4>Recovery Success</h4>
            <div class="value performance-success-rate">
              {props.analytics?.success_rate
                ? Math.round(props.analytics.success_rate * 100)
                : 0}
              %
            </div>
          </div>
          <div class="analytics-card">
            <h4>Avg Response Time</h4>
            <div class="value">
              {(props.analytics?.average_recovery_time || 0).toFixed(2)}s
            </div>
          </div>
          <div class="analytics-card">
            <h4>System Uptime</h4>
            <div class="value performance-uptime">
              {props.analytics?.uptime
                ? Math.round(props.analytics.uptime / 3600)
                : 0}
              h
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
