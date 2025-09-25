/**
 * PackageInstallationPanel Component
 * Package installation interface with progress tracking and dependency resolution
 */
import { For, Show, createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { Button, TextField, Select } from "reynard-components-core/primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { log } from "reynard-error-boundaries";
export const PackageInstallationPanel = props => {
  const [packages, setPackages] = createSignal([]);
  const [summary, setSummary] = createSignal({
    totalPackages: 0,
    pendingPackages: 0,
    installingPackages: 0,
    installedPackages: 0,
    failedPackages: 0,
    totalProgress: 0,
  });
  const [isInstalling, setIsInstalling] = createSignal(false);
  const [isRefreshing, setIsRefreshing] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedStatus, setSelectedStatus] = createSignal("all");
  const [lastUpdate, setLastUpdate] = createSignal(null);
  // Auto-refresh functionality
  let refreshInterval;
  onMount(() => {
    // Initial data load
    refreshInstallationData();
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
        refreshInstallationData();
      }, props.refreshInterval);
    }
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  });
  // Refresh installation data
  const refreshInstallationData = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API calls to backend installation endpoints
      const mockPackages = [
        {
          name: "torch",
          version: "2.1.0",
          description: "PyTorch deep learning framework",
          status: "installing",
          progress: 75,
          dependencies: ["numpy", "typing-extensions"],
          size: 1024 * 1024 * 1024, // 1GB
          estimatedTime: 300, // 5 minutes
          startTime: new Date(Date.now() - 180000), // 3 minutes ago
        },
        {
          name: "transformers",
          version: "4.35.0",
          description: "Hugging Face Transformers library",
          status: "pending",
          progress: 0,
          dependencies: ["torch", "numpy", "tokenizers"],
          size: 512 * 1024 * 1024, // 512MB
          estimatedTime: 180, // 3 minutes
        },
        {
          name: "numpy",
          version: "1.24.0",
          description: "NumPy numerical computing library",
          status: "installed",
          progress: 100,
          dependencies: [],
          size: 256 * 1024 * 1024, // 256MB
          estimatedTime: 60, // 1 minute
          startTime: new Date(Date.now() - 300000), // 5 minutes ago
          endTime: new Date(Date.now() - 240000), // 4 minutes ago
        },
        {
          name: "pandas",
          version: "2.0.0",
          description: "Pandas data analysis library",
          status: "installed",
          progress: 100,
          dependencies: ["numpy", "python-dateutil"],
          size: 128 * 1024 * 1024, // 128MB
          estimatedTime: 90, // 1.5 minutes
          startTime: new Date(Date.now() - 600000), // 10 minutes ago
          endTime: new Date(Date.now() - 510000), // 8.5 minutes ago
        },
        {
          name: "scikit-learn",
          version: "1.3.0",
          description: "Scikit-learn machine learning library",
          status: "failed",
          progress: 45,
          dependencies: ["numpy", "scipy"],
          size: 64 * 1024 * 1024, // 64MB
          estimatedTime: 120, // 2 minutes
          error: "Dependency conflict with existing sklearn package",
          startTime: new Date(Date.now() - 120000), // 2 minutes ago
        },
        {
          name: "matplotlib",
          version: "3.7.0",
          description: "Matplotlib plotting library",
          status: "pending",
          progress: 0,
          dependencies: ["numpy", "pillow"],
          size: 32 * 1024 * 1024, // 32MB
          estimatedTime: 60, // 1 minute
        },
      ];
      setPackages(mockPackages);
      // Calculate summary
      const packageList = mockPackages;
      const totalProgress = packageList.reduce((sum, pkg) => sum + pkg.progress, 0) / packageList.length;
      const mockSummary = {
        totalPackages: packageList.length,
        pendingPackages: packageList.filter(p => p.status === "pending").length,
        installingPackages: packageList.filter(p => p.status === "installing").length,
        installedPackages: packageList.filter(p => p.status === "installed").length,
        failedPackages: packageList.filter(p => p.status === "failed").length,
        totalProgress: totalProgress,
      };
      setSummary(mockSummary);
      setLastUpdate(new Date());
    } catch (error) {
      log.error("Failed to refresh installation data", error instanceof Error ? error : new Error(String(error)), undefined, {
        component: "PackageInstallationPanel",
        function: "refreshInstallationData"
      });
    } finally {
      setIsRefreshing(false);
    }
  };
  const handleInstallPackage = async packageName => {
    // In a real implementation, this would call the backend installation endpoint
    log.info(`Installing package: ${packageName}`, undefined, {
      component: "PackageInstallationPanel",
      function: "handleInstallPackage"
    });
    // Simulate installation
    const updatedPackages = packages().map(pkg =>
      pkg.name === packageName ? { ...pkg, status: "installing", startTime: new Date() } : pkg
    );
    setPackages(updatedPackages);
    // Simulate installation progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      setPackages(prev =>
        prev.map(pkg =>
          pkg.name === packageName && pkg.status === "installing" ? { ...pkg, progress: Math.min(progress, 100) } : pkg
        )
      );
      if (progress >= 100) {
        clearInterval(progressInterval);
        setPackages(prev =>
          prev.map(pkg =>
            pkg.name === packageName && pkg.status === "installing"
              ? { ...pkg, status: "installed", endTime: new Date() }
              : pkg
          )
        );
      }
    }, 500);
  };
  const handleCancelInstallation = async packageName => {
    // In a real implementation, this would call the backend cancellation endpoint
    log.info(`Cancelling installation: ${packageName}`, undefined, {
      component: "PackageInstallationPanel",
      function: "handleCancelInstallation"
    });
    // Simulate cancellation
    const updatedPackages = packages().map(pkg =>
      pkg.name === packageName ? { ...pkg, status: "cancelled", endTime: new Date() } : pkg
    );
    setPackages(updatedPackages);
  };
  const handleRetryInstallation = async packageName => {
    // In a real implementation, this would call the backend retry endpoint
    log.info(`Retrying installation: ${packageName}`, undefined, {
      component: "PackageInstallationPanel",
      function: "handleRetryInstallation"
    });
    // Simulate retry
    const updatedPackages = packages().map(pkg =>
      pkg.name === packageName
        ? {
            ...pkg,
            status: "installing",
            progress: 0,
            error: undefined,
            startTime: new Date(),
          }
        : pkg
    );
    setPackages(updatedPackages);
  };
  const handleBulkInstall = async () => {
    const pendingPackages = packages().filter(pkg => pkg.status === "pending");
    setIsInstalling(true);
    try {
      for (const pkg of pendingPackages) {
        await handleInstallPackage(pkg.name);
        // Add delay between installations
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } finally {
      setIsInstalling(false);
    }
  };
  const filteredPackages = () => {
    let filtered = packages();
    // Filter by search query
    if (searchQuery()) {
      const query = searchQuery().toLowerCase();
      filtered = filtered.filter(
        pkg => pkg.name.toLowerCase().includes(query) || pkg.description.toLowerCase().includes(query)
      );
    }
    // Filter by status
    if (selectedStatus() !== "all") {
      filtered = filtered.filter(pkg => pkg.status === selectedStatus());
    }
    return filtered;
  };
  const statuses = () => {
    return ["pending", "installing", "installed", "failed", "cancelled"];
  };
  const getStatusIcon = status => {
    switch (status) {
      case "pending":
        return "clock";
      case "installing":
        return "spinner";
      case "installed":
        return "checkmark-circle";
      case "failed":
        return "dismiss-circle";
      case "cancelled":
        return "cancel";
      default:
        return "info";
    }
  };
  const getStatusColor = status => {
    switch (status) {
      case "pending":
        return "neutral";
      case "installing":
        return "info";
      case "installed":
        return "success";
      case "failed":
        return "error";
      case "cancelled":
        return "warning";
      default:
        return "neutral";
    }
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
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
    } else {
      return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
    }
  };
  return (
    <div class="package-installation-panel">
      {/* Header */}
      <div class="installation-panel-header">
        <div class="installation-panel-title">
          <span class="icon">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("download")?.outerHTML || ""}
            />
          </span>
          <h3>Package Installation</h3>
        </div>

        <div class="installation-panel-actions">
          <Show when={props.showBulkOperations}>
            <Button
              variant="primary"
              onClick={handleBulkInstall}
              disabled={isInstalling() || summary().pendingPackages === 0}
            >
              <Show when={isInstalling()} fallback={`Install All (${summary().pendingPackages})`}>
                <span class="spinner" />
                Installing...
              </Show>
            </Button>
          </Show>

          <Button variant="secondary" onClick={refreshInstallationData} disabled={isRefreshing()}>
            <Show when={isRefreshing()} fallback="Refresh">
              <span class="spinner" />
              Refreshing...
            </Show>
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div class="installation-summary">
        <div class="summary-item">
          <span class="label">Total Packages:</span>
          <span class="value">{summary().totalPackages}</span>
        </div>
        <div class="summary-item">
          <span class="label">Pending:</span>
          <span class="value neutral">{summary().pendingPackages}</span>
        </div>
        <div class="summary-item">
          <span class="label">Installing:</span>
          <span class="value info">{summary().installingPackages}</span>
        </div>
        <div class="summary-item">
          <span class="label">Installed:</span>
          <span class="value success">{summary().installedPackages}</span>
        </div>
        <div class="summary-item">
          <span class="label">Failed:</span>
          <span class="value error">{summary().failedPackages}</span>
        </div>
        <div class="summary-item">
          <span class="label">Overall Progress:</span>
          <span class="value">{summary().totalProgress.toFixed(1)}%</span>
        </div>
      </div>

      {/* Filters */}
      <div class="installation-filters">
        <TextField
          placeholder="Search packages..."
          value={searchQuery()}
          onChange={e => setSearchQuery(e.currentTarget.value)}
        />

        <Select value={selectedStatus()} onChange={e => setSelectedStatus(e.currentTarget.value)}>
          <option value="all">All Statuses</option>
          <For each={statuses()}>{status => <option value={status}>{status}</option>}</For>
        </Select>
      </div>

      {/* Packages List */}
      <div class="packages-list">
        <For each={filteredPackages()}>
          {pkg => (
            <div class="package-item">
              <div class="package-header">
                <div class="package-info">
                  <span class="icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={fluentIconsPackage.getIcon(getStatusIcon(pkg.status))?.outerHTML || ""}
                    />
                  </span>

                  <div class="package-details">
                    <span class="package-name">{pkg.name}</span>
                    <span class="package-version">v{pkg.version}</span>
                    <span class="package-description">{pkg.description}</span>
                  </div>
                </div>

                <div class="package-status">
                  <span class="status-badge" classList={{ [getStatusColor(pkg.status)]: true }}>
                    {pkg.status}
                  </span>

                  <span class="package-size">{formatSize(pkg.size)}</span>
                </div>
              </div>

              {/* Installation Progress */}
              <Show when={props.showProgress && pkg.status === "installing"}>
                <div class="installation-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" data-progress={pkg.progress} />
                  </div>
                  <div class="progress-info">
                    <span class="progress-text">{pkg.progress}%</span>
                    <span class="estimated-time">ETA: {formatTime(pkg.estimatedTime)}</span>
                  </div>
                </div>
              </Show>

              {/* Package Details */}
              <div class="package-details-expanded">
                <div class="detail-row">
                  <span class="label">Size:</span>
                  <span class="value">{formatSize(pkg.size)}</span>
                </div>

                <div class="detail-row">
                  <span class="label">Estimated Time:</span>
                  <span class="value">{formatTime(pkg.estimatedTime)}</span>
                </div>

                <Show when={pkg.startTime}>
                  <div class="detail-row">
                    <span class="label">Started:</span>
                    <span class="value">{pkg.startTime.toLocaleString()}</span>
                  </div>
                </Show>

                <Show when={pkg.endTime}>
                  <div class="detail-row">
                    <span class="label">Completed:</span>
                    <span class="value">{pkg.endTime.toLocaleString()}</span>
                  </div>
                </Show>

                <Show when={pkg.dependencies.length > 0}>
                  <div class="detail-row">
                    <span class="label">Dependencies:</span>
                    <span class="value">{pkg.dependencies.join(", ")}</span>
                  </div>
                </Show>

                <Show when={pkg.error}>
                  <div class="detail-row error">
                    <span class="label">Error:</span>
                    <span class="value">{pkg.error}</span>
                  </div>
                </Show>
              </div>

              {/* Package Actions */}
              <div class="package-actions">
                <Show when={pkg.status === "pending"}>
                  <Button variant="primary" size="sm" onClick={() => handleInstallPackage(pkg.name)}>
                    Install
                  </Button>
                </Show>

                <Show when={pkg.status === "installing"}>
                  <Button variant="warning" size="sm" onClick={() => handleCancelInstallation(pkg.name)}>
                    Cancel
                  </Button>
                </Show>

                <Show when={pkg.status === "failed"}>
                  <Button variant="secondary" size="sm" onClick={() => handleRetryInstallation(pkg.name)}>
                    Retry
                  </Button>
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
