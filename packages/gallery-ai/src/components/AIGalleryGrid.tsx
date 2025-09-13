/**
 * AI-Enhanced Gallery Grid Component
 *
 * Enhanced gallery grid with AI-powered features including generation indicators,
 * batch selection controls, and AI context menu integration.
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import { Component, Show, For, createSignal } from "solid-js";
import { Button } from "reynard-components";
import { useAIGalleryContext } from "../composables/useGalleryAI";
import { AIContextMenu } from "./AIContextMenu";
import { BatchProcessingDialog } from "./BatchProcessingDialog";
import { createAIContextMenuActions } from "../utils/contextMenuActions";
import type {
  AIGalleryGridProps,
  FileItem,
  FolderItem,
  AIContextMenuAction,
} from "../types";

export const AIGalleryGrid: Component<AIGalleryGridProps> = (props) => {
  const ai = useAIGalleryContext();
  const [contextMenu, setContextMenu] = createSignal<{
    visible: boolean;
    position: { x: number; y: number };
    item: FileItem | FolderItem;
    actions: AIContextMenuAction[];
  } | null>(null);
  const [batchDialog, setBatchDialog] = createSignal(false);
  const [selectedItems, setSelectedItems] = createSignal<
    (FileItem | FolderItem)[]
  >([]);

  // Handle item click
  const handleItemClick = (item: FileItem | FolderItem) => {
    props.onItemClick?.(item);
  };

  // Handle item double click
  const handleItemDoubleClick = (item: FileItem | FolderItem) => {
    props.onItemDoubleClick?.(item);
  };

  // Selection change handling will be implemented when GalleryGrid is integrated

  // Handle context menu
  const handleContextMenu = (
    item: FileItem | FolderItem,
    x: number,
    y: number,
  ) => {
    props.onContextMenu?.(item, x, y);

    // Create AI context menu actions
    const actions = createAIContextMenuActions(item, selectedItems(), {
      availableGenerators: ai.getAvailableGenerators(),
      defaultGenerator: ai.aiState().selectedGenerator,
      aiEnabled: ai.aiState().aiEnabled,
      enableBatchOperations: true,
      enableSmartFeatures: true,
    });

    setContextMenu({
      visible: true,
      position: { x, y },
      item,
      actions,
    });
  };

  // Handle context menu action
  const handleContextMenuAction = (action: AIContextMenuAction) => {
    // Handle batch operations
    if (
      action.aiActionType === "batch_annotate" &&
      selectedItems().length > 1
    ) {
      setBatchDialog(true);
    }

    // Close context menu
    setContextMenu(null);
  };

  // Handle context menu close
  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  // Handle batch dialog close
  const handleBatchDialogClose = () => {
    setBatchDialog(false);
  };

  // Handle batch processing complete
  const handleBatchComplete = (results: any[]) => {
    console.log("Batch processing completed:", results);
    setBatchDialog(false);
  };

  // Handle batch processing error
  const handleBatchError = (error: string) => {
    console.error("Batch processing failed:", error);
  };

  // Check if item has AI indicators
  const hasAIIndicators = (item: FileItem | FolderItem): boolean => {
    if (item.type === "folder") return false;
    // Check if item has captions or AI metadata
    return (
      !!(item as FileItem).metadata?.hasCaption ||
      !!(item as FileItem).metadata?.aiProcessed
    );
  };

  // Get AI indicator type
  const getAIIndicatorType = (item: FileItem | FolderItem): string => {
    if (item.type === "folder") return "";

    const fileItem = item as FileItem;
    if (fileItem.metadata?.hasCaption) return "caption";
    if (fileItem.metadata?.aiProcessed) return "processed";
    return "";
  };

  return (
    <div class="ai-gallery-grid">
      {/* AI Batch Controls */}
      <Show
        when={props.aiProps?.showBatchControls && selectedItems().length > 1}
      >
        <div class="ai-gallery-grid__batch-controls">
          <div class="ai-gallery-grid__batch-info">
            <span class="ai-gallery-grid__batch-count">
              {selectedItems().length} items selected
            </span>
          </div>
          <div class="ai-gallery-grid__batch-actions">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setBatchDialog(true)}
              disabled={!ai.aiState().aiEnabled}
              class="ai-gallery-grid__batch-btn"
            >
              Batch Annotate
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedItems([])}
              class="ai-gallery-grid__clear-btn"
            >
              Clear Selection
            </Button>
          </div>
        </div>
      </Show>

      {/* AI Progress Indicator */}
      <Show when={ai.aiState().batchProgress}>
        <div class="ai-gallery-grid__progress">
          <div class="ai-gallery-grid__progress-bar">
            <div
              class="ai-gallery-grid__progress-fill"
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              style={`--progress-width: ${ai.aiState().batchProgress?.percentage || 0}%`}
            />
          </div>
          <span class="ai-gallery-grid__progress-text">
            {ai.aiState().batchProgress?.completed || 0} /{" "}
            {ai.aiState().batchProgress?.total || 0}
          </span>
        </div>
      </Show>

      {/* Gallery Grid Items */}
      <div class="ai-gallery-grid__items">
        <For each={props.items}>
          {(item) => (
            <div
              class={`ai-gallery-grid__item ${
                selectedItems().some((selected) => selected.id === item.id)
                  ? "ai-gallery-grid__item--selected"
                  : ""
              }`}
              onClick={() => handleItemClick(item)}
              onDblClick={() => handleItemDoubleClick(item)}
              onContextMenu={(e) => {
                e.preventDefault();
                handleContextMenu(item, e.clientX, e.clientY);
              }}
            >
              {/* Item Content */}
              <div class="ai-gallery-grid__item-content">
                <Show when={item.type === "folder"}>
                  <div class="ai-gallery-grid__folder-icon">📁</div>
                </Show>
                <Show when={item.type !== "folder"}>
                  <div class="ai-gallery-grid__file-icon">📄</div>
                </Show>
                <span class="ai-gallery-grid__item-name">{item.name}</span>
              </div>

              {/* AI Indicators */}
              <Show
                when={props.aiProps?.showAIIndicators && hasAIIndicators(item)}
              >
                <div
                  class={`ai-gallery-grid__ai-indicator ai-gallery-grid__ai-indicator--${getAIIndicatorType(item)}`}
                >
                  <span class="ai-gallery-grid__ai-icon">🤖</span>
                </div>
              </Show>

              {/* Selection Indicator */}
              <Show
                when={selectedItems().some(
                  (selected) => selected.id === item.id,
                )}
              >
                <div class="ai-gallery-grid__selection-indicator">
                  <span class="ai-gallery-grid__selection-icon">✓</span>
                </div>
              </Show>
            </div>
          )}
        </For>
      </div>

      {/* Empty State */}
      <Show when={props.items.length === 0 && !props.loading}>
        <div class="ai-gallery-grid__empty">
          <div class="ai-gallery-grid__empty-icon">📁</div>
          <p class="ai-gallery-grid__empty-text">
            {props.emptyMessage || "No items found"}
          </p>
        </div>
      </Show>

      {/* Loading State */}
      <Show when={props.loading}>
        <div class="ai-gallery-grid__loading">
          <div class="ai-gallery-grid__spinner">
            <div class="ai-gallery-grid__spinner-inner" />
          </div>
          <span class="ai-gallery-grid__loading-text">Loading...</span>
        </div>
      </Show>

      {/* AI Context Menu */}
      <Show when={contextMenu()}>
        <AIContextMenu
          visible={contextMenu()!.visible}
          position={contextMenu()!.position}
          item={contextMenu()!.item}
          selectedItems={selectedItems()}
          actions={contextMenu()!.actions}
          onClose={handleContextMenuClose}
          onActionClick={handleContextMenuAction}
        />
      </Show>

      {/* Batch Processing Dialog */}
      <BatchProcessingDialog
        visible={batchDialog()}
        items={
          selectedItems().filter((item) => item.type !== "folder") as FileItem[]
        }
        availableGenerators={ai.getAvailableGenerators()}
        onClose={handleBatchDialogClose}
        onComplete={handleBatchComplete}
        onError={handleBatchError}
      />
    </div>
  );
};
