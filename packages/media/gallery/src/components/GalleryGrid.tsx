/**
 * Gallery Grid Component
 * Responsive grid layout for displaying files and folders
 */

import { Component, For, Show, createSignal, createMemo, onMount, onCleanup } from "solid-js";
import { createResizeObserver } from "@solid-primitives/resize-observer";
import type { FileItem, FolderItem, ViewConfiguration, SelectionState, GalleryCallbacks } from "../types";
import { calculateGridDimensions, formatFileSize, formatDate, getFileIcon } from "../utils";

export interface GalleryGridProps {
  /** Items to display */
  items: (FileItem | FolderItem)[];
  /** View configuration */
  viewConfig: ViewConfiguration;
  /** Selection state */
  selectionState: SelectionState;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Callbacks */
  onItemClick?: GalleryCallbacks["onItemOpen"];
  onItemDoubleClick?: GalleryCallbacks["onItemDoubleClick"];
  onSelectionChange?: (item: FileItem | FolderItem, mode: "single" | "add" | "range") => void;
  onContextMenu?: (item: FileItem | FolderItem, x: number, y: number) => void;
  /** Custom class name */
  class?: string;
}

export const GalleryGrid: Component<GalleryGridProps> = props => {
  let containerRef: HTMLDivElement | undefined;
  const [containerSize, setContainerSize] = createSignal({
    width: 0,
    height: 0,
  });
  const [hoveredItem, setHoveredItem] = createSignal<string | null>(null);

  // Set up resize observer
  createResizeObserver(
    () => containerRef,
    entries => {
      if (entries && Array.isArray(entries) && entries.length > 0) {
        const entry = entries[0];
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    }
  );

  // Calculate grid dimensions
  const gridDimensions = createMemo(() => {
    const { width } = containerSize();
    if (width === 0) return { itemWidth: 200, itemHeight: 200, columns: 1 };

    return calculateGridDimensions(width, props.viewConfig.itemSize, props.viewConfig.itemsPerRow);
  });

  // Handle item selection
  const handleItemClick = (event: MouseEvent, item: FileItem | FolderItem): void => {
    event.preventDefault();

    if (props.selectionState.mode === "none") {
      props.onItemClick?.(item);
      return;
    }

    const mode = event.ctrlKey || event.metaKey ? "add" : event.shiftKey ? "range" : "single";

    props.onSelectionChange?.(item, mode);

    if (mode === "single" && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
      // Single click without modifiers also opens the item
      setTimeout(() => props.onItemClick?.(item), 0);
    }
  };

  // Handle double click
  const handleItemDoubleClick = (event: MouseEvent, item: FileItem | FolderItem): void => {
    event.preventDefault();
    props.onItemDoubleClick?.(item);
  };

  // Handle context menu
  const handleContextMenu = (event: MouseEvent, item: FileItem | FolderItem): void => {
    event.preventDefault();
    props.onContextMenu?.(item, event.clientX, event.clientY);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: KeyboardEvent): void => {
    if (!containerRef?.contains(document.activeElement)) return;

    if (props.items.length === 0) return;

    const currentIndex = props.items.findIndex(item => item.id === props.selectionState.lastSelectedId);

    let newIndex = currentIndex;

    switch (event.key) {
      case "ArrowRight":
        newIndex = Math.min(currentIndex + 1, props.items.length - 1);
        break;
      case "ArrowLeft":
        newIndex = Math.max(currentIndex - 1, 0);
        break;
      case "ArrowDown": {
        const { columns } = gridDimensions();
        newIndex = Math.min(currentIndex + columns, props.items.length - 1);
        break;
      }
      case "ArrowUp": {
        const cols = gridDimensions().columns;
        newIndex = Math.max(currentIndex - cols, 0);
        break;
      }
      case "Enter":
      case " ":
        if (currentIndex >= 0) {
          props.onItemClick?.(props.items[currentIndex]);
        }
        return;
      case "Escape":
        props.onSelectionChange?.(props.items[0], "single");
        return;
      default:
        return;
    }

    if (newIndex !== currentIndex && newIndex >= 0) {
      event.preventDefault();
      const mode = event.shiftKey ? "range" : "single";
      props.onSelectionChange?.(props.items[newIndex], mode);
    }
  };

  // Set up keyboard event listeners
  onMount(() => {
    document.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    document.removeEventListener("keydown", handleKeyDown);
  });

  // Get item classes
  const getItemClasses = (item: FileItem | FolderItem): string => {
    const classes = ["gallery-item"];

    if (props.selectionState.selectedIds.has(item.id)) {
      classes.push("gallery-item--selected");
    }

    if (hoveredItem() === item.id) {
      classes.push("gallery-item--hovered");
    }

    classes.push(`gallery-item--${item.type}`);

    return classes.join(" ");
  };

  // Render thumbnail
  const renderThumbnail = (item: FileItem | FolderItem) => {
    if (!props.viewConfig.showThumbnails) {
      return (
        <div class="gallery-item__icon">
          <span class="icon">{getFileIcon(item)}</span>
        </div>
      );
    }

    if (item.type === "folder") {
      return (
        <div class="gallery-item__icon gallery-item__icon--folder">
          <span class="icon">folder</span>
        </div>
      );
    }

    const fileItem = item as FileItem;

    if (fileItem.thumbnailUrl) {
      return (
        <div class="gallery-item__thumbnail">
          <img
            src={fileItem.thumbnailUrl}
            alt={item.name}
            loading="lazy"
            onError={e => {
              // Fallback to icon on image error
              const target = e.target as HTMLElement;
              target.style.display = "none";
              const iconEl = target.nextElementSibling as HTMLElement;
              if (iconEl) iconEl.style.display = "flex";
            }}
          />
          <div class="gallery-item__icon gallery-item__icon--fallback gallery-item__icon--hidden">
            <span class="icon">{getFileIcon(item)}</span>
          </div>
        </div>
      );
    }

    return (
      <div class="gallery-item__icon">
        <span class="icon">{getFileIcon(item)}</span>
      </div>
    );
  };

  // Render item metadata
  const renderMetadata = (item: FileItem | FolderItem) => {
    if (!props.viewConfig.showMetadata) return null;

    return (
      <div class="gallery-item__metadata">
        <Show when={props.viewConfig.showFileSizes && item.type !== "folder"}>
          <span class="gallery-item__size">{formatFileSize((item as FileItem).size)}</span>
        </Show>
        <span class="gallery-item__date">{formatDate(item.lastModified, "relative")}</span>
        <Show when={item.type !== "folder" && (item as FileItem).metadata?.duration}>
          <span class="gallery-item__duration">{(item as FileItem).metadata?.duration}s</span>
        </Show>
      </div>
    );
  };

  return (
    <div
      ref={containerRef}
      class={`gallery-grid gallery-grid--${props.viewConfig.layout} ${props.class || ""}`}
      tabIndex={0}
      aria-label="File gallery"
    >
      <Show when={props.loading}>
        <div class="gallery-grid__loading">
          <div class="spinner" />
          <span>Loading...</span>
        </div>
      </Show>

      <Show when={!props.loading && props.items.length === 0}>
        <div class="gallery-grid__empty">
          <div class="gallery-grid__empty-icon">
            <span class="icon">folder-open</span>
          </div>
          <span class="gallery-grid__empty-message">{props.emptyMessage || "No items found"}</span>
        </div>
      </Show>

      <Show when={!props.loading && props.items.length > 0}>
        <div
          class={`gallery-grid__container gallery-grid__container--${props.viewConfig.layout}`}
          data-columns={gridDimensions().columns}
          role="list"
          aria-label="File gallery items"
        >
          <For each={props.items}>
            {item => (
              <div
                class={`${getItemClasses(item)} gallery-item--${props.viewConfig.layout}`}
                role="listitem"
                tabIndex={-1}
                data-item-width={gridDimensions().itemWidth}
                data-item-height={gridDimensions().itemHeight}
                data-item-type={item.type}
                data-item-id={item.id}
                onClick={e => handleItemClick(e, item)}
                onDblClick={e => handleItemDoubleClick(e, item)}
                onContextMenu={e => handleContextMenu(e, item)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                {renderThumbnail(item)}

                <Show when={props.viewConfig.showFileNames}>
                  <div class="gallery-item__name" title={item.name}>
                    {item.name}
                  </div>
                </Show>

                {renderMetadata(item)}

                <Show when={item.favorited}>
                  <div class="gallery-item__favorite">
                    <span class="icon">star</span>
                  </div>
                </Show>

                <Show when={props.selectionState.selectedIds.has(item.id)}>
                  <div class="gallery-item__selection">
                    <span class="icon">check</span>
                  </div>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
