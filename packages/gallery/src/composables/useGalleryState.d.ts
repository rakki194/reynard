/**
 * Gallery State Composable
 * Manages gallery view state, selection, and configuration
 */
import type {
  FileItem,
  FolderItem,
  GalleryData,
  ViewConfiguration,
  SortConfiguration,
  FilterConfiguration,
  SelectionState,
  GalleryConfiguration,
  GalleryCallbacks,
} from "../types";
export interface UseGalleryStateOptions {
  /** Initial configuration */
  initialConfig?: Partial<GalleryConfiguration>;
  /** Gallery callbacks */
  callbacks?: GalleryCallbacks;
  /** Whether to persist state to localStorage */
  persistState?: boolean;
  /** localStorage key prefix */
  storageKey?: string;
}
export declare function useGalleryState(options?: UseGalleryStateOptions): {
  galleryData: import("solid-js").Accessor<GalleryData | null>;
  currentPath: import("solid-js").Accessor<string>;
  loading: import("solid-js").Accessor<boolean>;
  error: import("solid-js").Accessor<string | null>;
  viewConfig: import("solid-js").Accessor<ViewConfiguration>;
  sortConfig: import("solid-js").Accessor<SortConfiguration>;
  filterConfig: import("solid-js").Accessor<FilterConfiguration>;
  selectionState: import("solid-js").Accessor<SelectionState>;
  items: import("solid-js").Accessor<(FileItem | FolderItem)[]>;
  selectedItems: import("solid-js").Accessor<(FileItem | FolderItem)[]>;
  breadcrumbs: import("solid-js").Accessor<import("..").BreadcrumbItem[]>;
  stats: import("solid-js").Accessor<{
    totalItems: number;
    folders: number;
    files: number;
    totalSize: number;
    filteredItems: number;
    selectedItems: number;
  }>;
  navigateToPath: (path: string) => void;
  navigateUp: () => void;
  navigateToItem: (item: FileItem | FolderItem) => void;
  selectItem: (
    item: FileItem | FolderItem,
    mode?: "single" | "add" | "range",
  ) => void;
  selectAll: () => void;
  clearSelection: () => void;
  toggleItemSelection: (item: FileItem | FolderItem) => void;
  toggleFavorite: (item: FileItem | FolderItem) => void;
  updateViewConfig: (updates: Partial<ViewConfiguration>) => void;
  updateSortConfig: (updates: Partial<SortConfiguration>) => void;
  updateFilterConfig: (updates: Partial<FilterConfiguration>) => void;
  resetFilters: () => void;
  refreshData: () => void;
  updateData: (newData: GalleryData) => void;
  setLoadingState: (isLoading: boolean) => void;
  setErrorState: (errorMessage: string | null) => void;
};
