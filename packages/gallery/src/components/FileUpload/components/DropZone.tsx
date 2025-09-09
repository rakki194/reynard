/**
 * DropZone Component
 * Handles drag and drop file selection
 */

import { Component } from "solid-js";
import type { FileUploadProps } from "../types";
import { formatFileSize } from "../utils/file-utils";

export interface DropZoneProps {
  isDragOver: () => boolean;
  handleDragOver: (event: DragEvent) => void;
  handleDragLeave: (event: DragEvent) => void;
  handleDrop: (event: DragEvent) => void;
  handleFileInput: (event: Event) => void;
  props: Pick<
    FileUploadProps,
    "multiple" | "accept" | "maxFileSize" | "maxFiles"
  >;
}

export const DropZone: Component<DropZoneProps> = (props) => {
  return (
    <div
      class={`reynard-file-upload__drop-zone ${props.isDragOver() ? "reynard-file-upload__drop-zone--drag-over" : ""}`}
      onDragOver={props.handleDragOver}
      onDragLeave={props.handleDragLeave}
      onDrop={props.handleDrop}
    >
      <input
        type="file"
        multiple={props.props.multiple}
        accept={props.props.accept}
        onChange={props.handleFileInput}
        class="reynard-file-upload__file-input"
        id="file-input"
      />
      <label for="file-input" class="reynard-file-upload__drop-zone-content">
        <div class="reynard-file-upload__drop-zone-icon">📁</div>
        <div class="reynard-file-upload__drop-zone-title">
          {props.isDragOver()
            ? "Drop files here"
            : "Click to select files or drag and drop"}
        </div>
        <div class="reynard-file-upload__drop-zone-subtitle">
          Max file size: {formatFileSize(props.props.maxFileSize!)}
          {props.props.maxFiles && ` • Max files: ${props.props.maxFiles}`}
        </div>
      </label>
    </div>
  );
};
