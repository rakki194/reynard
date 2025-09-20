/**
 * PackageAnalyticsPanel Component
 * Package usage analytics and performance monitoring interface
 */
import { For, Show, createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { Button, TextField, Select } from "reynard-components-core/primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
export const PackageAnalyticsPanel = props => {
  const [analytics, setAnalytics] = createSignal([]);
  const [summary, setSummary] = createSignal({
    totalPackages: 0,
    totalLoads: 0,
    averageLoadTime: 0,
    overallSuccessRate: 0,
    totalMemoryUsage: 0,
    peakMemoryUsage: 0,
    performanceScore: 0,
    errorRate: 0,
  });
  const [isRefreshing, setIsRefreshing] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedFrequency, setSelectedFrequency] = createSignal("all");
  const [sortBy, setSortBy] = createSignal("loadCount");
  const [sortOrder, setSortOrder] = createSignal("desc");
  const [lastUpdate, setLastUpdate] = createSignal(null);
  // Auto-refresh functionality
  let refreshInterval;
  onMount(() => {
    // Initial data load
    refreshAnalyticsData();
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
        refreshAnalyticsData();
      }, props.refreshInterval);
    }
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  });
  // Refresh analytics data
  const refreshAnalyticsData = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API calls to backend analytics endpoints
      const mockAnalytics = [
        {
          name: "torch",
          version: "2.1.0",
          loadCount: 1250,
          totalLoadTime: 3125, // 52 minutes
          averageLoadTime: 2.5,
          successRate: 98.5,
          memoryUsage: 1024 * 1024 * 1024, // 1GB
          peakMemoryUsage: 1536 * 1024 * 1024, // 1.5GB
          lastUsed: new Date(Date.now() - 300000), // 5 minutes ago
          usageFrequency: "high",
          performanceScore: 92,
          errorCount: 19,
          dependencies: ["numpy", "typing-extensions"],
        },
        {
          name: "transformers",
          version: "4.35.0",
          loadCount: 850,
          totalLoadTime: 1530, // 25.5 minutes
          averageLoadTime: 1.8,
          successRate: 99.2,
          memoryUsage: 512 * 1024 * 1024, // 512MB
          peakMemoryUsage: 768 * 1024 * 1024, // 768MB
          lastUsed: new Date(Date.now() - 600000), // 10 minutes ago
          usageFrequency: "high",
          performanceScore: 95,
          errorCount: 7,
          dependencies: ["torch", "numpy", "tokenizers"],
        },
        {
          name: "numpy",
          version: "1.24.0",
          loadCount: 2500,
          totalLoadTime: 1250, // 20.8 minutes
          averageLoadTime: 0.5,
          successRate: 99.8,
          memoryUsage: 256 * 1024 * 1024, // 256MB
          peakMemoryUsage: 384 * 1024 * 1024, // 384MB
          lastUsed: new Date(Date.now() - 120000), // 2 minutes ago
          usageFrequency: "high",
          performanceScore: 98,
          errorCount: 5,
          dependencies: [],
        },
        {
          name: "pandas",
          version: "2.0.0",
          loadCount: 450,
          totalLoadTime: 540, // 9 minutes
          averageLoadTime: 1.2,
          successRate: 97.8,
          memoryUsage: 128 * 1024 * 1024, // 128MB
          peakMemoryUsage: 192 * 1024 * 1024, // 192MB
          lastUsed: new Date(Date.now() - 1800000), // 30 minutes ago
          usageFrequency: "medium",
          performanceScore: 88,
          errorCount: 10,
          dependencies: ["numpy", "python-dateutil"],
        },
        {
          name: "scikit-learn",
          version: "1.3.0",
          loadCount: 320,
          totalLoadTime: 384, // 6.4 minutes
          averageLoadTime: 1.2,
          successRate: 96.5,
          memoryUsage: 64 * 1024 * 1024, // 64MB
          peakMemoryUsage: 96 * 1024 * 1024, // 96MB
          lastUsed: new Date(Date.now() - 3600000), // 1 hour ago
          usageFrequency: "medium",
          performanceScore: 85,
          errorCount: 11,
          dependencies: ["numpy", "scipy"],
        },
        {
          name: "matplotlib",
          version: "3.7.0",
          loadCount: 180,
          totalLoadTime: 216, // 3.6 minutes
          averageLoadTime: 1.2,
          successRate: 94.4,
          memoryUsage: 32 * 1024 * 1024, // 32MB
          peakMemoryUsage: 48 * 1024 * 1024, // 48MB
          lastUsed: new Date(Date.now() - 7200000), // 2 hours ago
          usageFrequency: "low",
          performanceScore: 82,
          errorCount: 10,
          dependencies: ["numpy", "pillow"],
        },
        {
          name: "tokenizers",
          version: "0.14.0",
          loadCount: 680,
          totalLoadTime: 204, // 3.4 minutes
          averageLoadTime: 0.3,
          successRate: 99.7,
          memoryUsage: 64 * 1024 * 1024, // 64MB
          peakMemoryUsage: 96 * 1024 * 1024, // 96MB
          lastUsed: new Date(Date.now() - 900000), // 15 minutes ago
          usageFrequency: "high",
          performanceScore: 96,
          errorCount: 2,
          dependencies: [],
        },
      ];
      setAnalytics(mockAnalytics);
      // Calculate summary
      const analyticsList = mockAnalytics;
      const totalLoads = analyticsList.reduce((sum, a) => sum + a.loadCount, 0);
      const totalLoadTime = analyticsList.reduce((sum, a) => sum + a.totalLoadTime, 0);
      const averageLoadTime = totalLoadTime / totalLoads;
      const totalSuccesses = analyticsList.reduce((sum, a) => sum + (a.loadCount * a.successRate) / 100, 0);
      const overallSuccessRate = (totalSuccesses / totalLoads) * 100;
      const totalMemoryUsage = analyticsList.reduce((sum, a) => sum + a.memoryUsage, 0);
      const peakMemoryUsage = Math.max(...analyticsList.map(a => a.peakMemoryUsage));
      const averagePerformanceScore =
        analyticsList.reduce((sum, a) => sum + a.performanceScore, 0) / analyticsList.length;
      const totalErrors = analyticsList.reduce((sum, a) => sum + a.errorCount, 0);
      const errorRate = (totalErrors / totalLoads) * 100;
      const mockSummary = {
        totalPackages: analyticsList.length,
        totalLoads: totalLoads,
        averageLoadTime: averageLoadTime,
        overallSuccessRate: overallSuccessRate,
        totalMemoryUsage: totalMemoryUsage,
        peakMemoryUsage: peakMemoryUsage,
        performanceScore: averagePerformanceScore,
        errorRate: errorRate,
      };
      setSummary(mockSummary);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to refresh analytics data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };
  const filteredAndSortedAnalytics = () => {
    let filtered = analytics();
    // Filter by search query
    if (searchQuery()) {
      const query = searchQuery().toLowerCase();
      filtered = filtered.filter(
        analytics => analytics.name.toLowerCase().includes(query) || analytics.version.toLowerCase().includes(query)
      );
    }
    // Filter by frequency
    if (selectedFrequency() !== "all") {
      filtered = filtered.filter(analytics => analytics.usageFrequency === selectedFrequency());
    }
    // Sort
    filtered.sort((a, b) => {
      let aValue;
      let bValue;
      switch (sortBy()) {
        case "loadCount":
          aValue = a.loadCount;
          bValue = b.loadCount;
          break;
        case "averageLoadTime":
          aValue = a.averageLoadTime;
          bValue = b.averageLoadTime;
          break;
        case "successRate":
          aValue = a.successRate;
          bValue = b.successRate;
          break;
        case "memoryUsage":
          aValue = a.memoryUsage;
          bValue = b.memoryUsage;
          break;
        case "performanceScore":
          aValue = a.performanceScore;
          bValue = b.performanceScore;
          break;
        case "errorCount":
          aValue = a.errorCount;
          bValue = b.errorCount;
          break;
        default:
          aValue = a.loadCount;
          bValue = b.loadCount;
      }
      if (sortOrder() === "asc") {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
    return filtered;
  };
  const getFrequencyIcon = frequency => {
    switch (frequency) {
      case "high":
        return "arrow-up";
      case "medium":
        return "arrow-right";
      case "low":
        return "arrow-down";
      default:
        return "info";
    }
  };
  const getFrequencyColor = frequency => {
    switch (frequency) {
      case "high":
        return "success";
      case "medium":
        return "warning";
      case "low":
        return "error";
      default:
        return "neutral";
    }
  };
  const getPerformanceColor = score => {
    if (score >= 90) return "success";
    if (score >= 80) return "warning";
    return "error";
  };
  const getSuccessRateColor = rate => {
    if (rate >= 98) return "success";
    if (rate >= 95) return "warning";
    return "error";
  };
  const formatSize = size => {
    if (size > 1024 * 1024 * 1024) {
      return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    } else if (size > 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    } else if (size > 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${size} B`;
    }
  };
  const formatTime = seconds => {
    if (seconds < 1) {
      return `${(seconds * 1000).toFixed(0)}ms`;
    } else {
      return `${seconds.toFixed(2)}s`;
    }
  };
  const formatDuration = seconds => {
    if (seconds < 60) {
      return `${seconds.toFixed(0)}s`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ${(seconds % 60).toFixed(0)}s`;
    } else {
      return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    }
  };
  return (
    <div class="package-analytics-panel">
      {/* Header */}
      <div class="analytics-panel-header">
        <div class="analytics-panel-title">
          <span class="icon">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("chart-multiple")?.outerHTML || ""}
            />
          </span>
          <h3>Package Analytics</h3>
        </div>

        <div class="analytics-panel-actions">
          <Button variant="secondary" onClick={refreshAnalyticsData} disabled={isRefreshing()}>
            <Show when={isRefreshing()} fallback="Refresh">
              <span class="spinner"></span>
              Refreshing...
            </Show>
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div class="analytics-summary">
        <div class="summary-item">
          <span class="label">Total Packages:</span>
          <span class="value">{summary().totalPackages}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Loads:</span>
          <span class="value">{summary().totalLoads.toLocaleString()}</span>
        </div>
        <div class="summary-item">
          <span class="label">Avg Load Time:</span>
          <span class="value">{formatTime(summary().averageLoadTime)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Success Rate:</span>
          <span
            class="value"
            classList={{
              [getSuccessRateColor(summary().overallSuccessRate)]: true,
            }}
          >
            {summary().overallSuccessRate.toFixed(1)}%
          </span>
        </div>
        <div class="summary-item">
          <span class="label">Memory Usage:</span>
          <span class="value">{formatSize(summary().totalMemoryUsage)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Peak Memory:</span>
          <span class="value">{formatSize(summary().peakMemoryUsage)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Performance:</span>
          <span
            class="value"
            classList={{
              [getPerformanceColor(summary().performanceScore)]: true,
            }}
          >
            {summary().performanceScore.toFixed(0)}
          </span>
        </div>
        <div class="summary-item">
          <span class="label">Error Rate:</span>
          <span class="value error">{summary().errorRate.toFixed(2)}%</span>
        </div>
      </div>

      {/* Filters and Sorting */}
      <div class="analytics-filters">
        <TextField
          placeholder="Search packages..."
          value={searchQuery()}
          onChange={e => setSearchQuery(e.currentTarget.value)}
        />

        <Select value={selectedFrequency()} onChange={e => setSelectedFrequency(e.currentTarget.value)}>
          <option value="all">All Frequencies</option>
          <option value="high">High Usage</option>
          <option value="medium">Medium Usage</option>
          <option value="low">Low Usage</option>
        </Select>

        <Select value={sortBy()} onChange={e => setSortBy(e.currentTarget.value)}>
          <option value="loadCount">Sort by Load Count</option>
          <option value="averageLoadTime">Sort by Load Time</option>
          <option value="successRate">Sort by Success Rate</option>
          <option value="memoryUsage">Sort by Memory Usage</option>
          <option value="performanceScore">Sort by Performance</option>
          <option value="errorCount">Sort by Error Count</option>
        </Select>

        <Select value={sortOrder()} onChange={e => setSortOrder(e.currentTarget.value)}>
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </Select>
      </div>

      {/* Analytics List */}
      <div class="analytics-list">
        <For each={filteredAndSortedAnalytics()}>
          {analytics => (
            <div class="analytics-item">
              <div class="analytics-header">
                <div class="analytics-info">
                  <span class="icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={
                        fluentIconsPackage.getIcon(getFrequencyIcon(analytics.usageFrequency))?.outerHTML || ""
                      }
                    />
                  </span>

                  <div class="analytics-details">
                    <span class="package-name">{analytics.name}</span>
                    <span class="package-version">v{analytics.version}</span>
                  </div>
                </div>

                <div class="analytics-status">
                  <span
                    class="frequency-badge"
                    classList={{
                      [getFrequencyColor(analytics.usageFrequency)]: true,
                    }}
                  >
                    {analytics.usageFrequency}
                  </span>

                  <span
                    class="performance-score"
                    classList={{
                      [getPerformanceColor(analytics.performanceScore)]: true,
                    }}
                  >
                    {analytics.performanceScore}
                  </span>
                </div>
              </div>

              {/* Analytics Details */}
              <div class="analytics-details-expanded">
                <div class="metrics-grid">
                  <div class="metric-item">
                    <span class="label">Load Count:</span>
                    <span class="value">{analytics.loadCount.toLocaleString()}</span>
                  </div>

                  <div class="metric-item">
                    <span class="label">Avg Load Time:</span>
                    <span class="value">{formatTime(analytics.averageLoadTime)}</span>
                  </div>

                  <div class="metric-item">
                    <span class="label">Success Rate:</span>
                    <span
                      class="value"
                      classList={{
                        [getSuccessRateColor(analytics.successRate)]: true,
                      }}
                    >
                      {analytics.successRate.toFixed(1)}%
                    </span>
                  </div>

                  <div class="metric-item">
                    <span class="label">Memory Usage:</span>
                    <span class="value">{formatSize(analytics.memoryUsage)}</span>
                  </div>

                  <div class="metric-item">
                    <span class="label">Peak Memory:</span>
                    <span class="value">{formatSize(analytics.peakMemoryUsage)}</span>
                  </div>

                  <div class="metric-item">
                    <span class="label">Error Count:</span>
                    <span class="value error">{analytics.errorCount}</span>
                  </div>
                </div>

                <div class="detail-row">
                  <span class="label">Last Used:</span>
                  <span class="value">{analytics.lastUsed.toLocaleString()}</span>
                </div>

                <div class="detail-row">
                  <span class="label">Total Load Time:</span>
                  <span class="value">{formatDuration(analytics.totalLoadTime)}</span>
                </div>

                <Show when={analytics.dependencies.length > 0}>
                  <div class="detail-row">
                    <span class="label">Dependencies:</span>
                    <span class="value">{analytics.dependencies.join(", ")}</span>
                  </div>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Last Update */}
      <Show when={lastUpdate()}>
        <div class="last-update">Last updated: {lastUpdate().toLocaleString()}</div>
      </Show>
    </div>
  );
};
