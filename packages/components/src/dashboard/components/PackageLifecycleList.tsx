/**
 * Package Lifecycle List Component
 * Displays and manages the list of packages for lifecycle operations
 */

import { Component, For, Show } from "solid-js";
import { Button, TextField, Select } from "reynard-components";
import { Icon } from "reynard-components/icons";
import type { PackageLifecycleListProps } from "../types/PackageLifecycleTypes";

export const PackageLifecycleList: Component<PackageLifecycleListProps> = (
  props,
) => {
  const filteredPackages = () => {
    let filtered = props.packages;

    // Filter by search query
    if (props.searchQuery) {
      filtered = filtered.filter(
        (pkg) =>
          pkg.name.toLowerCase().includes(props.searchQuery.toLowerCase()) ||
          pkg.description
            .toLowerCase()
            .includes(props.searchQuery.toLowerCase()),
      );
    }

    // Filter by status
    if (props.selectedStatus !== "all") {
      filtered = filtered.filter((pkg) => pkg.status === props.selectedStatus);
    }

    return filtered;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "loaded":
        return "checkmark-circle";
      case "unloaded":
        return "circle";
      case "loading":
        return "loading";
      case "unloading":
        return "loading";
      case "reloading":
        return "refresh";
      case "error":
        return "warning";
      default:
        return "help";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "loaded":
        return "success";
      case "unloaded":
        return "muted";
      case "loading":
        return "info";
      case "unloading":
        return "info";
      case "reloading":
        return "primary";
      case "error":
        return "warning";
      default:
        return "default";
    }
  };

  const formatMemoryUsage = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div class="reynard-package-lifecycle-list">
      <div class="reynard-package-lifecycle-list__header">
        <h3>Package Lifecycle Management</h3>
        <div class="reynard-package-lifecycle-list__controls">
          <TextField
            placeholder="Search packages..."
            value={props.searchQuery}
            onInput={(e) => props.onSearchChange(e.currentTarget.value)}
            leftIcon="search"
            size="sm"
          />
          <Select
            value={props.selectedStatus}
            onChange={(value) => props.onStatusChange(value)}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "loaded", label: "Loaded" },
              { value: "unloaded", label: "Unloaded" },
              { value: "loading", label: "Loading" },
              { value: "error", label: "Error" },
            ]}
            size="sm"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={props.onRefresh}
            loading={props.isRefreshing}
            leftIcon="refresh"
          >
            Refresh
          </Button>
        </div>
      </div>

      <div class="reynard-package-lifecycle-list__content">
        <Show
          when={filteredPackages().length > 0}
          fallback={
            <div class="reynard-package-lifecycle-list__empty">
              <Icon name="package" size="lg" variant="muted" />
              <p>No packages found</p>
            </div>
          }
        >
          <For each={filteredPackages()}>
            {(pkg) => (
              <div class="reynard-package-lifecycle-item">
                <div class="reynard-package-lifecycle-item__header">
                  <div class="reynard-package-lifecycle-item__info">
                    <h4>{pkg.name}</h4>
                    <span class="reynard-package-lifecycle-item__version">
                      v{pkg.version}
                    </span>
                    <div class="reynard-package-lifecycle-item__status">
                      <Icon
                        name={getStatusIcon(pkg.status)}
                        variant={getStatusVariant(pkg.status)}
                        size="sm"
                      />
                      <span>{pkg.status}</span>
                    </div>
                  </div>
                  <div class="reynard-package-lifecycle-item__actions">
                    <Show when={pkg.status === "unloaded"}>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => props.onLoadPackage(pkg.name)}
                        leftIcon="play"
                      >
                        Load
                      </Button>
                    </Show>
                    <Show when={pkg.status === "loaded"}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => props.onUnloadPackage(pkg.name)}
                        leftIcon="stop"
                      >
                        Unload
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => props.onReloadPackage(pkg.name)}
                        leftIcon="refresh"
                      >
                        Reload
                      </Button>
                    </Show>
                  </div>
                </div>
                <p class="reynard-package-lifecycle-item__description">
                  {pkg.description}
                </p>
                <div class="reynard-package-lifecycle-item__meta">
                  <span>Memory: {formatMemoryUsage(pkg.memoryUsage)}</span>
                  <span>Load Time: {pkg.loadTime}ms</span>
                  <span>Load Count: {pkg.loadCount}</span>
                  <Show when={pkg.lastLoaded}>
                    <span>Last Loaded: {pkg.lastLoaded?.toLocaleString()}</span>
                  </Show>
                </div>
                <Show when={pkg.error}>
                  <div class="reynard-package-lifecycle-item__error">
                    <Icon name="warning" variant="error" size="sm" />
                    <span>{pkg.error}</span>
                  </div>
                </Show>
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
};
