/**
 * FileList Component
 * Displays the list of uploaded files with progress and controls
 */

import { Component, For, Show } from "solid-js";
import { Button } from "reynard-components-core";
import type { FileUploadItem } from "../types";
import { FileItem } from "./FileItem";

export interface FileListProps {
  uploadItems: () => FileUploadItem[];
  showFileList: boolean;
  showProgress: boolean;
  removeFile: (id: string) => void;
  clearFiles: () => void;
}

export const FileList: Component<FileListProps> = props => {
  return (
    <Show when={props.showFileList && props.uploadItems().length > 0}>
      <div class="reynard-file-upload__file-list">
        <div class="reynard-file-upload__file-list-header">
          <span class="reynard-file-upload__file-list-title">Files ({props.uploadItems().length})</span>
          <div class="reynard-file-upload__file-list-actions">
            <Button size="sm" variant="ghost" onClick={props.clearFiles}>
              Clear All
            </Button>
          </div>
        </div>
        <div class="reynard-file-upload__file-items">
          <For each={props.uploadItems()}>
            {item => <FileItem item={item} showProgress={props.showProgress} removeFile={props.removeFile} />}
          </For>
        </div>
      </div>
    </Show>
  );
};
