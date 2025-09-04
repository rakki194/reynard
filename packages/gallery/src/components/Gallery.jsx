/**
 * Gallery Component
 * Complete file gallery with navigation, upload, and management features
 */
import { Show, For, createSignal, createEffect, splitProps } from "solid-js";
import { Button } from "@reynard/components";
import { GalleryGrid } from "./GalleryGrid";
import { BreadcrumbNavigation } from "./BreadcrumbNavigation";
import { FileUploadZone } from "./FileUploadZone";
import { useGalleryState } from "../composables/useGalleryState";
import { useFileUpload } from "../composables/useFileUpload";
import "./Gallery.css";
import {
  DEFAULT_VIEW_CONFIG,
  DEFAULT_SORT_CONFIG,
  DEFAULT_FILTER_CONFIG,
  DEFAULT_UPLOAD_CONFIG,
} from "../types";
const defaultProps = {
  view: DEFAULT_VIEW_CONFIG,
  sort: DEFAULT_SORT_CONFIG,
  filter: DEFAULT_FILTER_CONFIG,
  upload: DEFAULT_UPLOAD_CONFIG,
  showUpload: true,
  showBreadcrumbs: true,
  showToolbar: true,
  enableKeyboardShortcuts: true,
  enableDragAndDrop: true,
  enableVirtualScrolling: false,
};
export const Gallery = (props) => {
  const merged = { ...defaultProps, ...props };
  const [local, others] = splitProps(merged, [
    "data",
    "loading",
    "error",
    "callbacks",
    "showUpload",
    "showBreadcrumbs",
    "showToolbar",
    "class",
    "view",
    "sort",
    "filter",
    "upload",
    "enableKeyboardShortcuts",
    "enableDragAndDrop",
    "contextMenuActions",
  ]);
  // State management
  const galleryState = useGalleryState({
    initialConfig: {
      view: DEFAULT_VIEW_CONFIG,
      sort: DEFAULT_SORT_CONFIG,
      filter: DEFAULT_FILTER_CONFIG,
      upload: DEFAULT_UPLOAD_CONFIG,
      enableKeyboardShortcuts: true,
      enableDragAndDrop: true,
      contextMenuActions: [],
    },
    callbacks: undefined,
    persistState: true,
    storageKey: "reynard-gallery",
  });
  // File upload - use default config initially
  const fileUpload = useFileUpload({
    config: DEFAULT_UPLOAD_CONFIG,
    callbacks: {
      onUploadStart: (files) => {
        local.callbacks?.onUploadStart?.(files);
      },
      onUploadProgress: (progress) => {
        local.callbacks?.onUploadProgress?.(progress);
      },
      onUploadComplete: (results) => {
        local.callbacks?.onUploadComplete?.(results);
        // Refresh gallery after upload
        galleryState.refreshData();
      },
      onError: (error, details) => {
        local.callbacks?.onError?.(error, details);
      },
    },
    currentPath: galleryState.currentPath(),
  });
  // UI state
  const [showUploadZone, setShowUploadZone] = createSignal(false);
  const [contextMenu, setContextMenu] = createSignal(null);
  let contextMenuRef;
  // Update gallery data when props change
  createEffect(() => {
    if (local.data) {
      galleryState.updateData(local.data);
    }
  });
  // Update loading and error states
  createEffect(() => {
    galleryState.setLoadingState(local.loading || false);
  });
  createEffect(() => {
    galleryState.setErrorState(local.error || null);
  });
  // Update configuration when props change
  createEffect(() => {
    if (local.view) {
      galleryState.updateViewConfig(local.view);
    }
  });
  createEffect(() => {
    if (local.sort) {
      galleryState.updateSortConfig(local.sort);
    }
  });
  createEffect(() => {
    if (local.filter) {
      galleryState.updateFilterConfig(local.filter);
    }
  });
  // Handle upload callbacks when they change
  createEffect(() => {
    // Since useFileUpload doesn't support dynamic callback updates,
    // we handle the callbacks through our own logic
    if (local.callbacks?.onUploadComplete) {
      // The upload complete callback will be called from our wrapper
    }
  });
  // Set context menu position when it's shown
  createEffect(() => {
    const menu = contextMenu();
    if (menu && contextMenuRef) {
      contextMenuRef.style.left = `${menu.x}px`;
      contextMenuRef.style.top = `${menu.y}px`;
    }
  });
  // Handle item selection
  const handleSelectionChange = (item, mode) => {
    galleryState.selectItem(item, mode);
  };
  // Handle item opening
  const handleItemOpen = (item) => {
    if (item.type === "folder") {
      galleryState.navigateToItem(item);
    } else {
      local.callbacks?.onItemOpen?.(item);
    }
  };
  // Handle context menu
  const handleContextMenu = (item, x, y) => {
    setContextMenu({ x, y, item });
  };
  // Close context menu
  const closeContextMenu = () => {
    setContextMenu(null);
  };
  // Handle upload zone toggle
  const toggleUploadZone = () => {
    setShowUploadZone(!showUploadZone());
  };
  // Render toolbar
  const renderToolbar = () => {
    if (!local.showToolbar) return null;
    return (
      <div class="gallery__toolbar">
        <div class="gallery__toolbar-section">
          <Show when={local.showUpload}>
            <Button
              variant="primary"
              onClick={toggleUploadZone}
              disabled={fileUpload.isUploading()}
            >
              <span class="icon">upload</span>
              Upload Files
            </Button>
          </Show>

          <Button
            variant="ghost"
            onClick={galleryState.refreshData}
            disabled={galleryState.loading()}
          >
            <span class="icon">refresh</span>
            Refresh
          </Button>
        </div>

        <div class="gallery__toolbar-section">
          <div class="gallery__view-controls">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => galleryState.updateViewConfig({ layout: "grid" })}
              aria-pressed={galleryState.viewConfig().layout === "grid"}
            >
              <span class="icon">grid</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => galleryState.updateViewConfig({ layout: "list" })}
              aria-pressed={galleryState.viewConfig().layout === "list"}
            >
              <span class="icon">list</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                galleryState.updateViewConfig({ layout: "masonry" })
              }
              aria-pressed={galleryState.viewConfig().layout === "masonry"}
            >
              <span class="icon">masonry</span>
            </Button>
          </div>

          <div class="gallery__sort-controls">
            <select
              value={galleryState.sortConfig().field}
              onChange={(e) =>
                galleryState.updateSortConfig({
                  field: e.target.value,
                })
              }
              aria-label="Sort by"
            >
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="lastModified">Date</option>
              <option value="type">Type</option>
            </select>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                galleryState.updateSortConfig({
                  direction:
                    galleryState.sortConfig().direction === "asc"
                      ? "desc"
                      : "asc",
                })
              }
            >
              <span
                class={`icon ${galleryState.sortConfig().direction === "asc" ? "arrow-up" : "arrow-down"}`}
              />
            </Button>
          </div>
        </div>
      </div>
    );
  };
  // Render upload zone
  const renderUploadZone = () => {
    if (!showUploadZone() && !fileUpload.isUploading()) return null;
    return (
      <div class="gallery__upload-zone">
        <FileUploadZone
          config={local.upload || DEFAULT_UPLOAD_CONFIG}
          uploads={fileUpload.uploads()}
          uploading={fileUpload.isUploading()}
          enableDragDrop={local.enableDragAndDrop}
          onUpload={fileUpload.uploadFiles}
          onCancelUpload={fileUpload.cancelUpload}
        />

        <Show when={showUploadZone() && !fileUpload.isUploading()}>
          <div class="gallery__upload-zone-actions">
            <Button variant="ghost" onClick={() => setShowUploadZone(false)}>
              Close
            </Button>
          </div>
        </Show>
      </div>
    );
  };
  // Render context menu
  const renderContextMenu = () => {
    const menu = contextMenu();
    if (!menu) return null;
    const actions = local.contextMenuActions || [];
    return (
      <div
        ref={contextMenuRef}
        class="gallery__context-menu"
        onClick={(e) => e.stopPropagation()}
      >
        <div class="gallery__context-menu-content">
          <button
            type="button"
            class="gallery__context-menu-item"
            onClick={() => {
              galleryState.toggleFavorite(menu.item);
              closeContextMenu();
            }}
          >
            <span class="icon">
              {menu.item.favorited ? "star-filled" : "star"}
            </span>
            {menu.item.favorited ? "Remove from favorites" : "Add to favorites"}
          </button>

          <Show when={actions.length > 0}>
            <div class="gallery__context-menu-separator" />
            <For each={actions}>
              {(action) => (
                <button
                  type="button"
                  class={`gallery__context-menu-item ${action.destructive ? "gallery__context-menu-item--destructive" : ""}`}
                  disabled={action.disabled}
                  onClick={() => {
                    action.handler([menu.item]);
                    closeContextMenu();
                  }}
                >
                  <Show when={action.icon}>
                    <span class="icon">{action.icon}</span>
                  </Show>
                  {action.label}
                  <Show when={action.shortcut}>
                    <span class="gallery__context-menu-shortcut">
                      {action.shortcut}
                    </span>
                  </Show>
                </button>
              )}
            </For>
          </Show>
        </div>
      </div>
    );
  };
  // Close context menu on outside click
  const handleOutsideClick = () => {
    if (contextMenu()) {
      closeContextMenu();
    }
  };
  return (
    <div
      class={`gallery ${local.class || ""}`}
      onClick={handleOutsideClick}
      {...others}
    >
      <Show when={local.showBreadcrumbs}>
        <BreadcrumbNavigation
          breadcrumbs={galleryState.breadcrumbs()}
          onNavigate={galleryState.navigateToPath}
          showUpButton={true}
        />
      </Show>

      {renderToolbar()}
      {renderUploadZone()}

      <Show when={galleryState.error()}>
        <div class="gallery__error">
          <span class="icon">alert-circle</span>
          <span>{galleryState.error()}</span>
          <Button variant="ghost" onClick={galleryState.refreshData}>
            Retry
          </Button>
        </div>
      </Show>

      <div class="gallery__content">
        <GalleryGrid
          items={galleryState.items()}
          viewConfig={galleryState.viewConfig()}
          selectionState={galleryState.selectionState()}
          loading={galleryState.loading()}
          emptyMessage="No files or folders found"
          onItemClick={handleItemOpen}
          onItemDoubleClick={local.callbacks?.onItemDoubleClick}
          onSelectionChange={handleSelectionChange}
          onContextMenu={handleContextMenu}
        />
      </div>

      <Show when={galleryState.selectionState().selectedIds.size > 0}>
        <div class="gallery__selection-info">
          <span>
            {galleryState.selectionState().selectedIds.size} item(s) selected
          </span>
          <Button variant="ghost" onClick={galleryState.clearSelection}>
            Clear Selection
          </Button>
        </div>
      </Show>

      {renderContextMenu()}
    </div>
  );
};
