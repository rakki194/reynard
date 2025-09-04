/**
 * File Upload Zone Component
 * Drag and drop file upload area with progress tracking
 */

import { 
  Component, 
  Show, 
  For, 
  createSignal, 
  onMount,
  onCleanup
} from "solid-js";
import { Button } from "@reynard/components";
import type { UploadProgress, UploadConfiguration } from "../types";
import { formatFileSize } from "../utils";
import "./FileUploadZone.css";

export interface FileUploadZoneProps {
  /** Upload configuration */
  config: UploadConfiguration;
  /** Current upload progress */
  uploads?: UploadProgress[];
  /** Whether upload is in progress */
  uploading?: boolean;
  /** Drag and drop enabled */
  enableDragDrop?: boolean;
  /** Upload handler */
  onUpload?: (files: File[]) => void;
  /** Cancel upload handler */
  onCancelUpload?: (uploadId: string) => void;
  /** Custom class name */
  class?: string;
}

export const FileUploadZone: Component<FileUploadZoneProps> = (props) => {
  let fileInputRef: HTMLInputElement | undefined;
  let dropZoneRef: HTMLDivElement | undefined;
  
  const [isDragOver, setIsDragOver] = createSignal(false);

  // Handle file input change
  const handleFileChange = (event: Event): void => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      props.onUpload?.(Array.from(input.files));
      input.value = ""; // Reset input
    }
  };



  // Drag and drop handlers
  const handleDragEnter = (event: DragEvent): void => {
    if (!props.enableDragDrop) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    if (event.dataTransfer?.items) {
      const hasFiles = Array.from(event.dataTransfer.items).some(
        item => item.kind === "file"
      );
      if (hasFiles) {
        setIsDragOver(true);
      }
    }
  };

  const handleDragLeave = (event: DragEvent): void => {
    if (!props.enableDragDrop) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    setIsDragOver(false);
  };

  const handleDragOver = (event: DragEvent): void => {
    if (!props.enableDragDrop) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    // Set dropEffect to copy to show the correct cursor
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = "copy";
    }
  };

  const handleDrop = (event: DragEvent): void => {
    if (!props.enableDragDrop) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    setIsDragOver(false);
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      props.onUpload?.(Array.from(files));
    }
  };

  // Set up drag and drop event listeners
  onMount(() => {
    if (props.enableDragDrop && dropZoneRef) {
      const element = dropZoneRef;
      
      element.addEventListener("dragenter", handleDragEnter);
      element.addEventListener("dragleave", handleDragLeave);
      element.addEventListener("dragover", handleDragOver);
      element.addEventListener("drop", handleDrop);
      
      onCleanup(() => {
        element.removeEventListener("dragenter", handleDragEnter);
        element.removeEventListener("dragleave", handleDragLeave);
        element.removeEventListener("dragover", handleDragOver);
        element.removeEventListener("drop", handleDrop);
      });
    }
  });

  // Get upload zone classes
  const getUploadZoneClasses = (): string => {
    const classes = ["file-upload-zone"];
    
    if (isDragOver()) classes.push("file-upload-zone--drag-over");
    if (props.uploading) classes.push("file-upload-zone--uploading");
    if (props.class) classes.push(props.class);
    
    return classes.join(" ");
  };

  // Get accepted file types for input
  const getAcceptedTypes = (): string => {
    return props.config.allowedTypes.join(",");
  };

  // Get progress bar width class
  const getProgressWidthClass = (progress: number): string => {
    // Round to nearest 10% and clamp between 0-100
    const roundedProgress = Math.min(100, Math.max(0, Math.round(progress / 10) * 10));
    return `upload-item__progress-bar--width-${roundedProgress}`;
  };

  // Render upload progress
  const renderUploadProgress = () => {
    if (!props.uploads || props.uploads.length === 0) return null;

    return (
      <div class="file-upload-zone__progress">
        <h4 class="file-upload-zone__progress-title">
          Uploading {props.uploads.length} file{props.uploads.length !== 1 ? "s" : ""}
        </h4>
        
        <For each={props.uploads}>
          {(upload) => (
            <div class="upload-item" data-status={upload.status}>
              <div class="upload-item__info">
                <span class="upload-item__name" title={upload.file.name}>
                  {upload.file.name}
                </span>
                <span class="upload-item__size">
                  {formatFileSize(upload.file.size)}
                </span>
              </div>
              
              <div class="upload-item__progress">
                <div 
                  class={`upload-item__progress-bar ${getProgressWidthClass(upload.progress)}`}
                />
                <span class="upload-item__progress-text">
                  {upload.progress}%
                </span>
              </div>
              
              <div class="upload-item__actions">
                <Show when={upload.status === "uploading"}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => props.onCancelUpload?.(upload.id)}
                  >
                    Cancel
                  </Button>
                </Show>
                
                <Show when={upload.status === "error"}>
                  <span class="upload-item__error" title={upload.error}>
                    Error
                  </span>
                </Show>
                
                <Show when={upload.status === "completed"}>
                  <span class="upload-item__success">
                    ✓
                  </span>
                </Show>
              </div>
              
              <Show when={upload.speed && upload.timeRemaining}>
                <div class="upload-item__stats">
                  <span class="upload-item__speed">
                    {formatFileSize(upload.speed!)}/s
                  </span>
                  <span class="upload-item__time">
                    {Math.round(upload.timeRemaining!)}s remaining
                  </span>
                </div>
              </Show>
            </div>
          )}
        </For>
      </div>
    );
  };

  return (
    <div
      ref={dropZoneRef}
      class={getUploadZoneClasses()}
      aria-label="Upload files"
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple={props.config.multiple}
        accept={getAcceptedTypes()}
        onChange={handleFileChange}
        class="file-upload-zone__file-input"
        aria-label="File upload input"
      />
      
      <Show when={!props.uploading}>
        <div class="file-upload-zone__content">
          <div class="file-upload-zone__icon">
            <span class="icon">
              {isDragOver() ? "download" : "upload"}
            </span>
          </div>
          
          <div class="file-upload-zone__text">
            <Show when={isDragOver()}>
              <h3>Drop files here to upload</h3>
              <p>Release to start uploading</p>
            </Show>
            
            <Show when={!isDragOver()}>
              <h3>Upload Files</h3>
              <p>
                <Show when={props.enableDragDrop}>
                  Drag and drop files here or{" "}
                </Show>
                <button 
                  type="button" 
                  class="file-upload-zone__browse-button"
                  onClick={() => fileInputRef?.click()}
                >
                  browse files
                </button>
              </p>
            </Show>
          </div>
          
          <div class="file-upload-zone__info">
            <p>
              Maximum file size: {formatFileSize(props.config.maxFileSize)}
            </p>
            <Show when={props.config.allowedTypes.length > 0}>
              <p>
                Supported formats: {props.config.allowedTypes.join(", ")}
              </p>
            </Show>
          </div>
        </div>
      </Show>
      
      <Show when={props.uploading}>
        {renderUploadProgress()}
      </Show>
    </div>
  );
};




