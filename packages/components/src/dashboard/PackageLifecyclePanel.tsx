/**
 * PackageLifecyclePanel Component
 * Package lifecycle management interface (load, unload, reload)
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
import { Button, TextField, Select } from "reynard-components";
import { fluentIconsPackage } from "reynard-fluent-icons";

export interface PackageLifecyclePanelProps {
  /** Whether to show load/unload operations */
  showLoadUnload?: boolean;
  /** Whether to show reload operations */
  showReload?: boolean;
  /** Whether to show bulk operations */
  showBulkOperations?: boolean;
  /** Auto-refresh interval in milliseconds */
  refreshInterval?: number;
}

export interface PackageLifecycleInfo {
  name: string;
  version: string;
  description: string;
  status:
    | "loaded"
    | "unloaded"
    | "loading"
    | "unloading"
    | "reloading"
    | "error";
  loadTime: number;
  memoryUsage: number;
  lastLoaded: Date | null;
  lastUnloaded: Date | null;
  loadCount: number;
  error?: string;
  dependencies: string[];
  dependents: string[];
}

export interface LifecycleSummary {
  totalPackages: number;
  loadedPackages: number;
  unloadedPackages: number;
  loadingPackages: number;
  errorPackages: number;
  totalMemoryUsage: number;
  averageLoadTime: number;
}

export const PackageLifecyclePanel: Component<PackageLifecyclePanelProps> = (
  props,
) => {
  const [packages, setPackages] = createSignal<PackageLifecycleInfo[]>([]);
  const [summary, setSummary] = createSignal<LifecycleSummary>({
    totalPackages: 0,
    loadedPackages: 0,
    unloadedPackages: 0,
    loadingPackages: 0,
    errorPackages: 0,
    totalMemoryUsage: 0,
    averageLoadTime: 0,
  });
  const [isOperating, setIsOperating] = createSignal(false);
  const [isRefreshing, setIsRefreshing] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedStatus, setSelectedStatus] = createSignal<string>("all");
  const [lastUpdate, setLastUpdate] = createSignal<Date | null>(null);

  // Auto-refresh functionality
  let refreshInterval: ReturnType<typeof setInterval> | undefined;

  onMount(() => {
    // Initial data load
    refreshLifecycleData();
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
        refreshLifecycleData();
      }, props.refreshInterval);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  });

  // Refresh lifecycle data
  const refreshLifecycleData = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API calls to backend lifecycle endpoints
      const mockPackages: PackageLifecycleInfo[] = [
        {
          name: "torch",
          version: "2.1.0",
          description: "PyTorch deep learning framework",
          status: "loaded",
          loadTime: 2.5,
          memoryUsage: 1024 * 1024 * 1024, // 1GB
          lastLoaded: new Date(Date.now() - 300000), // 5 minutes ago
          lastUnloaded: null,
          loadCount: 15,
          dependencies: ["numpy", "typing-extensions"],
          dependents: ["transformers", "scikit-learn"],
        },
        {
          name: "transformers",
          version: "4.35.0",
          description: "Hugging Face Transformers library",
          status: "loaded",
          loadTime: 1.8,
          memoryUsage: 512 * 1024 * 1024, // 512MB
          lastLoaded: new Date(Date.now() - 600000), // 10 minutes ago
          lastUnloaded: null,
          loadCount: 8,
          dependencies: ["torch", "numpy", "tokenizers"],
          dependents: [],
        },
        {
          name: "numpy",
          version: "1.24.0",
          description: "NumPy numerical computing library",
          status: "loaded",
          loadTime: 0.5,
          memoryUsage: 256 * 1024 * 1024, // 256MB
          lastLoaded: new Date(Date.now() - 900000), // 15 minutes ago
          lastUnloaded: null,
          loadCount: 25,
          dependencies: [],
          dependents: ["torch", "transformers", "pandas", "scikit-learn"],
        },
        {
          name: "pandas",
          version: "2.0.0",
          description: "Pandas data analysis library",
          status: "unloaded",
          loadTime: 1.2,
          memoryUsage: 0,
          lastLoaded: new Date(Date.now() - 1800000), // 30 minutes ago
          lastUnloaded: new Date(Date.now() - 1200000), // 20 minutes ago
          loadCount: 12,
          dependencies: ["numpy", "python-dateutil"],
          dependents: [],
        },
        {
          name: "scikit-learn",
          version: "1.3.0",
          description: "Scikit-learn machine learning library",
          status: "loading",
          loadTime: 0,
          memoryUsage: 0,
          lastLoaded: null,
          lastUnloaded: new Date(Date.now() - 2400000), // 40 minutes ago
          loadCount: 5,
          dependencies: ["numpy", "scipy"],
          dependents: [],
        },
        {
          name: "matplotlib",
          version: "3.7.0",
          description: "Matplotlib plotting library",
          status: "error",
          loadTime: 0,
          memoryUsage: 0,
          lastLoaded: null,
          lastUnloaded: new Date(Date.now() - 3600000), // 1 hour ago
          loadCount: 3,
          error: "Failed to load: missing dependency 'pillow'",
          dependencies: ["numpy", "pillow"],
          dependents: [],
        },
        {
          name: "tokenizers",
          version: "0.14.0",
          description: "Fast tokenizers library",
          status: "loaded",
          loadTime: 0.3,
          memoryUsage: 64 * 1024 * 1024, // 64MB
          lastLoaded: new Date(Date.now() - 1200000), // 20 minutes ago
          lastUnloaded: null,
          loadCount: 20,
          dependencies: [],
          dependents: ["transformers"],
        },
      ];

      setPackages(mockPackages);

      // Calculate summary
      const packageList = mockPackages;
      const loadedPackages = packageList.filter((p) => p.status === "loaded");
      const totalMemoryUsage = loadedPackages.reduce(
        (sum, p) => sum + p.memoryUsage,
        0,
      );
      const averageLoadTime =
        loadedPackages.reduce((sum, p) => sum + p.loadTime, 0) /
        loadedPackages.length;

      const mockSummary: LifecycleSummary = {
        totalPackages: packageList.length,
        loadedPackages: packageList.filter((p) => p.status === "loaded").length,
        unloadedPackages: packageList.filter((p) => p.status === "unloaded")
          .length,
        loadingPackages: packageList.filter((p) => p.status === "loading")
          .length,
        errorPackages: packageList.filter((p) => p.status === "error").length,
        totalMemoryUsage: totalMemoryUsage,
        averageLoadTime: averageLoadTime || 0,
      };

      setSummary(mockSummary);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to refresh lifecycle data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLoadPackage = async (packageName: string) => {
    setIsOperating(true);
    try {
      // In a real implementation, this would call the backend load endpoint
      console.log(`Loading package: ${packageName}`);

      // Simulate loading
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.name === packageName
            ? { ...pkg, status: "loading" as const }
            : pkg,
        ),
      );

      // Simulate loading progress
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update to loaded
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.name === packageName
            ? {
                ...pkg,
                status: "loaded" as const,
                lastLoaded: new Date(),
                loadCount: pkg.loadCount + 1,
                memoryUsage: 128 * 1024 * 1024, // 128MB
              }
            : pkg,
        ),
      );
    } catch (error) {
      console.error("Failed to load package:", error);
      // Update to error
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.name === packageName
            ? {
                ...pkg,
                status: "error" as const,
                error: "Failed to load package",
              }
            : pkg,
        ),
      );
    } finally {
      setIsOperating(false);
    }
  };

  const handleUnloadPackage = async (packageName: string) => {
    setIsOperating(true);
    try {
      // In a real implementation, this would call the backend unload endpoint
      console.log(`Unloading package: ${packageName}`);

      // Simulate unloading
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.name === packageName
            ? { ...pkg, status: "unloading" as const }
            : pkg,
        ),
      );

      // Simulate unloading progress
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update to unloaded
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.name === packageName
            ? {
                ...pkg,
                status: "unloaded" as const,
                lastUnloaded: new Date(),
                memoryUsage: 0,
              }
            : pkg,
        ),
      );
    } catch (error) {
      console.error("Failed to unload package:", error);
      // Update to error
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.name === packageName
            ? {
                ...pkg,
                status: "error" as const,
                error: "Failed to unload package",
              }
            : pkg,
        ),
      );
    } finally {
      setIsOperating(false);
    }
  };

  const handleReloadPackage = async (packageName: string) => {
    setIsOperating(true);
    try {
      // In a real implementation, this would call the backend reload endpoint
      console.log(`Reloading package: ${packageName}`);

      // Simulate reloading
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.name === packageName
            ? { ...pkg, status: "reloading" as const }
            : pkg,
        ),
      );

      // Simulate reloading progress
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update to loaded
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.name === packageName
            ? {
                ...pkg,
                status: "loaded" as const,
                lastLoaded: new Date(),
                loadCount: pkg.loadCount + 1,
              }
            : pkg,
        ),
      );
    } catch (error) {
      console.error("Failed to reload package:", error);
      // Update to error
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.name === packageName
            ? {
                ...pkg,
                status: "error" as const,
                error: "Failed to reload package",
              }
            : pkg,
        ),
      );
    } finally {
      setIsOperating(false);
    }
  };

  const handleBulkLoad = async () => {
    const unloadedPackages = packages().filter(
      (pkg) => pkg.status === "unloaded",
    );
    setIsOperating(true);

    try {
      for (const pkg of unloadedPackages) {
        await handleLoadPackage(pkg.name);
        // Add delay between operations
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } finally {
      setIsOperating(false);
    }
  };

  const handleBulkUnload = async () => {
    const loadedPackages = packages().filter((pkg) => pkg.status === "loaded");
    setIsOperating(true);

    try {
      for (const pkg of loadedPackages) {
        await handleUnloadPackage(pkg.name);
        // Add delay between operations
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } finally {
      setIsOperating(false);
    }
  };

  const filteredPackages = () => {
    let filtered = packages();

    // Filter by search query
    if (searchQuery()) {
      const query = searchQuery().toLowerCase();
      filtered = filtered.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(query) ||
          pkg.description.toLowerCase().includes(query),
      );
    }

    // Filter by status
    if (selectedStatus() !== "all") {
      filtered = filtered.filter((pkg) => pkg.status === selectedStatus());
    }

    return filtered;
  };

  const statuses = () => {
    return ["loaded", "unloaded", "loading", "unloading", "reloading", "error"];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "loaded":
        return "checkmark-circle";
      case "unloaded":
        return "circle";
      case "loading":
        return "spinner";
      case "unloading":
        return "spinner";
      case "reloading":
        return "arrow-sync";
      case "error":
        return "dismiss-circle";
      default:
        return "info";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "loaded":
        return "success";
      case "unloaded":
        return "neutral";
      case "loading":
        return "info";
      case "unloading":
        return "info";
      case "reloading":
        return "warning";
      case "error":
        return "error";
      default:
        return "neutral";
    }
  };

  const formatSize = (size: number): string => {
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

  const formatTime = (seconds: number): string => {
    if (seconds < 1) {
      return `${(seconds * 1000).toFixed(0)}ms`;
    } else {
      return `${seconds.toFixed(2)}s`;
    }
  };

  return (
    <div class="package-lifecycle-panel">
      {/* Header */}
      <div class="lifecycle-panel-header">
        <div class="lifecycle-panel-title">
          <span class="icon">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={
                fluentIconsPackage.getIcon("arrow-sync")?.outerHTML || ""
              }
            />
          </span>
          <h3>Package Lifecycle</h3>
        </div>

        <div class="lifecycle-panel-actions">
          <Show when={props.showBulkOperations}>
            <Button
              variant="primary"
              onClick={handleBulkLoad}
              disabled={isOperating() || summary().unloadedPackages === 0}
            >
              <Show
                when={isOperating()}
                fallback={`Load All (${summary().unloadedPackages})`}
              >
                <span class="spinner"></span>
                Loading...
              </Show>
            </Button>

            <Button
              variant="secondary"
              onClick={handleBulkUnload}
              disabled={isOperating() || summary().loadedPackages === 0}
            >
              <Show
                when={isOperating()}
                fallback={`Unload All (${summary().loadedPackages})`}
              >
                <span class="spinner"></span>
                Unloading...
              </Show>
            </Button>
          </Show>

          <Button
            variant="secondary"
            onClick={refreshLifecycleData}
            disabled={isRefreshing()}
          >
            <Show when={isRefreshing()} fallback="Refresh">
              <span class="spinner"></span>
              Refreshing...
            </Show>
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div class="lifecycle-summary">
        <div class="summary-item">
          <span class="label">Total Packages:</span>
          <span class="value">{summary().totalPackages}</span>
        </div>
        <div class="summary-item">
          <span class="label">Loaded:</span>
          <span class="value success">{summary().loadedPackages}</span>
        </div>
        <div class="summary-item">
          <span class="label">Unloaded:</span>
          <span class="value neutral">{summary().unloadedPackages}</span>
        </div>
        <div class="summary-item">
          <span class="label">Loading:</span>
          <span class="value info">{summary().loadingPackages}</span>
        </div>
        <div class="summary-item">
          <span class="label">Errors:</span>
          <span class="value error">{summary().errorPackages}</span>
        </div>
        <div class="summary-item">
          <span class="label">Memory Usage:</span>
          <span class="value">{formatSize(summary().totalMemoryUsage)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Avg Load Time:</span>
          <span class="value">{formatTime(summary().averageLoadTime)}</span>
        </div>
      </div>

      {/* Filters */}
      <div class="lifecycle-filters">
        <TextField
          placeholder="Search packages..."
          value={searchQuery()}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />

        <Select
          value={selectedStatus()}
          onChange={(e) => setSelectedStatus(e.currentTarget.value)}
        >
          <option value="all">All Statuses</option>
          <For each={statuses()}>
            {(status) => <option value={status}>{status}</option>}
          </For>
        </Select>
      </div>

      {/* Packages List */}
      <div class="packages-list">
        <For each={filteredPackages()}>
          {(pkg) => (
            <div class="package-item">
              <div class="package-header">
                <div class="package-info">
                  <span class="icon">
                    <div
                      // eslint-disable-next-line solid/no-innerhtml
                      innerHTML={
                        fluentIconsPackage.getIcon(getStatusIcon(pkg.status))
                          ?.outerHTML || ""
                      }
                    />
                  </span>

                  <div class="package-details">
                    <span class="package-name">{pkg.name}</span>
                    <span class="package-version">v{pkg.version}</span>
                    <span class="package-description">{pkg.description}</span>
                  </div>
                </div>

                <div class="package-status">
                  <span
                    class="status-badge"
                    classList={{ [getStatusColor(pkg.status)]: true }}
                  >
                    {pkg.status}
                  </span>

                  <span class="memory-usage">
                    {formatSize(pkg.memoryUsage)}
                  </span>
                </div>
              </div>

              {/* Package Details */}
              <div class="package-details-expanded">
                <div class="detail-row">
                  <span class="label">Load Time:</span>
                  <span class="value">{formatTime(pkg.loadTime)}</span>
                </div>

                <div class="detail-row">
                  <span class="label">Load Count:</span>
                  <span class="value">{pkg.loadCount}</span>
                </div>

                <Show when={pkg.lastLoaded}>
                  <div class="detail-row">
                    <span class="label">Last Loaded:</span>
                    <span class="value">
                      {pkg.lastLoaded!.toLocaleString()}
                    </span>
                  </div>
                </Show>

                <Show when={pkg.lastUnloaded}>
                  <div class="detail-row">
                    <span class="label">Last Unloaded:</span>
                    <span class="value">
                      {pkg.lastUnloaded!.toLocaleString()}
                    </span>
                  </div>
                </Show>

                <Show when={pkg.dependencies.length > 0}>
                  <div class="detail-row">
                    <span class="label">Dependencies:</span>
                    <span class="value">{pkg.dependencies.join(", ")}</span>
                  </div>
                </Show>

                <Show when={pkg.dependents.length > 0}>
                  <div class="detail-row">
                    <span class="label">Dependents:</span>
                    <span class="value">{pkg.dependents.join(", ")}</span>
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
                <Show when={pkg.status === "unloaded"}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleLoadPackage(pkg.name)}
                    disabled={isOperating()}
                  >
                    Load
                  </Button>
                </Show>

                <Show when={pkg.status === "loaded"}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleUnloadPackage(pkg.name)}
                    disabled={isOperating()}
                  >
                    Unload
                  </Button>

                  <Show when={props.showReload}>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleReloadPackage(pkg.name)}
                      disabled={isOperating()}
                    >
                      Reload
                    </Button>
                  </Show>
                </Show>

                <Show when={pkg.status === "error"}>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleLoadPackage(pkg.name)}
                    disabled={isOperating()}
                  >
                    Retry Load
                  </Button>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>

      {/* Last Update */}
      <Show when={lastUpdate()}>
        <div class="last-update">
          Last updated: {lastUpdate()!.toLocaleString()}
        </div>
      </Show>
    </div>
  );
};
