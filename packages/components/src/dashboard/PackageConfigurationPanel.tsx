/**
 * PackageConfigurationPanel Component
 * Package configuration and settings management interface
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
import { Button, TextField, Select, Toggle } from "reynard-components";
import { fluentIconsPackage } from "reynard-fluent-icons";

export interface PackageConfigurationPanelProps {
  /** Whether to show global settings */
  showGlobalSettings?: boolean;
  /** Whether to show package-specific settings */
  showPackageSettings?: boolean;
  /** Whether to show advanced settings */
  showAdvancedSettings?: boolean;
}

export interface PackageConfiguration {
  name: string;
  version: string;
  description: string;
  settings: PackageSetting[];
  isConfigured: boolean;
  lastModified: Date;
  category: string;
}

export interface PackageSetting {
  key: string;
  label: string;
  description: string;
  type: "string" | "number" | "boolean" | "select" | "multiselect";
  value: any;
  defaultValue: any;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  required: boolean;
  category: string;
}

export interface GlobalConfiguration {
  autoDiscovery: boolean;
  autoInstall: boolean;
  autoUpdate: boolean;
  maxConcurrentInstalls: number;
  maxConcurrentLoads: number;
  installationTimeout: number;
  loadTimeout: number;
  memoryLimit: number;
  cacheSize: number;
  logLevel: string;
  enableAnalytics: boolean;
  enablePerformanceMonitoring: boolean;
  enableErrorReporting: boolean;
}

export const PackageConfigurationPanel: Component<PackageConfigurationPanelProps> = (props) => {
  const [packages, setPackages] = createSignal<PackageConfiguration[]>([]);
  const [globalConfig, setGlobalConfig] = createSignal<GlobalConfiguration>({
    autoDiscovery: true,
    autoInstall: false,
    autoUpdate: false,
    maxConcurrentInstalls: 3,
    maxConcurrentLoads: 2,
    installationTimeout: 300,
    loadTimeout: 120,
    memoryLimit: 2048,
    cacheSize: 512,
    logLevel: "info",
    enableAnalytics: true,
    enablePerformanceMonitoring: true,
    enableErrorReporting: false,
  });
  const [selectedPackage, setSelectedPackage] = createSignal<string | null>(null);
  const [isSaving, setIsSaving] = createSignal(false);
  const [isRefreshing, setIsRefreshing] = createSignal(false);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [selectedCategory, setSelectedCategory] = createSignal<string>("all");
  const [lastUpdate, setLastUpdate] = createSignal<Date | null>(null);

  onMount(() => {
    // Initial data load
    refreshConfigurationData();
  });

  // Refresh configuration data
  const refreshConfigurationData = async () => {
    setIsRefreshing(true);
    try {
      // Simulate API calls to backend configuration endpoints
      const mockPackages: PackageConfiguration[] = [
        {
          name: "torch",
          version: "2.1.0",
          description: "PyTorch deep learning framework",
          isConfigured: true,
          lastModified: new Date(Date.now() - 86400000), // 1 day ago
          category: "ml",
          settings: [
            {
              key: "device",
              label: "Default Device",
              description: "Default device for tensor operations",
              type: "select",
              value: "cuda",
              defaultValue: "cpu",
              options: ["cpu", "cuda", "mps"],
              required: true,
              category: "general",
            },
            {
              key: "num_threads",
              label: "Number of Threads",
              description: "Number of threads for CPU operations",
              type: "number",
              value: 4,
              defaultValue: 1,
              min: 1,
              max: 16,
              step: 1,
              required: false,
              category: "performance",
            },
            {
              key: "enable_mkldnn",
              label: "Enable MKLDNN",
              description: "Enable Intel MKL-DNN optimizations",
              type: "boolean",
              value: true,
              defaultValue: false,
              required: false,
              category: "performance",
            },
          ],
        },
        {
          name: "transformers",
          version: "4.35.0",
          description: "Hugging Face Transformers library",
          isConfigured: true,
          lastModified: new Date(Date.now() - 172800000), // 2 days ago
          category: "ml",
          settings: [
            {
              key: "cache_dir",
              label: "Cache Directory",
              description: "Directory to cache downloaded models",
              type: "string",
              value: "/tmp/transformers_cache",
              defaultValue: "/tmp/transformers_cache",
              required: true,
              category: "general",
            },
            {
              key: "use_auth_token",
              label: "Use Auth Token",
              description: "Use authentication token for private models",
              type: "boolean",
              value: false,
              defaultValue: false,
              required: false,
              category: "security",
            },
            {
              key: "max_memory",
              label: "Max Memory",
              description: "Maximum memory usage in MB",
              type: "number",
              value: 1024,
              defaultValue: 512,
              min: 256,
              max: 4096,
              step: 256,
              required: false,
              category: "performance",
            },
          ],
        },
        {
          name: "numpy",
          version: "1.24.0",
          description: "NumPy numerical computing library",
          isConfigured: false,
          lastModified: new Date(Date.now() - 259200000), // 3 days ago
          category: "math",
          settings: [
            {
              key: "threading_layer",
              label: "Threading Layer",
              description: "Threading layer for parallel operations",
              type: "select",
              value: "openmp",
              defaultValue: "openmp",
              options: ["openmp", "tbb", "none"],
              required: false,
              category: "performance",
            },
            {
              key: "enable_optimizations",
              label: "Enable Optimizations",
              description: "Enable NumPy optimizations",
              type: "boolean",
              value: true,
              defaultValue: true,
              required: false,
              category: "performance",
            },
          ],
        },
        {
          name: "pandas",
          version: "2.0.0",
          description: "Pandas data analysis library",
          isConfigured: true,
          lastModified: new Date(Date.now() - 345600000), // 4 days ago
          category: "data",
          settings: [
            {
              key: "display_max_rows",
              label: "Max Display Rows",
              description: "Maximum number of rows to display",
              type: "number",
              value: 100,
              defaultValue: 60,
              min: 10,
              max: 1000,
              step: 10,
              required: false,
              category: "display",
            },
            {
              key: "display_max_columns",
              label: "Max Display Columns",
              description: "Maximum number of columns to display",
              type: "number",
              value: 20,
              defaultValue: 20,
              min: 5,
              max: 100,
              step: 5,
              required: false,
              category: "display",
            },
            {
              key: "enable_chained_assignment",
              label: "Enable Chained Assignment",
              description: "Enable chained assignment operations",
              type: "boolean",
              value: false,
              defaultValue: false,
              required: false,
              category: "general",
            },
          ],
        },
        {
          name: "scikit-learn",
          version: "1.3.0",
          description: "Scikit-learn machine learning library",
          isConfigured: false,
          lastModified: new Date(Date.now() - 432000000), // 5 days ago
          category: "ml",
          settings: [
            {
              key: "n_jobs",
              label: "Number of Jobs",
              description: "Number of parallel jobs for algorithms",
              type: "number",
              value: -1,
              defaultValue: 1,
              min: -1,
              max: 16,
              step: 1,
              required: false,
              category: "performance",
            },
            {
              key: "random_state",
              label: "Random State",
              description: "Random state for reproducible results",
              type: "number",
              value: 42,
              defaultValue: null,
              min: 0,
              max: 2147483647,
              step: 1,
              required: false,
              category: "general",
            },
          ],
        },
        {
          name: "matplotlib",
          version: "3.7.0",
          description: "Matplotlib plotting library",
          isConfigured: true,
          lastModified: new Date(Date.now() - 518400000), // 6 days ago
          category: "visualization",
          settings: [
            {
              key: "backend",
              label: "Backend",
              description: "Matplotlib backend to use",
              type: "select",
              value: "Agg",
              defaultValue: "Agg",
              options: ["Agg", "TkAgg", "Qt5Agg", "WebAgg"],
              required: true,
              category: "general",
            },
            {
              key: "figure_size",
              label: "Default Figure Size",
              description: "Default figure size in inches",
              type: "string",
              value: "8,6",
              defaultValue: "6,4",
              required: false,
              category: "display",
            },
            {
              key: "dpi",
              label: "DPI",
              description: "Default DPI for figures",
              type: "number",
              value: 100,
              defaultValue: 100,
              min: 50,
              max: 300,
              step: 10,
              required: false,
              category: "display",
            },
          ],
        },
      ];

      setPackages(mockPackages);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Failed to refresh configuration data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleGlobalConfigChange = (key: keyof GlobalConfiguration, value: any) => {
    setGlobalConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handlePackageSettingChange = (packageName: string, settingKey: string, value: any) => {
    setPackages((prev) =>
      prev.map((pkg) =>
        pkg.name === packageName
          ? {
              ...pkg,
              settings: pkg.settings.map((setting) =>
                setting.key === settingKey ? { ...setting, value } : setting
              ),
              lastModified: new Date(),
            }
          : pkg
      )
    );
  };

  const handleSaveGlobalConfig = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, this would call the backend configuration endpoint
      console.log("Saving global configuration:", globalConfig());
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error("Failed to save global configuration:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePackageConfig = async (packageName: string) => {
    setIsSaving(true);
    try {
      // In a real implementation, this would call the backend package configuration endpoint
      const packageConfig = packages().find((p) => p.name === packageName);
      console.log(`Saving configuration for ${packageName}:`, packageConfig?.settings);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`Failed to save configuration for ${packageName}:`, error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPackageConfig = async (packageName: string) => {
    setIsSaving(true);
    try {
      // In a real implementation, this would call the backend reset endpoint
      console.log(`Resetting configuration for ${packageName}`);
      
      setPackages((prev) =>
        prev.map((pkg) =>
          pkg.name === packageName
            ? {
                ...pkg,
                settings: pkg.settings.map((setting) => ({
                  ...setting,
                  value: setting.defaultValue,
                })),
                lastModified: new Date(),
              }
            : pkg
        )
      );
      
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Failed to reset configuration for ${packageName}:`, error);
    } finally {
      setIsSaving(false);
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
          pkg.description.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (selectedCategory() !== "all") {
      filtered = filtered.filter((pkg) => pkg.category === selectedCategory());
    }

    return filtered;
  };

  const categories = () => {
    const packageList = packages();
    const categorySet = new Set(packageList.map((p) => p.category));
    return Array.from(categorySet);
  };

  const getConfigurationIcon = (isConfigured: boolean) => {
    return isConfigured ? "checkmark-circle" : "circle";
  };

  const getConfigurationColor = (isConfigured: boolean) => {
    return isConfigured ? "success" : "neutral";
  };

  const renderSettingInput = (setting: PackageSetting, packageName: string) => {
    switch (setting.type) {
      case "boolean":
        return (
          <Toggle
            checked={setting.value}
            onChange={(checked) => handlePackageSettingChange(packageName, setting.key, checked)}
          />
        );
      case "number":
        return (
          <input
            type="number"
            value={setting.value}
            min={setting.min}
            max={setting.max}
            step={setting.step}
            onChange={(e) => handlePackageSettingChange(packageName, setting.key, Number(e.currentTarget.value))}
            class="setting-input"
          />
        );
      case "select":
        return (
          <Select
            value={setting.value}
            onChange={(e) => handlePackageSettingChange(packageName, setting.key, e.currentTarget.value)}
          >
            <For each={setting.options}>
              {(option) => <option value={option}>{option}</option>}
            </For>
          </Select>
        );
      case "multiselect":
        return (
          <Select
            multiple
            value={setting.value}
            onChange={(e) => {
              const selectedOptions = Array.from(e.currentTarget.selectedOptions, (option) => option.value);
              handlePackageSettingChange(packageName, setting.key, selectedOptions);
            }}
          >
            <For each={setting.options}>
              {(option) => <option value={option}>{option}</option>}
            </For>
          </Select>
        );
      default: // string
        return (
          <TextField
            value={setting.value}
            onChange={(e) => handlePackageSettingChange(packageName, setting.key, e.currentTarget.value)}
            placeholder={setting.defaultValue}
          />
        );
    }
  };

  return (
    <div class="package-configuration-panel">
      {/* Header */}
      <div class="configuration-panel-header">
        <div class="configuration-panel-title">
          <span class="icon">
            <div
              // eslint-disable-next-line solid/no-innerhtml
              innerHTML={fluentIconsPackage.getIcon("settings")?.outerHTML || ""}
            />
          </span>
          <h3>Package Configuration</h3>
        </div>

        <div class="configuration-panel-actions">
          <Button
            variant="secondary"
            onClick={refreshConfigurationData}
            disabled={isRefreshing()}
          >
            <Show when={isRefreshing()} fallback="Refresh">
              <span class="spinner"></span>
              Refreshing...
            </Show>
          </Button>
        </div>
      </div>

      {/* Global Configuration */}
      <Show when={props.showGlobalSettings}>
        <div class="global-configuration">
          <h4>Global Settings</h4>
          <div class="global-settings-grid">
            <div class="setting-group">
              <h5>Discovery & Installation</h5>
              <div class="setting-item">
                <label>Auto Discovery</label>
                <Toggle
                  checked={globalConfig().autoDiscovery}
                  onChange={(checked) => handleGlobalConfigChange("autoDiscovery", checked)}
                />
              </div>
              <div class="setting-item">
                <label>Auto Install</label>
                <Toggle
                  checked={globalConfig().autoInstall}
                  onChange={(checked) => handleGlobalConfigChange("autoInstall", checked)}
                />
              </div>
              <div class="setting-item">
                <label>Auto Update</label>
                <Toggle
                  checked={globalConfig().autoUpdate}
                  onChange={(checked) => handleGlobalConfigChange("autoUpdate", checked)}
                />
              </div>
            </div>

            <div class="setting-group">
              <h5>Performance</h5>
              <div class="setting-item">
                <label>Max Concurrent Installs</label>
                <input
                  type="number"
                  value={globalConfig().maxConcurrentInstalls}
                  min={1}
                  max={10}
                  onChange={(e) => handleGlobalConfigChange("maxConcurrentInstalls", Number(e.currentTarget.value))}
                  class="setting-input"
                />
              </div>
              <div class="setting-item">
                <label>Max Concurrent Loads</label>
                <input
                  type="number"
                  value={globalConfig().maxConcurrentLoads}
                  min={1}
                  max={10}
                  onChange={(e) => handleGlobalConfigChange("maxConcurrentLoads", Number(e.currentTarget.value))}
                  class="setting-input"
                />
              </div>
              <div class="setting-item">
                <label>Memory Limit (MB)</label>
                <input
                  type="number"
                  value={globalConfig().memoryLimit}
                  min={512}
                  max={8192}
                  step={256}
                  onChange={(e) => handleGlobalConfigChange("memoryLimit", Number(e.currentTarget.value))}
                  class="setting-input"
                />
              </div>
            </div>

            <div class="setting-group">
              <h5>Monitoring</h5>
              <div class="setting-item">
                <label>Enable Analytics</label>
                <Toggle
                  checked={globalConfig().enableAnalytics}
                  onChange={(checked) => handleGlobalConfigChange("enableAnalytics", checked)}
                />
              </div>
              <div class="setting-item">
                <label>Performance Monitoring</label>
                <Toggle
                  checked={globalConfig().enablePerformanceMonitoring}
                  onChange={(checked) => handleGlobalConfigChange("enablePerformanceMonitoring", checked)}
                />
              </div>
              <div class="setting-item">
                <label>Error Reporting</label>
                <Toggle
                  checked={globalConfig().enableErrorReporting}
                  onChange={(checked) => handleGlobalConfigChange("enableErrorReporting", checked)}
                />
              </div>
            </div>
          </div>

          <div class="global-actions">
            <Button
              variant="primary"
              onClick={handleSaveGlobalConfig}
              disabled={isSaving()}
            >
              <Show when={isSaving()} fallback="Save Global Settings">
                <span class="spinner"></span>
                Saving...
              </Show>
            </Button>
          </div>
        </div>
      </Show>

      {/* Package Configuration */}
      <Show when={props.showPackageSettings}>
        <div class="package-configuration">
          <h4>Package Settings</h4>
          
          {/* Filters */}
          <div class="configuration-filters">
            <TextField
              placeholder="Search packages..."
              value={searchQuery()}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
            />

            <Select
              value={selectedCategory()}
              onChange={(e) => setSelectedCategory(e.currentTarget.value)}
            >
              <option value="all">All Categories</option>
              <For each={categories()}>
                {(category) => <option value={category}>{category}</option>}
              </For>
            </Select>
          </div>

          {/* Packages List */}
          <div class="packages-list">
            <For each={filteredPackages()}>
              {(pkg) => (
                <div class="package-config-item">
                  <div class="package-config-header">
                    <div class="package-config-info">
                      <span class="icon">
                        <div
                          // eslint-disable-next-line solid/no-innerhtml
                          innerHTML={fluentIconsPackage.getIcon(getConfigurationIcon(pkg.isConfigured))?.outerHTML || ""}
                        />
                      </span>
                      
                      <div class="package-config-details">
                        <span class="package-name">{pkg.name}</span>
                        <span class="package-version">v{pkg.version}</span>
                        <span class="package-description">{pkg.description}</span>
                      </div>
                    </div>

                    <div class="package-config-status">
                      <span class="status-badge" classList={{ [getConfigurationColor(pkg.isConfigured)]: true }}>
                        {pkg.isConfigured ? "Configured" : "Default"}
                      </span>
                      
                      <span class="last-modified">
                        {pkg.lastModified.toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Package Settings */}
                  <div class="package-settings">
                    <For each={pkg.settings}>
                      {(setting) => (
                        <div class="setting-item">
                          <div class="setting-label">
                            <label>{setting.label}</label>
                            <Show when={setting.required}>
                              <span class="required">*</span>
                            </Show>
                          </div>
                          
                          <div class="setting-description">
                            {setting.description}
                          </div>
                          
                          <div class="setting-input-container">
                            {renderSettingInput(setting, pkg.name)}
                          </div>
                          
                          <Show when={setting.value !== setting.defaultValue}>
                            <div class="setting-changed">
                              <span class="changed-indicator">Modified</span>
                            </div>
                          </Show>
                        </div>
                      )}
                    </For>
                  </div>

                  {/* Package Actions */}
                  <div class="package-config-actions">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSavePackageConfig(pkg.name)}
                      disabled={isSaving()}
                    >
                      <Show when={isSaving()} fallback="Save">
                        <span class="spinner"></span>
                        Saving...
                      </Show>
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleResetPackageConfig(pkg.name)}
                      disabled={isSaving()}
                    >
                      Reset to Defaults
                    </Button>
                  </div>
                </div>
              )}
            </For>
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
