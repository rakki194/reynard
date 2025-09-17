/**
 * Package Lifecycle Panel Component
 * Main component for package lifecycle management
 * Refactored to be modular and under 140 lines
 */

import { Component, Show } from "solid-js";
import { Button } from "../primitives";
import { Icon } from "../icons";
import { LifecycleSummaryCard } from "./components/LifecycleSummaryCard";
import { PackageLifecycleList } from "./components/PackageLifecycleList";
import { usePackageLifecycle } from "./composables/usePackageLifecycle";
import type { PackageLifecyclePanelProps } from "./types/PackageLifecycleTypes";

export const PackageLifecyclePanel: Component<PackageLifecyclePanelProps> = props => {
  const { state, refreshLifecycleData, loadPackage, unloadPackage, reloadPackage, setSearchQuery, setSelectedStatus } =
    usePackageLifecycle(props.refreshInterval);

  return (
    <div class="reynard-package-lifecycle-panel">
      <div class="reynard-package-lifecycle-panel__header">
        <div class="reynard-package-lifecycle-panel__title">
          <Icon name="refresh" size="lg" />
          <h2>Package Lifecycle Management</h2>
        </div>
        <div class="reynard-package-lifecycle-panel__actions">
          <Button
            variant="primary"
            size="sm"
            leftIcon="refresh"
            onClick={refreshLifecycleData}
            loading={state().isRefreshing}
          >
            Refresh All
          </Button>
        </div>
      </div>

      <div class="reynard-package-lifecycle-panel__content">
        <div class="reynard-package-lifecycle-panel__summary">
          <LifecycleSummaryCard
            summary={state().summary}
            onRefresh={refreshLifecycleData}
            isRefreshing={state().isRefreshing}
          />
        </div>

        <div class="reynard-package-lifecycle-panel__list">
          <PackageLifecycleList
            packages={state().packages}
            onLoadPackage={loadPackage}
            onUnloadPackage={unloadPackage}
            onReloadPackage={reloadPackage}
            searchQuery={state().searchQuery}
            onSearchChange={setSearchQuery}
            selectedStatus={state().selectedStatus}
            onStatusChange={setSelectedStatus}
            isRefreshing={state().isRefreshing}
            onRefresh={refreshLifecycleData}
          />
        </div>
      </div>

      <Show when={state().lastUpdate}>
        <div class="reynard-package-lifecycle-panel__footer">
          <small>Last updated: {state().lastUpdate?.toLocaleString()}</small>
        </div>
      </Show>
    </div>
  );
};
