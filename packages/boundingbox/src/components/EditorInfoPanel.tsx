/**
 * Editor Info Panel Component
 *
 * Displays bounding box information and statistics
 */

import type { Component } from "solid-js";
import { Show, For } from "solid-js";
import type { BoundingBox, EditorConfig } from "../types";

export interface EditorInfoPanelProps {
  boundingBoxes: BoundingBox[];
  selectedBoxId: string | null;
  selectedBox: BoundingBox | null;
  onBoxSelect: (boxId: string | null) => void;
  onBoxDelete: (boxId: string) => void;
  onEditingStart: (boxId: string, operation: string) => void;
  onEditingEnd: (boxId: string, operation: string) => void;
  onEditingCancel: (boxId: string) => void;
  config: EditorConfig;
  className?: string;
}

export const EditorInfoPanel: Component<EditorInfoPanelProps> = (props) => {
  const {
    boundingBoxes,
    selectedBoxId,
    selectedBox,
    onBoxSelect,
    onBoxDelete,
    onEditingStart,
    onEditingEnd,
    onEditingCancel,
    config,
    className = "",
  } = props;

  const handleBoxClick = (boxId: string) => {
    onBoxSelect(boxId);
  };

  const handleDeleteClick = (boxId: string) => {
    onBoxDelete(boxId);
  };

  const handleEditClick = (boxId: string) => {
    onEditingStart(boxId, "edit");
  };

  return (
    <div class={`info-panel ${className}`}>
      <div class="box-count">
        Bounding Boxes ({boundingBoxes.length})
      </div>
      
      <div class="boxes-list">
        <For each={boundingBoxes}>
          {(box) => (
            <div
              class={`box-item ${selectedBoxId === box.id ? "selected" : ""}`}
              onClick={() => handleBoxClick(box.id)}
            >
              <div class="box-label">{box.label}</div>
              <div class="box-coordinates">
                ({box.x}, {box.y}) {box.width}×{box.height}
              </div>
              <div class="box-actions">
                <Show when={config.enableEditing}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditClick(box.id);
                    }}
                    aria-label={`Edit ${box.label} bounding box`}
                  >
                    Edit
                  </button>
                </Show>
                <Show when={config.enableDeletion}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(box.id);
                    }}
                    aria-label={`Delete ${box.label} bounding box`}
                  >
                    Delete
                  </button>
                </Show>
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  );
};
