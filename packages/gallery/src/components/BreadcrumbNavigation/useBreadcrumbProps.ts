/**
 * Custom hook for breadcrumb navigation props handling
 */

import { splitProps } from "solid-js";
import type { BreadcrumbNavigationProps } from "./types";

const defaultProps = {
  showMetadata: true,
  showItemCounts: true,
  showFileSizes: true,
  showLastModified: true,
  showActions: true,
};

export const useBreadcrumbProps = (props: BreadcrumbNavigationProps) => {
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

  return { local };
};
