/**
 * Batch File Upload Component
 *
 * Handles drag-and-drop file upload for batch processing.
 */

import { Component, createSignal } from "solid-js";

export interface BatchFileUploadProps {
  onFilesAdded: (files: File[]) => void;
  disabled?: boolean;
  class?: string;
}

export const BatchFileUpload: Component<BatchFileUploadProps> = (props) => {
  const [dragActive, setDragActive] = createSignal(false);

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer?.files || []);
    const imageFiles = droppedFiles.filter((file) =>
      file.type.startsWith("image/"),
    );
    props.onFilesAdded(imageFiles);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const selectedFiles = Array.from(target.files || []);
    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/"),
    );
    props.onFilesAdded(imageFiles);
    target.value = ""; // Reset input
  };

  return (
    <div
      class={`file-upload-area ${dragActive() ? "drag-active" : ""} ${props.class || ""}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div class="upload-content">
        <div class="upload-icon">📁</div>
        <p>Drag and drop image files here, or click to select</p>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          class="file-input"
          disabled={props.disabled}
          aria-label="Select image files for batch processing"
        />
      </div>
    </div>
  );
};
