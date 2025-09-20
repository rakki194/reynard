/**
 * ServiceManagementDashboard Component
 * Comprehensive service management dashboard with real-time monitoring and control
 */
import { Show, createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { Tabs } from "reynard-components-core/primitives";
import { Button } from "reynard-components-core/primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { ServiceStatusPanel } from "./ServiceStatusPanel";
import { ServiceRestartPanel } from "./ServiceRestartPanel";
import { FeatureAvailabilityPanel } from "./FeatureAvailabilityPanel";
import { ServiceAuthStatus } from "./ServiceAuthStatus";
export const ServiceManagementDashboard = props => {
  const [activeTab, setActiveTab] = createSignal("overview");
  const [isRefreshing, setIsRefreshing] = createSignal(false);
  const [lastRefresh, setLastRefresh] = createSignal(null);
  const [serviceSummary, setServiceSummary] = createSignal({
    totalServices: 0,
    runningServices: 0,
    healthyServices: 0,
    failedServices: 0,
    startingServices: 0,
    stoppingServices: 0,
  });
  const [featureSummary, setFeatureSummary] = createSignal({
    total: 0,
    available: 0,
    degraded: 0,
    unavailable: 0,
    criticalUnavailable: 0,
  });
  const [authStatus, setAuthStatus] = createSignal({
    criticalServicesAvailable: true,
    totalServices: 0,
    availableServices: 0,
    failedServices: 0,
  });
  // Auto-refresh functionality
  let refreshInterval;
  onMount(() => {
    // Initial data load
    refreshAll();
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
      refreshInterval = setInterval(async () => {
        await refreshAll();
      }, props.refreshInterval);
    }
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  });
  // Refresh all service data
  const refreshAll = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API calls to backend health endpoints
      await Promise.all([refreshServiceData(), refreshFeatureData(), refreshAuthData()]);
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Failed to refresh service data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  // Simulate service data refresh
  const refreshServiceData = async () => {
    // In a real implementation, this would call the backend health endpoints
    // For now, we'll simulate with mock data
    const mockSummary = {
      totalServices: 8,
      runningServices: 7,
      healthyServices: 6,
      failedServices: 1,
      startingServices: 0,
      stoppingServices: 0,
    };
    setServiceSummary(mockSummary);
  };
  // Simulate feature data refresh
  const refreshFeatureData = async () => {
    // In a real implementation, this would call the feature management system
    const mockSummary = {
      total: 12,
      available: 10,
      degraded: 1,
      unavailable: 1,
      criticalUnavailable: 0,
    };
    setFeatureSummary(mockSummary);
  };
  // Simulate auth data refresh
  const refreshAuthData = async () => {
    // In a real implementation, this would call the auth service health endpoint
    const mockStatus = {
      criticalServicesAvailable: true,
      totalServices: 3,
      availableServices: 3,
      failedServices: 0,
    };
    setAuthStatus(mockStatus);
  };
  // Get overall system health
  const getSystemHealth = () => {
    const summary = serviceSummary();
    const features = featureSummary();
    const auth = authStatus();
    if (summary.failedServices > 0) {
      return "critical";
    }
    if (features.criticalUnavailable > 0) {
      return "warning";
    }
    if (!auth.criticalServicesAvailable) {
      return "warning";
    }
    return "healthy";
  };
  // Get health icon
  const getHealthIcon = () => {
    const health = getSystemHealth();
    switch (health) {
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
  // Get health class
  const getHealthClass = () => {
    const health = getSystemHealth();
    switch (health) {
      case "healthy":
        return "health-healthy";
      case "warning":
        return "health-warning";
      case "critical":
        return "health-critical";
      default:
        return "health-unknown";
    }
  };
  // Get health message
  const getHealthMessage = () => {
    const health = getSystemHealth();
    const summary = serviceSummary();
    const features = featureSummary();
    switch (health) {
      case "healthy":
        return "All systems operational";
      case "warning":
        return `${features.criticalUnavailable} critical features unavailable`;
      case "critical":
        return `${summary.failedServices} services failed`;
      default:
        return "System status unknown";
    }
  };
  // Tabs configuration
  const tabs = [
    {
      id: "overview",
      label: "Overview",
      content: (
        <div class="overview-tab">
          <div class="overview-grid">
            {/* Service Summary */}
            <div class="overview-card">
              <h3>Service Status</h3>
              <div class="summary-stats">
                <div class="stat-item">
                  <span class="stat-value">{serviceSummary().totalServices}</span>
                  <span class="stat-label">Total</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value success">{serviceSummary().runningServices}</span>
                  <span class="stat-label">Running</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value warning">{serviceSummary().healthyServices}</span>
                  <span class="stat-label">Healthy</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value error">{serviceSummary().failedServices}</span>
                  <span class="stat-label">Failed</span>
                </div>
              </div>
            </div>

            {/* Feature Summary */}
            <div class="overview-card">
              <h3>Feature Availability</h3>
              <div class="summary-stats">
                <div class="stat-item">
                  <span class="stat-value">{featureSummary().total}</span>
                  <span class="stat-label">Total</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value success">{featureSummary().available}</span>
                  <span class="stat-label">Available</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value warning">{featureSummary().degraded}</span>
                  <span class="stat-label">Degraded</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value error">{featureSummary().unavailable}</span>
                  <span class="stat-label">Unavailable</span>
                </div>
              </div>
            </div>

            {/* Auth Status */}
            <Show when={props.showAuthStatus}>
              <div class="overview-card">
                <h3>Authentication Status</h3>
                <ServiceAuthStatus compact showProgress />
              </div>
            </Show>

            {/* Quick Actions */}
            <div class="overview-card">
              <h3>Quick Actions</h3>
              <div class="quick-actions">
                <Button variant="secondary" size="sm" onClick={() => setActiveTab("services")}>
                  View Services
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setActiveTab("features")}>
                  View Features
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setActiveTab("restart")}>
                  Restart Services
                </Button>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "services",
      label: "Services",
      content: (
        <div class="services-tab">
          <ServiceStatusPanel
            showDetails={true}
            showActions={true}
            showProgress={true}
            showDependencies={true}
            showMetrics={true}
            refreshInterval={props.refreshInterval}
          />
        </div>
      ),
    },
    {
      id: "features",
      label: "Features",
      content: (
        <div class="features-tab">
          <FeatureAvailabilityPanel showCategories={true} showPriorities={true} showDependencies={true} />
        </div>
      ),
    },
    {
      id: "restart",
      label: "Restart",
      content: (
        <div class="restart-tab">
          <ServiceRestartPanel showFailedOnly={false} showRecoveryOptions={true} showBulkActions={true} />
        </div>
      ),
    },
    {
      id: "auth",
      label: "Auth",
      content: (
        <div class="auth-tab">
          <ServiceAuthStatus showCriticalOnly={false} showProgress={true} showRetryButton={true} />
        </div>
      ),
    },
  ];
  return (
    <div class="service-management-dashboard">
      {/* Header */}
      <div class="dashboard-header">
        <div class="dashboard-title">
          <h2>{props.title || "Service Management Dashboard"}</h2>
          <div class={`system-health ${getHealthClass()}`}>
            <span class="health-icon">
              <div
                // eslint-disable-next-line solid/no-innerhtml
                innerHTML={getHealthIcon()?.outerHTML || ""}
              />
            </span>
            <span class="health-message">{getHealthMessage()}</span>
          </div>
        </div>

        <div class="dashboard-actions">
          <Button variant="primary" onClick={refreshAll} disabled={isRefreshing()}>
            <Show when={isRefreshing()} fallback="Refresh">
              <span class="spinner" />
              Refreshing...
            </Show>
          </Button>

          <Show when={lastRefresh()}>
            <div class="last-refresh">Last updated: {lastRefresh().toLocaleTimeString()}</div>
          </Show>
        </div>
      </div>

      {/* Tabs */}
      <Tabs items={tabs} activeTab={activeTab()} onTabChange={setActiveTab} variant="underline" size="lg" />
    </div>
  );
};
