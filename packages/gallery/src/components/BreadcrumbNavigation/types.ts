/**
 * Type definitions for breadcrumb navigation components
 */

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
