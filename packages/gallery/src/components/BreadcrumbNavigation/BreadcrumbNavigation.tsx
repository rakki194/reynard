/**
 * BreadcrumbNavigation Component
 * Enhanced breadcrumb navigation with metadata and actions
 */

import { Component, createSignal, splitProps, For, Show } from "solid-js";
import { Button } from "reynard-components";
import "./BreadcrumbNavigation.css";

export interface BreadcrumbItem {
  /** Display name */
  name: string;
  /** Path segment */
  path: string;
  /** Full path from root */
  fullPath: string;
  /** Whether this item is clickable */
  clickable?: boolean;
  /** Optional icon */
  icon?: string;
  /** Optional metadata */
  metadata?: {
    itemCount?: number;
    size?: string;
    lastModified?: string;
    type?: string;
  };
}

export interface BreadcrumbNavigationProps {
  /** Array of breadcrumb items */
  items: BreadcrumbItem[];
  /** Whether to show metadata */
  showMetadata?: boolean;
  /** Whether to show item counts */
  showItemCounts?: boolean;
  /** Whether to show file sizes */
  showFileSizes?: boolean;
  /** Whether to show last modified dates */
  showLastModified?: boolean;
  /** Whether to show breadcrumb actions */
  showActions?: boolean;
  /** Callback when a breadcrumb item is clicked */
  onItemClick?: (item: BreadcrumbItem) => void;
  /** Callback when home is clicked */
  onHomeClick?: () => void;
  /** Callback when refresh is clicked */
  onRefreshClick?: () => void;
  /** Callback when settings is clicked */
  onSettingsClick?: () => void;
  /** Custom class name */
  class?: string;
}

export interface BreadcrumbNavigationState {
  expandedItems: Set<string>;
  showFullPaths: boolean;
}

const defaultProps = {
  showMetadata: true,
  showItemCounts: true,
  showFileSizes: true,
  showLastModified: true,
  showActions: true,
};

export const BreadcrumbNavigation: Component<BreadcrumbNavigationProps> = (
  props,
) => {
  const merged = { ...defaultProps, ...props };
  const [local] = splitProps(merged, [
    "items",
    "showMetadata",
    "showItemCounts",
    "showFileSizes",
    "showLastModified",
    "showActions",
    "onItemClick",
    "onHomeClick",
    "onRefreshClick",
    "onSettingsClick",
    "class",
  ]);

  // State
  const [state, setState] = createSignal<BreadcrumbNavigationState>({
    expandedItems: new Set(),
    showFullPaths: false,
  });

  // Event handlers
  const handleItemClick = (item: BreadcrumbItem) => {
    if (item.clickable !== false) {
      local.onItemClick?.(item);
    }
  };

  const handleHomeClick = () => {
    local.onHomeClick?.();
  };

  const handleRefreshClick = () => {
    local.onRefreshClick?.();
  };

  const handleSettingsClick = () => {
    local.onSettingsClick?.();
  };

  const toggleExpanded = (itemPath: string) => {
    setState((prev) => {
      const newExpanded = new Set(prev.expandedItems);
      if (newExpanded.has(itemPath)) {
        newExpanded.delete(itemPath);
      } else {
        newExpanded.add(itemPath);
      }
      return { ...prev, expandedItems: newExpanded };
    });
  };

  const toggleFullPaths = () => {
    setState((prev) => ({ ...prev, showFullPaths: !prev.showFullPaths }));
  };

  // Computed values
  const hasMetadata = () => local.items.some((item) => item.metadata);
  const totalItems = () =>
    local.items.reduce((sum, item) => sum + (item.metadata?.itemCount || 0), 0);
  const totalSize = () => {
    const sizes = local.items
      .map((item) => item.metadata?.size)
      .filter(Boolean)
      .map((size) => parseFileSize(size!));

    if (sizes.length === 0) return null;

    const totalBytes = sizes.reduce((sum, bytes) => sum + bytes, 0);
    return formatFileSize(totalBytes);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const parseFileSize = (sizeString: string): number => {
    const match = sizeString.match(/^([\d.]+)\s*([KMGT]?B)$/i);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();
    const multipliers = {
      B: 1,
      KB: 1024,
      MB: 1024 * 1024,
      GB: 1024 * 1024 * 1024,
      TB: 1024 * 1024 * 1024 * 1024,
    };
    return value * (multipliers[unit as keyof typeof multipliers] || 1);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const isExpanded = (path: string) => state().expandedItems.has(path);

  return (
    <div class={`reynard-breadcrumb-navigation ${local.class || ""}`}>
      {/* Breadcrumb Path */}
      <nav
        class="reynard-breadcrumb-navigation__path"
        aria-label="Breadcrumb navigation"
      >
        <ol class="reynard-breadcrumb-navigation__list">
          {/* Home */}
          <li class="reynard-breadcrumb-navigation__item">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHomeClick}
              class="reynard-breadcrumb-navigation__home-button"
              aria-label="Go to home"
            >
              🏠
            </Button>
          </li>

          {/* Breadcrumb Items */}
          <For each={local.items}>
            {(item, index) => (
              <li class="reynard-breadcrumb-navigation__item">
                <Show when={index() > 0}>
                  <span class="reynard-breadcrumb-navigation__separator">
                    /
                  </span>
                </Show>

                <Show when={item.clickable !== false}>
                  <button
                    class="reynard-breadcrumb-navigation__link"
                    onClick={() => handleItemClick(item)}
                    title={state().showFullPaths ? item.fullPath : item.name}
                  >
                    <Show when={item.icon}>
                      <span class="reynard-breadcrumb-navigation__item-icon">
                        {item.icon}
                      </span>
                    </Show>
                    <span class="reynard-breadcrumb-navigation__item-name">
                      {state().showFullPaths ? item.fullPath : item.name}
                    </span>
                  </button>
                </Show>

                <Show when={item.clickable === false}>
                  <span class="reynard-breadcrumb-navigation__current">
                    <Show when={item.icon}>
                      <span class="reynard-breadcrumb-navigation__item-icon">
                        {item.icon}
                      </span>
                    </Show>
                    <span class="reynard-breadcrumb-navigation__item-name">
                      {item.name}
                    </span>
                  </span>
                </Show>

                {/* Expandable Metadata */}
                <Show
                  when={local.showMetadata && item.metadata && hasMetadata()}
                >
                  <Show
                    when={isExpanded(item.path)}
                    fallback={
                      <button
                        class="reynard-breadcrumb-navigation__expand-button"
                        onClick={() => toggleExpanded(item.path)}
                        aria-expanded="false"
                        aria-label="Toggle metadata"
                      >
                        ▶
                      </button>
                    }
                  >
                    <button
                      class="reynard-breadcrumb-navigation__expand-button"
                      onClick={() => toggleExpanded(item.path)}
                      aria-expanded="true"
                      aria-label="Toggle metadata"
                    >
                      ▼
                    </button>
                  </Show>

                  <Show when={state().expandedItems.has(item.path)}>
                    <div class="reynard-breadcrumb-navigation__metadata">
                      <Show
                        when={
                          local.showItemCounts &&
                          item.metadata?.itemCount !== undefined
                        }
                      >
                        <div class="reynard-breadcrumb-navigation__metadata-item">
                          <span class="reynard-breadcrumb-navigation__metadata-label">
                            Items:
                          </span>
                          <span class="reynard-breadcrumb-navigation__metadata-value">
                            {item.metadata!.itemCount!.toLocaleString()}
                          </span>
                        </div>
                      </Show>

                      <Show when={local.showFileSizes && item.metadata?.size}>
                        <div class="reynard-breadcrumb-navigation__metadata-item">
                          <span class="reynard-breadcrumb-navigation__metadata-label">
                            Size:
                          </span>
                          <span class="reynard-breadcrumb-navigation__metadata-value">
                            {item.metadata!.size}
                          </span>
                        </div>
                      </Show>

                      <Show
                        when={
                          local.showLastModified && item.metadata?.lastModified
                        }
                      >
                        <div class="reynard-breadcrumb-navigation__metadata-item">
                          <span class="reynard-breadcrumb-navigation__metadata-label">
                            Modified:
                          </span>
                          <span class="reynard-breadcrumb-navigation__metadata-value">
                            {formatDate(item.metadata!.lastModified!)}
                          </span>
                        </div>
                      </Show>

                      <Show when={item.metadata?.type}>
                        <div class="reynard-breadcrumb-navigation__metadata-item">
                          <span class="reynard-breadcrumb-navigation__metadata-label">
                            Type:
                          </span>
                          <span class="reynard-breadcrumb-navigation__metadata-value">
                            {item.metadata!.type}
                          </span>
                        </div>
                      </Show>
                    </div>
                  </Show>
                </Show>
              </li>
            )}
          </For>
        </ol>
      </nav>

      {/* Summary Information */}
      <Show when={local.showMetadata && hasMetadata()}>
        <div class="reynard-breadcrumb-navigation__summary">
          <Show when={local.showItemCounts && totalItems() > 0}>
            <span class="reynard-breadcrumb-navigation__summary-item">
              📁 {totalItems().toLocaleString()} items
            </span>
          </Show>

          <Show when={local.showFileSizes && totalSize()}>
            <span class="reynard-breadcrumb-navigation__summary-item">
              💾 {totalSize()}
            </span>
          </Show>
        </div>
      </Show>

      {/* Actions */}
      <Show when={local.showActions}>
        <div class="reynard-breadcrumb-navigation__actions">
          <Button
            size="sm"
            variant="secondary"
            onClick={toggleFullPaths}
            title={
              state().showFullPaths ? "Show short paths" : "Show full paths"
            }
          >
            {state().showFullPaths ? "Short" : "Full"}
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleRefreshClick}
            title="Refresh current location"
          >
            🔄
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleSettingsClick}
            title="Breadcrumb settings"
          >
            ⚙️
          </Button>
        </div>
      </Show>
    </div>
  );
};
