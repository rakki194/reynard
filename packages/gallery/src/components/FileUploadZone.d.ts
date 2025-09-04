/**
 * File Upload Zone Component
 * Drag and drop file upload area with progress tracking
 */
import { Component } from "solid-js";
import type { UploadProgress, UploadConfiguration } from "../types";
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
export declare const FileUploadZone: Component<FileUploadZoneProps>;
