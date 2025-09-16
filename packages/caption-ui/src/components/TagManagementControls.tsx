/**
 * Tag Management Controls Component
 *
 * Selection controls and bulk operation buttons for tag management.
 * Displays selection info and provides action buttons.
 */

import { Component, Show } from "solid-js";

export interface TagManagementControlsProps {
  /** Whether to show selection controls */
  showSelection: boolean;
  /** Whether there are selected tags */
  hasSelection: boolean;
  /** Number of selected tags */
  selectedCount: number;
  /** Callback for bulk delete */
  onBulkDelete: () => void;
  /** Callback for clearing selection */
  onClearSelection: () => void;
}

export const TagManagementControls: Component<TagManagementControlsProps> = props => {
  return (
    <Show when={props.showSelection && props.hasSelection}>
      <div class="selection-controls">
        <div class="selection-info">
          {props.selectedCount} tag{props.selectedCount !== 1 ? "s" : ""} selected
        </div>
        <div class="selection-actions">
          <button
            type="button"
            class="bulk-delete-button"
            onClick={props.onBulkDelete}
            title="Delete selected tags (Delete key)"
          >
            Delete Selected
          </button>
          <button
            type="button"
            class="clear-selection-button"
            onClick={props.onClearSelection}
            title="Clear selection (Escape key)"
          >
            Clear Selection
          </button>
        </div>
      </div>
    </Show>
  );
};
