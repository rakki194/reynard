/**
 * AI Gallery Tab Component
 *
 * Handles the AI Gallery tab functionality with smart image grid and batch processing.
 */

import { Component, createSignal } from "solid-js";
import { Button } from "reynard-components";
import {
  AIGalleryGrid,
  type FileItem,
  type FolderItem,
} from "reynard-gallery-ai";
import { useNotifications } from "reynard-core";
import type { UseAppStateReturn } from "../composables/useAppState";
import type { UseWorkflowReturn } from "../composables/useWorkflow";
import type { ImageItem } from "../types";

interface AIGalleryTabProps {
  appState: UseAppStateReturn;
  workflow: UseWorkflowReturn;
  onBatchProcess: () => void;
  selectedItems: FileItem[];
  onSelectionChange: (
    item: FileItem | FolderItem,
    mode: "single" | "add" | "range",
  ) => void;
  onItemClick: (item: FileItem | FolderItem) => void;
  onItemDoubleClick: (item: FileItem | FolderItem) => void;
  onContextMenu: (item: FileItem | FolderItem, x: number, y: number) => void;
}

// Convert ImageItem to FileItem for AI Gallery
const convertToFileItem = (image: ImageItem): FileItem => ({
  id: image.id,
  name: image.name,
  path: image.url,
  type: "image/jpeg",
  size: 0,
  modified: new Date(),
  metadata: {
    hasCaption: !!image.caption,
    aiProcessed: !!image.generatedAt,
    caption: image.caption,
    tags: image.tags || [],
    model: image.model,
    generatedAt: image.generatedAt,
  },
});

export const AIGalleryTab: Component<AIGalleryTabProps> = (props) => {
  const { notify } = useNotifications();

  // Convert images to file items
  const fileItems = () => props.appState.images().map(convertToFileItem);

  return (
    <div class="ai-gallery-section">
      <div class="gallery-controls">
        <div class="control-group">
          <label>AI Model:</label>
          <select
            value={props.appState.selectedModel()}
            onChange={(e) =>
              props.appState.setSelectedModel(e.currentTarget.value)
            }
            disabled={props.appState.isGenerating()}
            title="Select AI model for caption generation"
          >
            <option value="jtp2">JTP2 (Furry Tags)</option>
            <option value="joycaption">JoyCaption (Detailed Captions)</option>
            <option value="florence2">Florence2 (General Purpose)</option>
            <option value="wdv3">WDv3 (Anime Tags)</option>
          </select>
        </div>

        <div class="control-group">
          <Button
            onClick={props.onBatchProcess}
            disabled={
              props.selectedItems.length === 0 || props.appState.isGenerating()
            }
            variant="primary"
          >
            🤖 Batch Process ({props.selectedItems.length})
          </Button>
        </div>
      </div>

      <AIGalleryGrid
        items={fileItems()}
        viewConfig={{
          viewMode: "grid",
          showThumbnails: true,
          thumbnailSize: "medium",
          showMetadata: true,
        }}
        selectionState={{
          selectedItems: props.selectedItems,
          multiSelect: true,
        }}
        loading={false}
        aiProps={{
          showAIIndicators: true,
          showBatchControls: true,
          availableGenerators: ["jtp2", "wdv3", "joy", "florence2"],
        }}
        onItemClick={props.onItemClick}
        onItemDoubleClick={props.onItemDoubleClick}
        onContextMenu={props.onContextMenu}
        onSelectionChange={props.onSelectionChange}
      />
    </div>
  );
};
