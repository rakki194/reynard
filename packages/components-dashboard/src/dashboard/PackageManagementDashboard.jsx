/**
 * PackageManagementDashboard Component
 * Comprehensive package management dashboard with discovery, installation, and lifecycle management
 */
import { Show, createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { Tabs } from "reynard-components-core/primitives";
import { Button } from "reynard-components-core/primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { PackageDiscoveryPanel } from "./PackageDiscoveryPanel";
import { PackageInstallationPanel } from "./PackageInstallationPanel";
import { PackageDependencyGraph } from "./PackageDependencyGraph";
import { PackageLifecyclePanel } from "./PackageLifecyclePanel";
import { PackageAnalyticsPanel } from "./PackageAnalyticsPanel";
import { PackageConfigurationPanel } from "./PackageConfigurationPanel";
export const PackageManagementDashboard = props => {
    const [activeTab, setActiveTab] = createSignal("overview");
    const [isRefreshing, setIsRefreshing] = createSignal(false);
    const [lastRefresh, setLastRefresh] = createSignal(null);
    const [packageSummary, setPackageSummary] = createSignal({
        totalPackages: 0,
        installedPackages: 0,
        availablePackages: 0,
        failedPackages: 0,
        loadingPackages: 0,
        disabledPackages: 0,
    });
    const [discoverySummary, setDiscoverySummary] = createSignal({
        totalDiscovered: 0,
        newPackages: 0,
        updatedPackages: 0,
        conflictedPackages: 0,
        readyToInstall: 0,
    });
    const [analyticsSummary, setAnalyticsSummary] = createSignal({
        totalLoads: 0,
        averageLoadTime: 0,
        successRate: 0,
        memoryUsage: 0,
        performanceScore: 0,
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
    // Refresh all package data
    const refreshAll = async () => {
        setIsRefreshing(true);
        try {
            // Simulate API calls to backend package management endpoints
            await Promise.all([refreshPackageData(), refreshDiscoveryData(), refreshAnalyticsData()]);
            setLastRefresh(new Date());
        }
        catch (error) {
            console.error("Failed to refresh package data:", error);
        }
        finally {
            setIsRefreshing(false);
        }
    };
    // Simulate package data refresh
    const refreshPackageData = async () => {
        // In a real implementation, this would call the backend package management endpoints
        const mockSummary = {
            totalPackages: 15,
            installedPackages: 12,
            availablePackages: 8,
            failedPackages: 1,
            loadingPackages: 0,
            disabledPackages: 2,
        };
        setPackageSummary(mockSummary);
    };
    // Simulate discovery data refresh
    const refreshDiscoveryData = async () => {
        // In a real implementation, this would call the package discovery endpoints
        const mockSummary = {
            totalDiscovered: 25,
            newPackages: 3,
            updatedPackages: 2,
            conflictedPackages: 1,
            readyToInstall: 5,
        };
        setDiscoverySummary(mockSummary);
    };
    // Simulate analytics data refresh
    const refreshAnalyticsData = async () => {
        // In a real implementation, this would call the package analytics endpoints
        const mockSummary = {
            totalLoads: 1250,
            averageLoadTime: 1.2,
            successRate: 98.5,
            memoryUsage: 256,
            performanceScore: 92,
        };
        setAnalyticsSummary(mockSummary);
    };
    // Get overall system health
    const getSystemHealth = () => {
        const summary = packageSummary();
        const discovery = discoverySummary();
        const analytics = analyticsSummary();
        if (summary.failedPackages > 0) {
            return "critical";
        }
        if (discovery.conflictedPackages > 0) {
            return "warning";
        }
        if (analytics.successRate < 95) {
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
        const summary = packageSummary();
        const discovery = discoverySummary();
        switch (health) {
            case "healthy":
                return "All packages operational";
            case "warning":
                return `${discovery.conflictedPackages} package conflicts detected`;
            case "critical":
                return `${summary.failedPackages} packages failed`;
            default:
                return "Package status unknown";
        }
    };
    // Tabs configuration
    const tabs = [
        {
            id: "overview",
            label: "Overview",
            content: (<div class="overview-tab">
          <div class="overview-grid">
            {/* Package Summary */}
            <div class="overview-card">
              <h3>Package Status</h3>
              <div class="summary-stats">
                <div class="stat-item">
                  <span class="stat-value">{packageSummary().totalPackages}</span>
                  <span class="stat-label">Total</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value success">{packageSummary().installedPackages}</span>
                  <span class="stat-label">Installed</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value info">{packageSummary().availablePackages}</span>
                  <span class="stat-label">Available</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value error">{packageSummary().failedPackages}</span>
                  <span class="stat-label">Failed</span>
                </div>
              </div>
            </div>

            {/* Discovery Summary */}
            <div class="overview-card">
              <h3>Package Discovery</h3>
              <div class="summary-stats">
                <div class="stat-item">
                  <span class="stat-value">{discoverySummary().totalDiscovered}</span>
                  <span class="stat-label">Discovered</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value success">{discoverySummary().newPackages}</span>
                  <span class="stat-label">New</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value warning">{discoverySummary().updatedPackages}</span>
                  <span class="stat-label">Updated</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value error">{discoverySummary().conflictedPackages}</span>
                  <span class="stat-label">Conflicts</span>
                </div>
              </div>
            </div>

            {/* Analytics Summary */}
            <div class="overview-card">
              <h3>Performance Analytics</h3>
              <div class="summary-stats">
                <div class="stat-item">
                  <span class="stat-value">{analyticsSummary().totalLoads}</span>
                  <span class="stat-label">Total Loads</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value success">{analyticsSummary().successRate.toFixed(1)}%</span>
                  <span class="stat-label">Success Rate</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value info">{analyticsSummary().averageLoadTime.toFixed(2)}s</span>
                  <span class="stat-label">Avg Load Time</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value warning">{analyticsSummary().performanceScore}</span>
                  <span class="stat-label">Performance</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div class="overview-card">
              <h3>Quick Actions</h3>
              <div class="quick-actions">
                <Button variant="secondary" size="sm" onClick={() => setActiveTab("discovery")}>
                  Discover Packages
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setActiveTab("installation")}>
                  Install Packages
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setActiveTab("lifecycle")}>
                  Manage Lifecycle
                </Button>
              </div>
            </div>
          </div>
        </div>),
        },
        {
            id: "discovery",
            label: "Discovery",
            content: (<div class="discovery-tab">
          <PackageDiscoveryPanel showAutoDiscovery={true} showPackageRegistry={true} showConflictResolution={true} refreshInterval={props.refreshInterval}/>
        </div>),
        },
        {
            id: "installation",
            label: "Installation",
            content: (<div class="installation-tab">
          <PackageInstallationPanel showProgress={true} showDependencies={true} showBulkOperations={true} refreshInterval={props.refreshInterval}/>
        </div>),
        },
        {
            id: "dependencies",
            label: "Dependencies",
            content: (<div class="dependencies-tab">
          <PackageDependencyGraph showConflicts={true} showResolution={true} showVisualization={true}/>
        </div>),
        },
        {
            id: "lifecycle",
            label: "Lifecycle",
            content: (<div class="lifecycle-tab">
          <PackageLifecyclePanel showLoadUnload={true} showReload={true} showBulkOperations={true} refreshInterval={props.refreshInterval}/>
        </div>),
        },
        {
            id: "analytics",
            label: "Analytics",
            content: (<div class="analytics-tab">
          <PackageAnalyticsPanel showPerformance={true} showUsage={true} showTrends={true} refreshInterval={props.refreshInterval}/>
        </div>),
        },
        {
            id: "configuration",
            label: "Configuration",
            content: (<div class="configuration-tab">
          <PackageConfigurationPanel showGlobalSettings={true} showPackageSettings={true} showAdvancedSettings={true}/>
        </div>),
        },
    ];
    return (<div class="package-management-dashboard">
      {/* Header */}
      <div class="dashboard-header">
        <div class="dashboard-title">
          <h2>{props.title || "Package Management Dashboard"}</h2>
          <div class={`system-health ${getHealthClass()}`}>
            <span class="health-icon">
              <div 
    // eslint-disable-next-line solid/no-innerhtml
    innerHTML={getHealthIcon()?.outerHTML || ""}/>
            </span>
            <span class="health-message">{getHealthMessage()}</span>
          </div>
        </div>

        <div class="dashboard-actions">
          <Button variant="primary" onClick={refreshAll} disabled={isRefreshing()}>
            <Show when={isRefreshing()} fallback="Refresh">
              <span class="spinner"/>
              Refreshing...
            </Show>
          </Button>

          <Show when={lastRefresh()}>
            <div class="last-refresh">Last updated: {lastRefresh().toLocaleTimeString()}</div>
          </Show>
        </div>
      </div>

      {/* Tabs */}
      <Tabs items={tabs} activeTab={activeTab()} onTabChange={setActiveTab} variant="underline" size="lg"/>
    </div>);
};
