/**
 * BreadcrumbSummary Component
 * Summary information display for breadcrumb navigation
 */

import { Component, Show } from "solid-js";
import { BreadcrumbItem } from "./types";
import { parseFileSize, formatFileSize } from "./utils";

export interface BreadcrumbSummaryProps {
  items: BreadcrumbItem[];
  showMetadata: boolean;
  showItemCounts: boolean;
  showFileSizes: boolean;
}

export const BreadcrumbSummary: Component<BreadcrumbSummaryProps> = props => {
  const hasMetadata = () => props.items.some(item => item.metadata);

  const totalItems = () => props.items.reduce((sum, item) => sum + (item.metadata?.itemCount || 0), 0);

  const totalSize = () => {
    const sizes = props.items
      .map(item => item.metadata?.size)
      .filter(Boolean)
      .map(size => parseFileSize(size!));

    if (sizes.length === 0) return null;

    const totalBytes = sizes.reduce((sum, bytes) => sum + bytes, 0);
    return formatFileSize(totalBytes);
  };

  return (
    <Show when={props.showMetadata && hasMetadata()}>
      <div class="reynard-breadcrumb-navigation__summary">
        <Show when={props.showItemCounts && totalItems() > 0}>
          <span class="reynard-breadcrumb-navigation__summary-item">📁 {totalItems().toLocaleString()} items</span>
        </Show>

        <Show when={props.showFileSizes && totalSize()}>
          <span class="reynard-breadcrumb-navigation__summary-item">💾 {totalSize()}</span>
        </Show>
      </div>
    </Show>
  );
};
