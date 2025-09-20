/**
 * BreadcrumbRenderer Component
 * Renders the breadcrumb navigation JSX
 */

import { Component, For, Show } from "solid-js";
import { BreadcrumbItem } from "./BreadcrumbItem";
import { BreadcrumbActions } from "./BreadcrumbActions";
import { BreadcrumbSummary } from "./BreadcrumbSummary";
import { HomeButton } from "./HomeButton";
import type { BreadcrumbItem as BreadcrumbItemType, BreadcrumbNavigationState } from "./types";

export interface BreadcrumbRendererProps {
  items: BreadcrumbItemType[];
  showMetadata: boolean;
  showItemCounts: boolean;
  showFileSizes: boolean;
  showLastModified: boolean;
  showActions: boolean;
  class?: string;
  state: BreadcrumbNavigationState;
  isExpanded: (path: string) => boolean;
  handleItemClick: (item: BreadcrumbItemType) => void;
  handleHomeClick: () => void;
  handleRefreshClick: () => void;
  handleSettingsClick: () => void;
  toggleExpanded: (path: string) => void;
  toggleFullPaths: () => void;
}

export const BreadcrumbRenderer: Component<BreadcrumbRendererProps> = props => {
  return (
    <div class={`reynard-breadcrumb-navigation ${props.class || ""}`}>
      {/* Breadcrumb Path */}
      <nav class="reynard-breadcrumb-navigation__path" aria-label="Breadcrumb navigation">
        <ol class="reynard-breadcrumb-navigation__list">
          {/* Home */}
          <HomeButton onHomeClick={props.handleHomeClick} />

          {/* Breadcrumb Items */}
          <For each={props.items}>
            {(item, index) => (
              <BreadcrumbItem
                item={item}
                index={index()}
                showMetadata={props.showMetadata}
                showItemCounts={props.showItemCounts}
                showFileSizes={props.showFileSizes}
                showLastModified={props.showLastModified}
                showFullPaths={props.state.showFullPaths}
                isExpanded={props.isExpanded(item.path)}
                onItemClick={props.handleItemClick}
                onToggleExpanded={props.toggleExpanded}
              />
            )}
          </For>
        </ol>
      </nav>

      {/* Summary Information */}
      <BreadcrumbSummary
        items={props.items}
        showMetadata={props.showMetadata}
        showItemCounts={props.showItemCounts}
        showFileSizes={props.showFileSizes}
      />

      {/* Actions */}
      <Show when={props.showActions}>
        <BreadcrumbActions
          showFullPaths={props.state.showFullPaths}
          onToggleFullPaths={props.toggleFullPaths}
          onRefreshClick={props.handleRefreshClick}
          onSettingsClick={props.handleSettingsClick}
        />
      </Show>
    </div>
  );
};
