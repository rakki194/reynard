/**
 * PackageDiscoveryPanel Component
 * Package discovery and registration interface with conflict resolution
 */
import { For, Show, createSignal, createEffect, onMount, onCleanup } from "solid-js";
import { Button, TextField, Select } from "reynard-components-core/primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
export const PackageDiscoveryPanel = props => {
    const [packages, setPackages] = createSignal([]);
    const [summary, setSummary] = createSignal({
        totalDiscovered: 0,
        newPackages: 0,
        updatedPackages: 0,
        conflictedPackages: 0,
        readyToInstall: 0,
    });
    const [isDiscovering, setIsDiscovering] = createSignal(false);
    const [isRefreshing, setIsRefreshing] = createSignal(false);
    const [searchQuery, setSearchQuery] = createSignal("");
    const [selectedCategory, setSelectedCategory] = createSignal("all");
    const [selectedStatus, setSelectedStatus] = createSignal("all");
    const [lastUpdate, setLastUpdate] = createSignal(null);
    // Auto-refresh functionality
    let refreshInterval;
    onMount(() => {
        // Initial data load
        refreshPackageData();
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
                refreshPackageData();
            }, props.refreshInterval);
        }
        return () => {
            if (refreshInterval) {
                clearInterval(refreshInterval);
            }
        };
    });
    // Refresh package data
    const refreshPackageData = async () => {
        setIsRefreshing(true);
        try {
            // Simulate API calls to backend package discovery endpoints
            const mockPackages = [
                {
                    name: "torch",
                    version: "2.1.0",
                    description: "PyTorch deep learning framework",
                    status: "discovered",
                    dependencies: ["numpy", "typing-extensions"],
                    conflicts: [],
                    size: 1024 * 1024 * 1024, // 1GB
                    lastUpdated: new Date(),
                    source: "pypi",
                    category: "ml",
                },
                {
                    name: "transformers",
                    version: "4.35.0",
                    description: "Hugging Face Transformers library",
                    status: "discovered",
                    dependencies: ["torch", "numpy", "tokenizers"],
                    conflicts: [],
                    size: 512 * 1024 * 1024, // 512MB
                    lastUpdated: new Date(),
                    source: "pypi",
                    category: "ml",
                },
                {
                    name: "numpy",
                    version: "1.24.0",
                    description: "NumPy numerical computing library",
                    status: "registered",
                    dependencies: [],
                    conflicts: [],
                    size: 256 * 1024 * 1024, // 256MB
                    lastUpdated: new Date(),
                    source: "pypi",
                    category: "math",
                },
                {
                    name: "pandas",
                    version: "2.0.0",
                    description: "Pandas data analysis library",
                    status: "installed",
                    dependencies: ["numpy", "python-dateutil"],
                    conflicts: [],
                    size: 128 * 1024 * 1024, // 128MB
                    lastUpdated: new Date(),
                    source: "pypi",
                    category: "data",
                },
                {
                    name: "scikit-learn",
                    version: "1.3.0",
                    description: "Scikit-learn machine learning library",
                    status: "conflict",
                    dependencies: ["numpy", "scipy"],
                    conflicts: ["sklearn"],
                    size: 64 * 1024 * 1024, // 64MB
                    lastUpdated: new Date(),
                    source: "pypi",
                    category: "ml",
                },
                {
                    name: "matplotlib",
                    version: "3.7.0",
                    description: "Matplotlib plotting library",
                    status: "discovered",
                    dependencies: ["numpy", "pillow"],
                    conflicts: [],
                    size: 32 * 1024 * 1024, // 32MB
                    lastUpdated: new Date(),
                    source: "pypi",
                    category: "visualization",
                },
            ];
            setPackages(mockPackages);
            // Calculate summary
            const packageList = mockPackages;
            const mockSummary = {
                totalDiscovered: packageList.length,
                newPackages: packageList.filter(p => p.status === "discovered").length,
                updatedPackages: packageList.filter(p => p.status === "registered").length,
                conflictedPackages: packageList.filter(p => p.status === "conflict").length,
                readyToInstall: packageList.filter(p => p.status === "discovered" || p.status === "registered").length,
            };
            setSummary(mockSummary);
            setLastUpdate(new Date());
        }
        catch (error) {
            console.error("Failed to refresh package data:", error);
        }
        finally {
            setIsRefreshing(false);
        }
    };
    const handleDiscoverPackages = async () => {
        setIsDiscovering(true);
        try {
            // Simulate package discovery process
            await new Promise(resolve => setTimeout(resolve, 2000));
            await refreshPackageData();
        }
        catch (error) {
            console.error("Failed to discover packages:", error);
        }
        finally {
            setIsDiscovering(false);
        }
    };
    const handleRegisterPackage = async (packageName) => {
        // In a real implementation, this would call the backend registration endpoint
        console.log(`Registering package: ${packageName}`);
        // Simulate registration
        const updatedPackages = packages().map(pkg => pkg.name === packageName ? { ...pkg, status: "registered" } : pkg);
        setPackages(updatedPackages);
    };
    const handleResolveConflict = async (packageName) => {
        // In a real implementation, this would call the conflict resolution endpoint
        console.log(`Resolving conflict for package: ${packageName}`);
        // Simulate conflict resolution
        const updatedPackages = packages().map(pkg => pkg.name === packageName ? { ...pkg, status: "discovered", conflicts: [] } : pkg);
        setPackages(updatedPackages);
    };
    const filteredPackages = () => {
        let filtered = packages();
        // Filter by search query
        if (searchQuery()) {
            const query = searchQuery().toLowerCase();
            filtered = filtered.filter(pkg => pkg.name.toLowerCase().includes(query) || pkg.description.toLowerCase().includes(query));
        }
        // Filter by category
        if (selectedCategory() !== "all") {
            filtered = filtered.filter(pkg => pkg.category === selectedCategory());
        }
        // Filter by status
        if (selectedStatus() !== "all") {
            filtered = filtered.filter(pkg => pkg.status === selectedStatus());
        }
        return filtered;
    };
    const categories = () => {
        const packageList = packages();
        const categorySet = new Set(packageList.map(p => p.category));
        return Array.from(categorySet);
    };
    const statuses = () => {
        return ["discovered", "registered", "installed", "conflict", "error"];
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case "discovered":
                return "add-circle";
            case "registered":
                return "checkmark-circle";
            case "installed":
                return "checkmark-circle-filled";
            case "conflict":
                return "warning";
            case "error":
                return "dismiss-circle";
            default:
                return "info";
        }
    };
    const getStatusColor = (status) => {
        switch (status) {
            case "discovered":
                return "info";
            case "registered":
                return "success";
            case "installed":
                return "success";
            case "conflict":
                return "warning";
            case "error":
                return "error";
            default:
                return "neutral";
        }
    };
    const formatSize = (size) => {
        if (size > 1024 * 1024 * 1024) {
            return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
        }
        else if (size > 1024 * 1024) {
            return `${(size / (1024 * 1024)).toFixed(1)} MB`;
        }
        else if (size > 1024) {
            return `${(size / 1024).toFixed(1)} KB`;
        }
        else {
            return `${size} B`;
        }
    };
    return (<div class="package-discovery-panel">
      {/* Header */}
      <div class="discovery-panel-header">
        <div class="discovery-panel-title">
          <span class="icon">
            <div 
    // eslint-disable-next-line solid/no-innerhtml
    innerHTML={fluentIconsPackage.getIcon("search")?.outerHTML || ""}/>
          </span>
          <h3>Package Discovery</h3>
        </div>

        <div class="discovery-panel-actions">
          <Button variant="primary" onClick={handleDiscoverPackages} disabled={isDiscovering()}>
            <Show when={isDiscovering()} fallback="Discover Packages">
              <span class="spinner"></span>
              Discovering...
            </Show>
          </Button>

          <Button variant="secondary" onClick={refreshPackageData} disabled={isRefreshing()}>
            <Show when={isRefreshing()} fallback="Refresh">
              <span class="spinner"></span>
              Refreshing...
            </Show>
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div class="discovery-summary">
        <div class="summary-item">
          <span class="label">Total Discovered:</span>
          <span class="value">{summary().totalDiscovered}</span>
        </div>
        <div class="summary-item">
          <span class="label">New Packages:</span>
          <span class="value success">{summary().newPackages}</span>
        </div>
        <div class="summary-item">
          <span class="label">Updated:</span>
          <span class="value warning">{summary().updatedPackages}</span>
        </div>
        <div class="summary-item">
          <span class="label">Conflicts:</span>
          <span class="value error">{summary().conflictedPackages}</span>
        </div>
        <div class="summary-item">
          <span class="label">Ready to Install:</span>
          <span class="value info">{summary().readyToInstall}</span>
        </div>
      </div>

      {/* Filters */}
      <div class="discovery-filters">
        <TextField placeholder="Search packages..." value={searchQuery()} onChange={e => setSearchQuery(e.currentTarget.value)}/>

        <Select value={selectedCategory()} onChange={e => setSelectedCategory(e.currentTarget.value)}>
          <option value="all">All Categories</option>
          <For each={categories()}>{category => <option value={category}>{category}</option>}</For>
        </Select>

        <Select value={selectedStatus()} onChange={e => setSelectedStatus(e.currentTarget.value)}>
          <option value="all">All Statuses</option>
          <For each={statuses()}>{status => <option value={status}>{status}</option>}</For>
        </Select>
      </div>

      {/* Packages List */}
      <div class="packages-list">
        <For each={filteredPackages()}>
          {pkg => (<div class="package-item">
              <div class="package-header">
                <div class="package-info">
                  <span class="icon">
                    <div 
        // eslint-disable-next-line solid/no-innerhtml
        innerHTML={fluentIconsPackage.getIcon(getStatusIcon(pkg.status))?.outerHTML || ""}/>
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

              {/* Package Details */}
              <div class="package-details-expanded">
                <div class="detail-row">
                  <span class="label">Category:</span>
                  <span class="value">{pkg.category}</span>
                </div>

                <div class="detail-row">
                  <span class="label">Source:</span>
                  <span class="value">{pkg.source}</span>
                </div>

                <div class="detail-row">
                  <span class="label">Last Updated:</span>
                  <span class="value">{pkg.lastUpdated.toLocaleString()}</span>
                </div>

                <Show when={pkg.dependencies.length > 0}>
                  <div class="detail-row">
                    <span class="label">Dependencies:</span>
                    <span class="value">{pkg.dependencies.join(", ")}</span>
                  </div>
                </Show>

                <Show when={pkg.conflicts.length > 0}>
                  <div class="detail-row error">
                    <span class="label">Conflicts:</span>
                    <span class="value">{pkg.conflicts.join(", ")}</span>
                  </div>
                </Show>
              </div>

              {/* Package Actions */}
              <div class="package-actions">
                <Show when={pkg.status === "discovered"}>
                  <Button variant="primary" size="sm" onClick={() => handleRegisterPackage(pkg.name)}>
                    Register
                  </Button>
                </Show>

                <Show when={pkg.status === "conflict"}>
                  <Button variant="warning" size="sm" onClick={() => handleResolveConflict(pkg.name)}>
                    Resolve Conflict
                  </Button>
                </Show>

                <Show when={pkg.status === "registered"}>
                  <Button variant="secondary" size="sm" onClick={() => props.setActiveTab?.("installation")}>
                    Install
                  </Button>
                </Show>
              </div>
            </div>)}
        </For>
      </div>

      {/* Last Update */}
      <Show when={lastUpdate()}>
        <div class="last-update">Last updated: {lastUpdate().toLocaleString()}</div>
      </Show>
    </div>);
};
