/**
 * FileItem Component
 * Individual file item with progress and controls
 */

import { Component, Show } from "solid-js";
import { Button } from "reynard-primitives";
import type { FileUploadItem } from "../types";
import { formatFileSize } from "../utils/file-utils";

export interface FileItemProps {
  item: FileUploadItem;
  showProgress: boolean;
  removeFile: (id: string) => void;
}

export const FileItem: Component<FileItemProps> = props => {
  return (
    <div class={`reynard-file-upload__file-item reynard-file-upload__file-item--${props.item.status}`}>
      <div class="reynard-file-upload__file-info">
        <div class="reynard-file-upload__file-name">{props.item.file.name}</div>
        <div class="reynard-file-upload__file-details">
          <span class="reynard-file-upload__file-size">{formatFileSize(props.item.file.size)}</span>
        </div>
      </div>
      <Show when={props.showProgress && props.item.status === "uploading"}>
        <div class="reynard-file-upload__progress-container">
          <div class="reynard-file-upload__progress-bar">
            <div
              class={`reynard-file-upload__progress-fill reynard-file-upload__progress-fill--${Math.round(props.item.progress / 10) * 10}`}
            />
          </div>
          <span class="reynard-file-upload__progress-text">{Math.round(props.item.progress)}%</span>
        </div>
      </Show>
      <Show when={props.item.status === "error"}>
        <div class="reynard-file-upload__file-error" title={props.item.error}>
          ⚠️
        </div>
      </Show>
      <Show when={props.item.status === "completed"}>
        <div class="reynard-file-upload__file-success">✓</div>
      </Show>
      <div class="reynard-file-upload__file-actions">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => props.removeFile(props.item.id)}
          class="reynard-file-upload__remove-button"
        >
          Remove
        </Button>
      </div>
    </div>
  );
};
