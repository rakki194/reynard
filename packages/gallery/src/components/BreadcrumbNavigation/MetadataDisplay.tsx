/**
 * MetadataDisplay Component
 * Displays expandable metadata for breadcrumb items
 */

import { Component, Show } from "solid-js";
import { BreadcrumbItem } from "./types";
import { formatDate } from "./utils";

export interface MetadataDisplayProps {
  item: BreadcrumbItem;
  isExpanded: boolean;
  showItemCounts: boolean;
  showFileSizes: boolean;
  showLastModified: boolean;
  onToggleExpanded: (path: string) => void;
}

export const MetadataDisplay: Component<MetadataDisplayProps> = (props) => {
  return (
    <Show when={props.item.metadata}>
      <Show
        when={props.isExpanded}
        fallback={
          <button
            class="reynard-breadcrumb-navigation__expand-button"
            onClick={() => props.onToggleExpanded(props.item.path)}
            aria-expanded="false"
            aria-label="Toggle metadata"
          >
            ▶
          </button>
        }
      >
        <button
          class="reynard-breadcrumb-navigation__expand-button"
          onClick={() => props.onToggleExpanded(props.item.path)}
          aria-expanded="true"
          aria-label="Toggle metadata"
        >
          ▼
        </button>
      </Show>

      <Show when={props.isExpanded}>
        <div class="reynard-breadcrumb-navigation__metadata">
          <Show
            when={
              props.showItemCounts &&
              props.item.metadata?.itemCount !== undefined
            }
          >
            <div class="reynard-breadcrumb-navigation__metadata-item">
              <span class="reynard-breadcrumb-navigation__metadata-label">
                Items:
              </span>
              <span class="reynard-breadcrumb-navigation__metadata-value">
                {props.item.metadata!.itemCount!.toLocaleString()}
              </span>
            </div>
          </Show>

          <Show when={props.showFileSizes && props.item.metadata?.size}>
            <div class="reynard-breadcrumb-navigation__metadata-item">
              <span class="reynard-breadcrumb-navigation__metadata-label">
                Size:
              </span>
              <span class="reynard-breadcrumb-navigation__metadata-value">
                {props.item.metadata!.size}
              </span>
            </div>
          </Show>

          <Show
            when={props.showLastModified && props.item.metadata?.lastModified}
          >
            <div class="reynard-breadcrumb-navigation__metadata-item">
              <span class="reynard-breadcrumb-navigation__metadata-label">
                Modified:
              </span>
              <span class="reynard-breadcrumb-navigation__metadata-value">
                {formatDate(props.item.metadata!.lastModified!)}
              </span>
            </div>
          </Show>

          <Show when={props.item.metadata?.type}>
            <div class="reynard-breadcrumb-navigation__metadata-item">
              <span class="reynard-breadcrumb-navigation__metadata-label">
                Type:
              </span>
              <span class="reynard-breadcrumb-navigation__metadata-value">
                {props.item.metadata!.type}
              </span>
            </div>
          </Show>
        </div>
      </Show>
    </Show>
  );
};
