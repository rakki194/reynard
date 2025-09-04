/**
 * Gallery State Composable
 * Manages gallery view state, selection, and configuration
 */

import { createSignal, createMemo, createEffect } from "solid-js";
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
import { sortItems, filterItems, generateBreadcrumbs } from "../utils";
import {
  DEFAULT_VIEW_CONFIG,
  DEFAULT_SORT_CONFIG,
  DEFAULT_FILTER_CONFIG,
  DEFAULT_SELECTION_STATE,
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

export function useGalleryState(options: UseGalleryStateOptions = {}) {
  const storageKey = options.storageKey || "reynard-gallery";

  // Load persisted state
  const loadPersistedState = <T>(key: string, defaultValue: T): T => {
    if (!options.persistState || typeof localStorage === "undefined") {
      return defaultValue;
    }

    try {
      const stored = localStorage.getItem(`${storageKey}-${key}`);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Save state to localStorage
  const saveState = <T>(key: string, value: T): void => {
    if (!options.persistState || typeof localStorage === "undefined") return;

    try {
      localStorage.setItem(`${storageKey}-${key}`, JSON.stringify(value));
    } catch {
      // Ignore localStorage errors
    }
  };

  // Core state
  const [galleryData, setGalleryData] = createSignal<GalleryData | null>(null);
  const [currentPath, setCurrentPath] = createSignal("");
  const [loading, setLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Configuration state
  const [viewConfig, setViewConfig] = createSignal<ViewConfiguration>({
    ...DEFAULT_VIEW_CONFIG,
    ...options.initialConfig?.view,
    ...loadPersistedState("view", {}),
  });
  const [sortConfig, setSortConfig] = createSignal<SortConfiguration>({
    ...DEFAULT_SORT_CONFIG,
    ...options.initialConfig?.sort,
    ...loadPersistedState("sort", {}),
  });
  const [filterConfig, setFilterConfig] = createSignal<FilterConfiguration>({
    ...DEFAULT_FILTER_CONFIG,
    ...options.initialConfig?.filter,
    ...loadPersistedState("filter", {}),
  });

  // Selection state
  const [selectionState, setSelectionState] = createSignal<SelectionState>(
    DEFAULT_SELECTION_STATE,
  );

  // Persist configuration changes
  createEffect(() => {
    saveState("view", viewConfig());
  });
  createEffect(() => {
    saveState("sort", sortConfig());
  });
  createEffect(() => {
    saveState("filter", filterConfig());
  });

  // Computed values
  const items = createMemo(() => {
    const data = galleryData();
    if (!data || !data.items) return [];

    const filtered = filterItems(data.items, filterConfig());
    return sortItems(filtered, sortConfig());
  });

  const selectedItems = createMemo(() => {
    const allItems = items();
    const selectedIds = selectionState().selectedIds;
    return allItems.filter((item) => selectedIds.has(item.id));
  });

  const breadcrumbs = createMemo(() => {
    return generateBreadcrumbs(currentPath());
  });

  const stats = createMemo(() => {
    const allItems = galleryData()?.items || [];
    const folders = allItems.filter((item) => item.type === "folder").length;
    const files = allItems.filter((item) => item.type !== "folder").length;
    const totalSize = allItems
      .filter((item): item is FileItem => item.type !== "folder")
      .reduce((sum, file) => sum + file.size, 0);

    return {
      totalItems: allItems.length,
      folders,
      files,
      totalSize,
      filteredItems: items().length,
      selectedItems: selectionState().selectedIds.size,
    };
  });

  // Navigation actions
  const navigateToPath = (path: string): void => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    setCurrentPath(normalizedPath);
    clearSelection();
    options.callbacks?.onNavigate?.(normalizedPath);
  };

  const navigateUp = (): void => {
    const current = currentPath();
    const parts = current.split("/").filter(Boolean);
    if (parts.length > 0) {
      const parentPath = "/" + parts.slice(0, -1).join("/");
      navigateToPath(parentPath === "/" ? "" : parentPath);
    }
  };

  const navigateToItem = (item: FileItem | FolderItem): void => {
    if (item.type === "folder") {
      const newPath = currentPath()
        ? `${currentPath()}/${item.name}`
        : `/${item.name}`;
      navigateToPath(newPath);
    } else {
      options.callbacks?.onItemOpen?.(item);
    }
  };

  // Selection actions
  const selectItem = (
    item: FileItem | FolderItem,
    mode: "single" | "add" | "range" = "single",
  ): void => {
    setSelectionState((prev) => {
      const newSelectedIds = new Set(prev.selectedIds);

      if (mode === "single") {
        newSelectedIds.clear();
        newSelectedIds.add(item.id);
      } else if (mode === "add") {
        if (newSelectedIds.has(item.id)) {
          newSelectedIds.delete(item.id);
        } else {
          newSelectedIds.add(item.id);
        }
      } else if (mode === "range" && prev.lastSelectedId) {
        const allItems = items();
        const lastIndex = allItems.findIndex(
          (i) => i.id === prev.lastSelectedId,
        );
        const currentIndex = allItems.findIndex((i) => i.id === item.id);

        if (lastIndex !== -1 && currentIndex !== -1) {
          const start = Math.min(lastIndex, currentIndex);
          const end = Math.max(lastIndex, currentIndex);

          for (let i = start; i <= end; i++) {
            newSelectedIds.add(allItems[i].id);
          }
        }
      }

      const newState = {
        ...prev,
        selectedIds: newSelectedIds,
        lastSelectedId: item.id,
        active: newSelectedIds.size > 0,
      };

      // Trigger callback
      const selectedItemsList = items().filter((i) => newSelectedIds.has(i.id));
      options.callbacks?.onSelectionChange?.(selectedItemsList);

      return newState;
    });
  };

  const selectAll = (): void => {
    const allItems = items();
    const allIds = new Set(allItems.map((item) => item.id));

    setSelectionState((prev) => ({
      ...prev,
      selectedIds: allIds,
      active: allIds.size > 0,
    }));

    options.callbacks?.onSelectionChange?.(allItems);
  };

  const clearSelection = (): void => {
    setSelectionState((prev) => ({
      ...prev,
      selectedIds: new Set(),
      lastSelectedId: undefined,
      active: false,
    }));

    options.callbacks?.onSelectionChange?.([]);
  };

  const toggleItemSelection = (item: FileItem | FolderItem): void => {
    selectItem(item, "add");
  };

  // Favorite actions
  const toggleFavorite = (item: FileItem | FolderItem): void => {
    const newFavorited = !item.favorited;

    // Update item in gallery data
    setGalleryData((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        items: prev.items.map((i) =>
          i.id === item.id ? { ...i, favorited: newFavorited } : i,
        ),
      };
    });

    options.callbacks?.onFavorite?.(item, newFavorited);
  };

  // Configuration actions
  const updateViewConfig = (updates: Partial<ViewConfiguration>): void => {
    setViewConfig((prev) => ({ ...prev, ...updates }));
  };

  const updateSortConfig = (updates: Partial<SortConfiguration>): void => {
    setSortConfig((prev) => ({ ...prev, ...updates }));
  };

  const updateFilterConfig = (updates: Partial<FilterConfiguration>): void => {
    setFilterConfig((prev) => ({ ...prev, ...updates }));
  };

  const resetFilters = (): void => {
    setFilterConfig(DEFAULT_FILTER_CONFIG);
  };

  // Data management
  const refreshData = (): void => {
    setError(null);
    // This would typically trigger a refetch of gallery data
    // The actual implementation depends on your data fetching strategy
  };

  const updateData = (newData: GalleryData): void => {
    setGalleryData(newData);
    setError(null);
  };

  const setLoadingState = (isLoading: boolean): void => {
    setLoading(isLoading);
  };

  const setErrorState = (errorMessage: string | null): void => {
    setError(errorMessage);
    if (errorMessage) {
      options.callbacks?.onError?.(errorMessage);
    }
  };

  return {
    // State
    galleryData,
    currentPath,
    loading,
    error,
    viewConfig,
    sortConfig,
    filterConfig,
    selectionState,

    // Computed
    items,
    selectedItems,
    breadcrumbs,
    stats,

    // Navigation
    navigateToPath,
    navigateUp,
    navigateToItem,

    // Selection
    selectItem,
    selectAll,
    clearSelection,
    toggleItemSelection,

    // Favorites
    toggleFavorite,

    // Configuration
    updateViewConfig,
    updateSortConfig,
    updateFilterConfig,
    resetFilters,

    // Data management
    refreshData,
    updateData,
    setLoadingState,
    setErrorState,
  };
}
