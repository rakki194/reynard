/**
 * Editor Toolbar Component
 *
 * Handles toolbar UI and actions
 */

import type { Component } from "solid-js";
import { LabelSelector } from "./LabelSelector";

export interface EditorToolbarProps {
  availableLabels: string[];
  selectedLabel: string;
  onLabelChange: (label: string) => void;
  onAddLabel: (label: string) => void;
  onClearAll: () => void;
  className?: string;
}

export const EditorToolbar: Component<EditorToolbarProps> = (props) => {
  const {
    availableLabels,
    selectedLabel,
    onLabelChange,
    onAddLabel,
    onClearAll,
    className = "",
  } = props;

  return (
    <div class={`editor-toolbar ${className}`}>
      <LabelSelector
        availableLabels={availableLabels}
        selectedLabel={selectedLabel}
        onLabelChange={onLabelChange}
        onAddLabel={onAddLabel}
        className="label-selector"
      />

      <div class="toolbar-actions">
        <button class="clear-button" onClick={onClearAll}>
          Clear All
        </button>
      </div>
    </div>
  );
};
