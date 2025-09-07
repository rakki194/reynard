/**
 * Custom hook for breadcrumb navigation event handlers
 */

import { createEffect } from "solid-js";
import type { BreadcrumbItem as BreadcrumbItemType } from "./types";

export interface BreadcrumbHandlers {
  onItemClick?: (item: BreadcrumbItemType) => void;
  onHomeClick?: () => void;
  onRefreshClick?: () => void;
  onSettingsClick?: () => void;
}

export const useBreadcrumbHandlers = (handlers: BreadcrumbHandlers) => {
  // Track reactive handlers
  createEffect(() => {
    handlers.onItemClick;
    handlers.onHomeClick;
    handlers.onRefreshClick;
    handlers.onSettingsClick;
  });

  const handleItemClick = (item: BreadcrumbItemType) => {
    if (item.clickable !== false) {
      handlers.onItemClick?.(item);
    }
  };

  const handleHomeClick = () => {
    handlers.onHomeClick?.();
  };

  const handleRefreshClick = () => {
    handlers.onRefreshClick?.();
  };

  const handleSettingsClick = () => {
    handlers.onSettingsClick?.();
  };

  return {
    handleItemClick,
    handleHomeClick,
    handleRefreshClick,
    handleSettingsClick,
  };
};
