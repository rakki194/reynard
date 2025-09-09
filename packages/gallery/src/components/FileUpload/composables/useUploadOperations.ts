/**
 * Upload Operations Composable
 * Handles file upload execution and progress tracking
 */

import type { FileUploadItem, FileUploadProps } from "../types";
import { uploadFile } from "../utils/upload-utils";

export interface UploadOperations {
  startUpload: (
    items: FileUploadItem[],
    updateItem: (id: string, updates: Partial<FileUploadItem>) => void,
    setIsUploading: (uploading: boolean) => void,
  ) => Promise<void>;
  retryFailedUploads: (items: FileUploadItem[]) => FileUploadItem[];
}

export function useUploadOperations(props: FileUploadProps): UploadOperations {
  const startUpload = async (
    items: FileUploadItem[],
    updateItem: (id: string, updates: Partial<FileUploadItem>) => void,
    setIsUploading: (uploading: boolean) => void,
  ): Promise<void> => {
    if (!props.uploadUrl) return;

    setIsUploading(true);
    props.onUploadStart?.(items.map((item) => item.file));

    for (const item of items) {
      if (item.status === "pending") {
        try {
          updateItem(item.id, { status: "uploading" });

          await uploadFile(
            item.file,
            props.uploadUrl!,
            props.headers || {},
            (progress) => {
              updateItem(item.id, {
                progress: Math.round((progress.loaded / progress.total) * 100),
                speed: progress.speed,
                timeRemaining: progress.timeRemaining,
              });
              props.onUploadProgress?.(item);
            },
          );

          updateItem(item.id, { status: "completed", progress: 100 });
          props.onUploadComplete?.(item);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Upload failed";
          updateItem(item.id, {
            status: "error",
            error: errorMessage,
          });
          props.onUploadError?.(item, errorMessage);
        }
      }
    }

    setIsUploading(false);
  };

  const retryFailedUploads = (items: FileUploadItem[]): FileUploadItem[] => {
    return items.filter((item) => item.status === "error");
  };

  return {
    startUpload,
    retryFailedUploads,
  };
}
