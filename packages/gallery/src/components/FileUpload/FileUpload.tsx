/**
 * FileUpload Component
 * Advanced file upload with drag & drop, progress tracking, and validation
 */

import {
  Component,
  createSignal,
  createEffect,
  splitProps,
  For,
  Show,
} from "solid-js";
import { Button } from "@reynard/components";
import "./FileUpload.css";

export interface FileUploadItem {
  /** Unique identifier */
  id: string;
  /** File object */
  file: File;
  /** Upload progress (0-100) */
  progress: number;
  /** Upload status */
  status: "pending" | "uploading" | "completed" | "error";
  /** Error message if status is error */
  error?: string;
  /** Upload speed in bytes per second */
  speed?: number;
  /** Time remaining in seconds */
  timeRemaining?: number;
}

export interface FileUploadProps {
  /** Whether drag & drop is enabled */
  enableDragDrop?: boolean;
  /** Whether multiple file selection is allowed */
  multiple?: boolean;
  /** Accepted file types */
  accept?: string;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Maximum number of files */
  maxFiles?: number;
  /** Whether to show file list */
  showFileList?: boolean;
  /** Whether to show progress bars */
  showProgress?: boolean;
  /** Whether to auto-upload files */
  autoUpload?: boolean;
  /** Upload endpoint URL */
  uploadUrl?: string;
  /** Additional upload headers */
  headers?: Record<string, string>;
  /** Callback when files are selected */
  onFilesSelected?: (files: File[]) => void;
  /** Callback when upload starts */
  onUploadStart?: (files: File[]) => void;
  /** Callback when upload progress updates */
  onUploadProgress?: (item: FileUploadItem) => void;
  /** Callback when upload completes */
  onUploadComplete?: (item: FileUploadItem) => void;
  /** Callback when upload fails */
  onUploadError?: (item: FileUploadItem, error: string) => void;
  /** Callback when files are dropped */
  onFilesDropped?: (files: File[]) => void;
  /** Custom class name */
  class?: string;
}

export interface FileUploadState {
  isDragOver: boolean;
  isUploading: boolean;
  uploadItems: FileUploadItem[];
  selectedFiles: File[];
}

const defaultProps = {
  enableDragDrop: true,
  multiple: true,
  accept: "*/*",
  maxFileSize: 100 * 1024 * 1024, // 100MB
  maxFiles: 10,
  showFileList: true,
  showProgress: true,
  autoUpload: false,
};

export const FileUpload: Component<FileUploadProps> = (props) => {
  const merged = { ...defaultProps, ...props };
  const [local] = splitProps(merged, [
    "enableDragDrop",
    "multiple",
    "accept",
    "maxFileSize",
    "maxFiles",
    "showFileList",
    "showProgress",
    "autoUpload",
    "uploadUrl",
    "headers",
    "onFilesSelected",
    "onUploadStart",
    "onUploadProgress",
    "onUploadComplete",
    "onUploadError",
    "onFilesDropped",
    "class",
  ]);

  // State
  const [state, setState] = createSignal<FileUploadState>({
    isDragOver: false,
    isUploading: false,
    uploadItems: [],
    selectedFiles: [],
  });

  // Refs
  let fileInputRef: HTMLInputElement | undefined;
  let dropZoneRef: HTMLDivElement | undefined;

  // Effects
  createEffect(() => {
    if (local.autoUpload && state().selectedFiles.length > 0) {
      handleUpload();
    }
  });

  // Event handlers
  const handleFileSelect = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
      const files = Array.from(target.files);
      handleFilesAdded(files);
    }
  };

  const handleDragEnter = (event: DragEvent) => {
    if (!local.enableDragDrop) return;
    event.preventDefault();
    setState((prev) => ({ ...prev, isDragOver: true }));
  };

  const handleDragLeave = (event: DragEvent) => {
    if (!local.enableDragDrop) return;
    event.preventDefault();

    // Only set drag over to false if leaving the drop zone entirely
    if (dropZoneRef && !dropZoneRef.contains(event.relatedTarget as Node)) {
      setState((prev) => ({ ...prev, isDragOver: false }));
    }
  };

  const handleDragOver = (event: DragEvent) => {
    if (!local.enableDragDrop) return;
    event.preventDefault();
    event.dataTransfer!.dropEffect = "copy";
  };

  const handleDrop = (event: DragEvent) => {
    if (!local.enableDragDrop) return;
    event.preventDefault();

    setState((prev) => ({ ...prev, isDragOver: false }));

    const files = Array.from(event.dataTransfer!.files);
    handleFilesAdded(files);
    local.onFilesDropped?.(files);
  };

  const handleFilesAdded = (files: File[]) => {
    // Validate files
    const validFiles = files.filter((file) => {
      if (file.size > (local.maxFileSize || 0)) {
        console.warn(`File ${file.name} exceeds maximum size limit`);
        return false;
      }
      return true;
    });

    // Check max files limit
    if (local.maxFiles && validFiles.length > local.maxFiles) {
      console.warn(`Maximum ${local.maxFiles} files allowed`);
      validFiles.splice(local.maxFiles);
    }

    if (validFiles.length === 0) return;

    // Create upload items
    const newItems: FileUploadItem[] = validFiles.map((file) => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: "pending",
    }));

    setState((prev) => ({
      ...prev,
      selectedFiles: [...prev.selectedFiles, ...validFiles],
      uploadItems: [...prev.uploadItems, ...newItems],
    }));

    local.onFilesSelected?.(validFiles);
  };

  const handleUpload = async () => {
    if (!local.uploadUrl || state().isUploading) return;

    setState((prev) => ({ ...prev, isUploading: true }));
    local.onUploadStart?.(state().selectedFiles);

    const items = state().uploadItems.filter(
      (item) => item.status === "pending",
    );

    for (const item of items) {
      try {
        await uploadFile(item);
      } catch (error) {
        console.error("Upload failed:", error);
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        handleUploadError(item, errorMessage);
      }
    }

    setState((prev) => ({ ...prev, isUploading: false }));
  };

  const uploadFile = async (item: FileUploadItem): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const formData = new FormData();
      formData.append("file", item.file);

      // Update status to uploading
      setState((prev) => ({
        ...prev,
        uploadItems: prev.uploadItems.map((i) =>
          i.id === item.id ? { ...i, status: "uploading" } : i,
        ),
      }));

      // Progress tracking
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          const speed = event.loaded / (Date.now() / 1000);
          const timeRemaining =
            event.total > event.loaded
              ? (event.total - event.loaded) / speed
              : 0;

          const updatedItem: FileUploadItem = {
            ...item,
            progress,
            speed,
            timeRemaining,
          };

          setState((prev) => ({
            ...prev,
            uploadItems: prev.uploadItems.map((i) =>
              i.id === item.id ? updatedItem : i,
            ),
          }));

          local.onUploadProgress?.(updatedItem);
        }
      });

      // Success
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const completedItem: FileUploadItem = {
            ...item,
            progress: 100,
            status: "completed",
          };

          setState((prev) => ({
            ...prev,
            uploadItems: prev.uploadItems.map((i) =>
              i.id === item.id ? completedItem : i,
            ),
          }));

          local.onUploadComplete?.(completedItem);
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      // Error
      xhr.addEventListener("error", () => {
        reject(new Error("Network error during upload"));
      });

      // Send request
      xhr.open("POST", local.uploadUrl!);

      // Add headers
      if (local.headers) {
        Object.entries(local.headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });
      }

      xhr.send(formData);
    });
  };

  const handleUploadError = (item: FileUploadItem, error: string) => {
    const errorItem: FileUploadItem = {
      ...item,
      status: "error",
      error,
    };

    setState((prev) => ({
      ...prev,
      uploadItems: prev.uploadItems.map((i) =>
        i.id === item.id ? errorItem : i,
      ),
    }));

    local.onUploadError?.(item, error);
  };

  const handleRemoveFile = (itemId: string) => {
    setState((prev) => ({
      ...prev,
      selectedFiles: prev.selectedFiles.filter(
        (_, index) =>
          prev.uploadItems.findIndex((item) => item.id === itemId) !== index,
      ),
      uploadItems: prev.uploadItems.filter((item) => item.id !== itemId),
    }));
  };

  const handleClearAll = () => {
    setState((prev) => ({
      ...prev,
      selectedFiles: [],
      uploadItems: [],
    }));
  };

  const handleBrowseClick = () => {
    fileInputRef?.click();
  };

  // Computed values
  const totalProgress = () => {
    const items = state().uploadItems;
    if (items.length === 0) return 0;

    const totalProgress = items.reduce((sum, item) => sum + item.progress, 0);
    return Math.round(totalProgress / items.length);
  };

  const hasFiles = () => state().selectedFiles.length > 0;
  const canUpload = () => hasFiles() && !state().isUploading && local.uploadUrl;

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return formatFileSize(bytesPerSecond) + "/s";
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
    return `${Math.round(seconds / 3600)}h`;
  };

  return (
    <div class={`reynard-file-upload ${local.class || ""}`}>
      {/* Drop Zone */}
      <Show when={local.enableDragDrop}>
        <div
          ref={dropZoneRef}
          class={`reynard-file-upload__drop-zone ${
            state().isDragOver
              ? "reynard-file-upload__drop-zone--drag-over"
              : ""
          }`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <div class="reynard-file-upload__drop-zone-content">
            <div class="reynard-file-upload__drop-zone-icon">📁</div>
            <h3 class="reynard-file-upload__drop-zone-title">
              Drop files here to upload
            </h3>
            <p class="reynard-file-upload__drop-zone-subtitle">
              or click to browse files
            </p>
            <Button
              variant="ghost"
              onClick={handleBrowseClick}
              class="reynard-file-upload__browse-button"
            >
              Browse Files
            </Button>
          </div>
        </div>
      </Show>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={local.multiple}
        accept={local.accept}
        onChange={handleFileSelect}
        class="reynard-file-upload__file-input"
        data-testid="file-upload-input"
        aria-label="File upload input"
        title="Select files to upload"
      />

      {/* File List */}
      <Show when={local.showFileList && hasFiles()}>
        <div class="reynard-file-upload__file-list">
          <div class="reynard-file-upload__file-list-header">
            <h4 class="reynard-file-upload__file-list-title">
              Selected Files ({state().selectedFiles.length})
            </h4>
            <div class="reynard-file-upload__file-list-actions">
              <Show when={canUpload()}>
                <Button
                  size="sm"
                  onClick={handleUpload}
                  disabled={state().isUploading}
                >
                  {state().isUploading ? "Uploading..." : "Upload All"}
                </Button>
              </Show>
              <Button size="sm" variant="ghost" onClick={handleClearAll}>
                Clear All
              </Button>
            </div>
          </div>

          <div class="reynard-file-upload__file-items">
            <For each={state().uploadItems}>
              {(item) => (
                <div
                  class={`reynard-file-upload__file-item reynard-file-upload__file-item--${item.status}`}
                >
                  <div class="reynard-file-upload__file-info">
                    <div class="reynard-file-upload__file-name">
                      {item.file.name}
                    </div>
                    <div class="reynard-file-upload__file-details">
                      <span class="reynard-file-upload__file-size">
                        {formatFileSize(item.file.size)}
                      </span>
                      <Show when={item.status === "uploading" && item.speed}>
                        <span class="reynard-file-upload__file-speed">
                          {formatSpeed(item.speed!)}
                        </span>
                      </Show>
                      <Show
                        when={item.status === "uploading" && item.timeRemaining}
                      >
                        <span class="reynard-file-upload__file-time">
                          {formatTime(item.timeRemaining!)} remaining
                        </span>
                      </Show>
                    </div>
                  </div>

                  <Show when={local.showProgress}>
                    <div class="reynard-file-upload__progress-container">
                      <div class="reynard-file-upload__progress-bar">
                        <div
                          class="reynard-file-upload__progress-fill"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span class="reynard-file-upload__progress-text">
                        {item.progress}%
                      </span>
                    </div>
                  </Show>

                  <div class="reynard-file-upload__file-actions">
                    <Show when={item.status === "error"}>
                      <span
                        class="reynard-file-upload__file-error"
                        title={item.error}
                      >
                        ⚠️
                      </span>
                    </Show>
                    <Show when={item.status === "completed"}>
                      <span class="reynard-file-upload__file-success">✓</span>
                    </Show>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveFile(item.id)}
                      class="reynard-file-upload__remove-button"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}
            </For>
          </div>

          {/* Overall Progress */}
          <Show when={local.showProgress && hasFiles()}>
            <div class="reynard-file-upload__overall-progress">
              <div class="reynard-file-upload__overall-progress-bar">
                <div
                  class="reynard-file-upload__overall-progress-fill"
                  style={{ width: `${totalProgress()}%` }}
                />
              </div>
              <span class="reynard-file-upload__overall-progress-text">
                Overall Progress: {totalProgress()}%
              </span>
            </div>
          </Show>
        </div>
      </Show>

      {/* Instructions */}
      <Show when={local.enableDragDrop && !hasFiles()}>
        <div class="reynard-file-upload__instructions">
          <p>
            Drag and drop files here, or click the browse button to select files
            manually.
          </p>
          <Show when={local.maxFileSize}>
            <p>Maximum file size: {formatFileSize(local.maxFileSize!)}</p>
          </Show>
          <Show when={local.maxFiles}>
            <p>Maximum files: {local.maxFiles}</p>
          </Show>
          <Show when={local.accept && local.accept !== "*/*"}>
            <p>Accepted types: {local.accept}</p>
          </Show>
        </div>
      </Show>
    </div>
  );
};
