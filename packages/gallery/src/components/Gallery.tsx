/**
 * Gallery Component
 * Complete file gallery with navigation, upload, and management features
 */

import { 
  Component, 
  Show, 
  createSignal, 
  createEffect,
  splitProps
} from "solid-js";
import { Button } from "@reynard/components";
import { GalleryGrid } from "./GalleryGrid";
import { BreadcrumbNavigation } from "./BreadcrumbNavigation";
import { FileUploadZone } from "./FileUploadZone";
import { useGalleryState } from "../composables/useGalleryState";
import { useFileUpload } from "../composables/useFileUpload";
import type {
  GalleryData,
  GalleryConfiguration,
  GalleryCallbacks,
  FileItem,
  FolderItem,
} from "../types";
import {
  DEFAULT_VIEW_CONFIG,
  DEFAULT_SORT_CONFIG,
  DEFAULT_FILTER_CONFIG,
  DEFAULT_UPLOAD_CONFIG,
} from "../types";

export interface GalleryProps extends Partial<GalleryConfiguration> {
  /** Gallery data */
  data?: GalleryData;
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: string;
  /** Gallery callbacks */
  callbacks?: GalleryCallbacks;
  /** Whether to show upload zone */
  showUpload?: boolean;
  /** Whether to show breadcrumb navigation */
  showBreadcrumbs?: boolean;
  /** Whether to show toolbar */
  showToolbar?: boolean;
  /** Custom class name */
  class?: string;
}

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

export const Gallery: Component<GalleryProps> = (props) => {
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
      view: local.view,
      sort: local.sort,
      filter: local.filter,
      upload: local.upload,
      enableKeyboardShortcuts: local.enableKeyboardShortcuts,
      enableDragAndDrop: local.enableDragAndDrop,
      contextMenuActions: local.contextMenuActions,
    },
    callbacks: local.callbacks,
    persistState: true,
    storageKey: "reynard-gallery",
  });

  // File upload
  const fileUpload = useFileUpload({
    config: local.upload || DEFAULT_UPLOAD_CONFIG,
    callbacks: {
      onUploadStart: local.callbacks?.onUploadStart,
      onUploadProgress: local.callbacks?.onUploadProgress,
      onUploadComplete: (results) => {
        local.callbacks?.onUploadComplete?.(results);
        // Refresh gallery after upload
        galleryState.refreshData();
      },
      onError: local.callbacks?.onError,
    },
    currentPath: galleryState.currentPath(),
  });

  // UI state
  const [showUploadZone, setShowUploadZone] = createSignal(false);
  const [contextMenu, setContextMenu] = createSignal<{
    x: number;
    y: number;
    item: FileItem | FolderItem;
  } | null>(null);

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

  // Handle item selection
  const handleSelectionChange = (
    item: FileItem | FolderItem,
    mode: "single" | "add" | "range"
  ): void => {
    galleryState.selectItem(item, mode);
  };

  // Handle item opening
  const handleItemOpen = (item: FileItem | FolderItem): void => {
    if (item.type === "folder") {
      galleryState.navigateToItem(item);
    } else {
      local.callbacks?.onItemOpen?.(item);
    }
  };

  // Handle context menu
  const handleContextMenu = (
    item: FileItem | FolderItem,
    x: number,
    y: number
  ): void => {
    setContextMenu({ x, y, item });
  };

  // Close context menu
  const closeContextMenu = (): void => {
    setContextMenu(null);
  };

  // Handle upload zone toggle
  const toggleUploadZone = (): void => {
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
              onClick={() => galleryState.updateViewConfig({ layout: "masonry" })}
              aria-pressed={galleryState.viewConfig().layout === "masonry"}
            >
              <span class="icon">masonry</span>
            </Button>
          </div>

          <div class="gallery__sort-controls">
            <select 
              value={galleryState.sortConfig().field}
              onChange={(e) => galleryState.updateSortConfig({ 
                field: e.target.value as any 
              })}
            >
              <option value="name">Name</option>
              <option value="size">Size</option>
              <option value="lastModified">Date</option>
              <option value="type">Type</option>
            </select>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => galleryState.updateSortConfig({
                direction: galleryState.sortConfig().direction === "asc" ? "desc" : "asc"
              })}
            >
              <span class={`icon ${galleryState.sortConfig().direction === "asc" ? "arrow-up" : "arrow-down"}`} />
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
        class="gallery__context-menu"
        style={{ 
          left: `${menu.x}px`, 
          top: `${menu.y}px`,
          position: "fixed",
          "z-index": 1000,
        }}
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
            {actions.map(action => (
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
            ))}
          </Show>
        </div>
      </div>
    );
  };

  // Close context menu on outside click
  const handleOutsideClick = (event: MouseEvent): void => {
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
