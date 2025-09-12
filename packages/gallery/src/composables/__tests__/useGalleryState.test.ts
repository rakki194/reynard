/**
 * Gallery State Composable Test Suite
 *
 * Tests for the useGalleryState composable including state management,
 * persistence, and configuration handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@solidjs/testing-library";
import { useGalleryState } from "../useGalleryState";

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useGalleryState", () => {
  const mockGalleryData = {
    files: [
      {
        id: "1",
        name: "image1.jpg",
        type: "image",
        size: 1024000,
        modified: new Date("2023-01-01"),
        path: "/image1.jpg",
      },
      {
        id: "2",
        name: "document.pdf",
        type: "document",
        size: 2048000,
        modified: new Date("2023-01-02"),
        path: "/document.pdf",
      },
    ],
    folders: [
      {
        id: "folder1",
        name: "Photos",
        path: "/Photos",
        itemCount: 5,
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe("Initial State", () => {
    it("should initialize with default values", () => {
      const { result } = renderHook(() => useGalleryState());

      expect(result.current.currentPath()).toBe("/");
      expect(result.current.selectedItems()).toEqual([]);
      expect(result.current.viewMode()).toBe("grid");
      expect(result.current.sortBy()).toBe("name");
      expect(result.current.sortOrder()).toBe("asc");
      expect(result.current.filter()).toBe("");
      expect(result.current.isLoading()).toBe(false);
      expect(result.current.error()).toBe(null);
    });

    it("should initialize with custom configuration", () => {
      const initialConfig = {
        viewConfig: { mode: "list" as const },
        sortConfig: { by: "size" as const, order: "desc" as const },
        filterConfig: { types: ["image"] },
      };

      const { result } = renderHook(() => useGalleryState({ initialConfig }));

      expect(result.current.viewMode()).toBe("list");
      expect(result.current.sortBy()).toBe("size");
      expect(result.current.sortOrder()).toBe("desc");
    });
  });

  describe("State Management", () => {
    it("should update current path", () => {
      const { result } = renderHook(() => useGalleryState());

      act(() => {
        result.current.setCurrentPath("/Photos");
      });

      expect(result.current.currentPath()).toBe("/Photos");
    });

    it("should update selected items", () => {
      const { result } = renderHook(() => useGalleryState());

      act(() => {
        result.current.setSelectedItems(["1", "2"]);
      });

      expect(result.current.selectedItems()).toEqual(["1", "2"]);
    });

    it("should toggle item selection", () => {
      const { result } = renderHook(() => useGalleryState());

      act(() => {
        result.current.toggleItemSelection("1");
      });

      expect(result.current.selectedItems()).toEqual(["1"]);

      act(() => {
        result.current.toggleItemSelection("1");
      });

      expect(result.current.selectedItems()).toEqual([]);
    });

    it("should clear selection", () => {
      const { result } = renderHook(() => useGalleryState());

      act(() => {
        result.current.setSelectedItems(["1", "2"]);
        result.current.clearSelection();
      });

      expect(result.current.selectedItems()).toEqual([]);
    });

    it("should update view mode", () => {
      const { result } = renderHook(() => useGalleryState());

      act(() => {
        result.current.setViewMode("list");
      });

      expect(result.current.viewMode()).toBe("list");
    });

    it("should update sort configuration", () => {
      const { result } = renderHook(() => useGalleryState());

      act(() => {
        result.current.setSortConfig({ by: "size", order: "desc" });
      });

      expect(result.current.sortBy()).toBe("size");
      expect(result.current.sortOrder()).toBe("desc");
    });

    it("should update filter", () => {
      const { result } = renderHook(() => useGalleryState());

      act(() => {
        result.current.setFilter("image");
      });

      expect(result.current.filter()).toBe("image");
    });

    it("should update loading state", () => {
      const { result } = renderHook(() => useGalleryState());

      act(() => {
        result.current.setLoading(true);
      });

      expect(result.current.isLoading()).toBe(true);
    });

    it("should update error state", () => {
      const { result } = renderHook(() => useGalleryState());

      act(() => {
        result.current.setError("Test error");
      });

      expect(result.current.error()).toBe("Test error");
    });
  });

  describe("Computed Values", () => {
    it("should compute filtered and sorted items", () => {
      const { result } = renderHook(() => useGalleryState());

      act(() => {
        result.current.setGalleryData(mockGalleryData);
        result.current.setFilter("image");
        result.current.setSortConfig({ by: "size", order: "desc" });
      });

      const processedItems = result.current.processedItems();
      expect(processedItems.files).toHaveLength(1);
      expect(processedItems.files[0].name).toBe("image1.jpg");
    });

    it("should compute breadcrumbs", () => {
      const { result } = renderHook(() => useGalleryState());

      act(() => {
        result.current.setCurrentPath("/Photos/Vacation");
      });

      const breadcrumbs = result.current.breadcrumbs();
      expect(breadcrumbs).toHaveLength(3);
      expect(breadcrumbs[0].label).toBe("Home");
      expect(breadcrumbs[1].label).toBe("Photos");
      expect(breadcrumbs[2].label).toBe("Vacation");
    });

    it("should compute selection count", () => {
      const { result } = renderHook(() => useGalleryState());

      act(() => {
        result.current.setSelectedItems(["1", "2"]);
      });

      expect(result.current.selectionCount()).toBe(2);
    });

    it("should compute has selection", () => {
      const { result } = renderHook(() => useGalleryState());

      expect(result.current.hasSelection()).toBe(false);

      act(() => {
        result.current.setSelectedItems(["1"]);
      });

      expect(result.current.hasSelection()).toBe(true);
    });
  });

  describe("State Persistence", () => {
    it("should persist state to localStorage when enabled", () => {
      const { result } = renderHook(() =>
        useGalleryState({ persistState: true, storageKey: "test-gallery" }),
      );

      act(() => {
        result.current.setViewMode("list");
        result.current.setSortConfig({ by: "size", order: "desc" });
      });

      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "test-gallery-viewConfig",
        JSON.stringify({ mode: "list" }),
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "test-gallery-sortConfig",
        JSON.stringify({ by: "size", order: "desc" }),
      );
    });

    it("should load persisted state on initialization", () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === "test-gallery-viewConfig") {
          return JSON.stringify({ mode: "list" });
        }
        if (key === "test-gallery-sortConfig") {
          return JSON.stringify({ by: "size", order: "desc" });
        }
        return null;
      });

      const { result } = renderHook(() =>
        useGalleryState({ persistState: true, storageKey: "test-gallery" }),
      );

      expect(result.current.viewMode()).toBe("list");
      expect(result.current.sortBy()).toBe("size");
      expect(result.current.sortOrder()).toBe("desc");
    });

    it("should handle localStorage errors gracefully", () => {
      localStorageMock.getItem.mockImplementation(() => {
        throw new Error("localStorage error");
      });

      const { result } = renderHook(() =>
        useGalleryState({ persistState: true }),
      );

      // Should fall back to default values
      expect(result.current.viewMode()).toBe("grid");
      expect(result.current.sortBy()).toBe("name");
    });

    it("should not persist state when disabled", () => {
      const { result } = renderHook(() =>
        useGalleryState({ persistState: false }),
      );

      act(() => {
        result.current.setViewMode("list");
      });

      expect(localStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe("Callbacks", () => {
    it("should call onPathChange when path changes", () => {
      const onPathChange = vi.fn();
      const callbacks = { onPathChange };

      const { result } = renderHook(() => useGalleryState({ callbacks }));

      act(() => {
        result.current.setCurrentPath("/Photos");
      });

      expect(onPathChange).toHaveBeenCalledWith("/Photos");
    });

    it("should call onSelectionChange when selection changes", () => {
      const onSelectionChange = vi.fn();
      const callbacks = { onSelectionChange };

      const { result } = renderHook(() => useGalleryState({ callbacks }));

      act(() => {
        result.current.setSelectedItems(["1", "2"]);
      });

      expect(onSelectionChange).toHaveBeenCalledWith(["1", "2"]);
    });

    it("should call onViewModeChange when view mode changes", () => {
      const onViewModeChange = vi.fn();
      const callbacks = { onViewModeChange };

      const { result } = renderHook(() => useGalleryState({ callbacks }));

      act(() => {
        result.current.setViewMode("list");
      });

      expect(onViewModeChange).toHaveBeenCalledWith("list");
    });
  });

  describe("Actions", () => {
    it("should navigate to folder", () => {
      const { result } = renderHook(() => useGalleryState());

      act(() => {
        result.current.navigateToFolder("/Photos");
      });

      expect(result.current.currentPath()).toBe("/Photos");
    });

    it("should navigate back", () => {
      const { result } = renderHook(() => useGalleryState());

      act(() => {
        result.current.setCurrentPath("/Photos/Vacation");
        result.current.navigateBack();
      });

      expect(result.current.currentPath()).toBe("/Photos");
    });

    it("should navigate to home", () => {
      const { result } = renderHook(() => useGalleryState());

      act(() => {
        result.current.setCurrentPath("/Photos/Vacation");
        result.current.navigateToHome();
      });

      expect(result.current.currentPath()).toBe("/");
    });

    it("should select all items", () => {
      const { result } = renderHook(() => useGalleryState());

      act(() => {
        result.current.setGalleryData(mockGalleryData);
        result.current.selectAll();
      });

      expect(result.current.selectedItems()).toEqual(["1", "2", "folder1"]);
    });

    it("should invert selection", () => {
      const { result } = renderHook(() => useGalleryState());

      act(() => {
        result.current.setGalleryData(mockGalleryData);
        result.current.setSelectedItems(["1"]);
        result.current.invertSelection();
      });

      expect(result.current.selectedItems()).toEqual(["2", "folder1"]);
    });
  });
});
