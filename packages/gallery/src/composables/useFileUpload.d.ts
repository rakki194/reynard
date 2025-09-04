/**
 * File Upload Composable
 * Handles file uploads with progress tracking and validation
 */
import type {
  UploadConfiguration,
  UploadProgress,
  GalleryCallbacks,
} from "../types";
export interface UseFileUploadOptions {
  /** Upload configuration */
  config: UploadConfiguration;
  /** Upload callbacks */
  callbacks?: Pick<
    GalleryCallbacks,
    "onUploadStart" | "onUploadProgress" | "onUploadComplete" | "onError"
  >;
  /** Current folder path */
  currentPath?: string;
}
export declare function useFileUpload(options: UseFileUploadOptions): {
  uploads: import("solid-js").Accessor<UploadProgress[]>;
  isUploading: import("solid-js").Accessor<boolean>;
  uploadFiles: (files: File[]) => Promise<void>;
  cancelUpload: (uploadId: string) => void;
  cancelAllUploads: () => void;
  getUploadStats: () => {
    total: number;
    completed: number;
    failed: number;
    cancelled: number;
    inProgress: number;
    totalProgress: number;
  };
};
