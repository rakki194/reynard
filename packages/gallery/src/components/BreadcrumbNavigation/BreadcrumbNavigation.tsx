/**
 * BreadcrumbNavigation Component
 * Enhanced breadcrumb navigation with metadata and actions
 */

import { Component } from "solid-js";
import { BreadcrumbRenderer } from "./BreadcrumbRenderer";
import { useBreadcrumbState } from "./useBreadcrumbState";
import { useBreadcrumbHandlers } from "./useBreadcrumbHandlers";
import { useBreadcrumbProps } from "./useBreadcrumbProps";
import type { BreadcrumbNavigationProps } from "./types";
import "./BreadcrumbNavigation.css";

export const BreadcrumbNavigation: Component<BreadcrumbNavigationProps> = (
  props,
) => {
  const { local } = useBreadcrumbProps(props);

  // State management
  const { state, toggleExpanded, toggleFullPaths, isExpanded } =
    useBreadcrumbState();

  // Event handlers
  const {
    handleItemClick,
    handleHomeClick,
    handleRefreshClick,
    handleSettingsClick,
  } = useBreadcrumbHandlers({
    onItemClick: local.onItemClick,
    onHomeClick: local.onHomeClick,
    onRefreshClick: local.onRefreshClick,
    onSettingsClick: local.onSettingsClick,
  });

  return (
    <BreadcrumbRenderer
      items={local.items}
      showMetadata={local.showMetadata}
      showItemCounts={local.showItemCounts}
      showFileSizes={local.showFileSizes}
      showLastModified={local.showLastModified}
      showActions={local.showActions}
      class={local.class}
      state={state()}
      isExpanded={isExpanded}
      handleItemClick={handleItemClick}
      handleHomeClick={handleHomeClick}
      handleRefreshClick={handleRefreshClick}
      handleSettingsClick={handleSettingsClick}
      toggleExpanded={toggleExpanded}
      toggleFullPaths={toggleFullPaths}
    />
  );
};
