/**
 * BreadcrumbItem Component
 * Individual breadcrumb item with metadata display
 */

import { Component, Show } from "solid-js";
import { BreadcrumbItem as BreadcrumbItemType } from "./types";
import { MetadataDisplay } from "./MetadataDisplay";

export interface BreadcrumbItemProps {
  item: BreadcrumbItemType;
  index: number;
  showMetadata: boolean;
  showItemCounts: boolean;
  showFileSizes: boolean;
  showLastModified: boolean;
  showFullPaths: boolean;
  isExpanded: boolean;
  onItemClick: (item: BreadcrumbItemType) => void;
  onToggleExpanded: (path: string) => void;
}

export const BreadcrumbItem: Component<BreadcrumbItemProps> = (props) => {
  return (
    <li class="reynard-breadcrumb-navigation__item">
      <Show when={props.index > 0}>
        <span class="reynard-breadcrumb-navigation__separator">/</span>
      </Show>

      <Show when={props.item.clickable !== false}>
        <button
          class="reynard-breadcrumb-navigation__link"
          onClick={() => props.onItemClick(props.item)}
          title={props.showFullPaths ? props.item.fullPath : props.item.name}
        >
          <Show when={props.item.icon}>
            <span class="reynard-breadcrumb-navigation__item-icon">
              {props.item.icon}
            </span>
          </Show>
          <span class="reynard-breadcrumb-navigation__item-name">
            {props.showFullPaths ? props.item.fullPath : props.item.name}
          </span>
        </button>
      </Show>

      <Show when={props.item.clickable === false}>
        <span class="reynard-breadcrumb-navigation__current">
          <Show when={props.item.icon}>
            <span class="reynard-breadcrumb-navigation__item-icon">
              {props.item.icon}
            </span>
          </Show>
          <span class="reynard-breadcrumb-navigation__item-name">
            {props.item.name}
          </span>
        </span>
      </Show>

      {/* Expandable Metadata */}
      <Show when={props.showMetadata && props.item.metadata}>
        <MetadataDisplay
          item={props.item}
          isExpanded={props.isExpanded}
          showItemCounts={props.showItemCounts}
          showFileSizes={props.showFileSizes}
          showLastModified={props.showLastModified}
          onToggleExpanded={props.onToggleExpanded}
        />
      </Show>
    </li>
  );
};
