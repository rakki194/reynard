/**
 * Editor Toolbar Component
 *
 * Handles toolbar UI and actions
 */

import type { Component } from "solid-js";
import { LabelSelector } from "./LabelSelector";
import type { EditorConfig } from "../types";

export interface EditorToolbarProps {
  config: EditorConfig;
  selectedLabelClass: string;
  onLabelClassChange: (label: string) => void;
  className?: string;
}

export const EditorToolbar: Component<EditorToolbarProps> = (props) => {
  const {
    config,
    selectedLabelClass,
    onLabelClassChange,
    className = "",
  } = props;

  return (
    <div class={`editor-toolbar ${className}`}>
      <div class="toolbar-section">
        <label for="label-selector">Label Class:</label>
        <LabelSelector
          availableLabels={
            config.labelClasses || ["person", "vehicle", "animal", "object"]
          }
          selectedLabel={selectedLabelClass}
          onLabelChange={onLabelClassChange}
          className="label-selector"
        />
      </div>
    </div>
  );
};
