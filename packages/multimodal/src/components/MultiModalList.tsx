/**
 * Multi-Modal List Component
 * 
 * Displays files in a list layout with file rows.
 */

import { Component, For } from "solid-js";
import type { MultiModalListProps } from "../types/MultiModalTypes";
import { MultiModalFileRow } from "./MultiModalFileRow";

export const MultiModalList: Component<MultiModalListProps> = (props) => {
  return (
    <div class="multi-modal-list">
      <For each={props.files}>
        {(file) => (
          <MultiModalFileRow
            file={file}
            isSelected={props.selectedFile?.id === file.id}
            onSelect={() => props.onFileSelect(file)}
            onRemove={() => props.onFileRemove(file.id)}
            showMetadata={props.showMetadata}
          />
        )}
      </For>
    </div>
  );
};
