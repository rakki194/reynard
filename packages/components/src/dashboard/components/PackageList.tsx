/**
 * Package List Component
 * Displays and manages the list of packages for configuration
 */

import { Component, For, Show } from "solid-js";
import { Button, TextField, Select } from "reynard-components";
import { Icon } from "reynard-components/icons";
import type { PackageListProps } from "../types/PackageConfigurationTypes";

export const PackageList: Component<PackageListProps> = (props) => {
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

    // Filter by category
    if (props.selectedCategory !== "all") {
      filtered = filtered.filter(
        (pkg) => pkg.category === props.selectedCategory,
      );
    }

    return filtered;
  };

  const categories = () => {
    const cats = new Set(props.packages.map((pkg) => pkg.category));
    return Array.from(cats);
  };

  return (
    <div class="reynard-package-list">
      <div class="reynard-package-list__header">
        <h3>Package Configuration</h3>
        <div class="reynard-package-list__controls">
          <TextField
            placeholder="Search packages..."
            value={props.searchQuery}
            onInput={(e) => props.onSearchChange(e.currentTarget.value)}
            leftIcon="search"
            size="sm"
          />
          <Select
            value={props.selectedCategory}
            onChange={(value) => props.onCategoryChange(value)}
            options={[
              { value: "all", label: "All Categories" },
              ...categories().map((cat) => ({ value: cat, label: cat })),
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

      <div class="reynard-package-list__content">
        <Show
          when={filteredPackages().length > 0}
          fallback={
            <div class="reynard-package-list__empty">
              <Icon name="package" size="lg" variant="muted" />
              <p>No packages found</p>
            </div>
          }
        >
          <For each={filteredPackages()}>
            {(pkg) => (
              <div
                class={`reynard-package-item ${
                  props.selectedPackage === pkg.name
                    ? "reynard-package-item--selected"
                    : ""
                }`}
                onClick={() => props.onSelectPackage(pkg.name)}
              >
                <div class="reynard-package-item__header">
                  <div class="reynard-package-item__info">
                    <h4>{pkg.name}</h4>
                    <span class="reynard-package-item__version">
                      v{pkg.version}
                    </span>
                  </div>
                  <div class="reynard-package-item__status">
                    <Icon
                      name={pkg.isConfigured ? "checkmark-circle" : "warning"}
                      variant={pkg.isConfigured ? "success" : "warning"}
                      size="sm"
                    />
                  </div>
                </div>
                <p class="reynard-package-item__description">
                  {pkg.description}
                </p>
                <div class="reynard-package-item__meta">
                  <span class="reynard-package-item__category">
                    {pkg.category}
                  </span>
                  <span class="reynard-package-item__modified">
                    Modified: {pkg.lastModified.toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </For>
        </Show>
      </div>
    </div>
  );
};
