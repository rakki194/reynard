/**
 * FileUpload Types
 * Type definitions for file upload functionality
 */

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

export interface UploadProgress {
  loaded: number;
  total: number;
  speed: number;
  timeRemaining: number;
}
