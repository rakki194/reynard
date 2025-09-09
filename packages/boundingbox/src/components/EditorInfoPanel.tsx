/**
 * Editor Info Panel Component
 *
 * Displays bounding box information and statistics
 */

import type { Component } from "solid-js";
import { Show } from "solid-js";
import type { BoundingBox } from "../types";

export interface EditorInfoPanelProps {
  boxes: BoundingBox[];
  selectedBox: BoundingBox | null;
  className?: string;
}

export const EditorInfoPanel: Component<EditorInfoPanelProps> = (props) => {
  const { boxes, selectedBox, className = "" } = props;

  return (
    <div class={`info-panel ${className}`}>
      <div class="box-count">Boxes: {boxes.length}</div>
      <div class="selected-box">
        <Show when={selectedBox}>Selected: {selectedBox?.label}</Show>
      </div>
    </div>
  );
};
