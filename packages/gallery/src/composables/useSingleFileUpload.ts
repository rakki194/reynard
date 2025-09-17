/**
 * Single File Upload Logic
 * Handles uploading a single file with progress tracking
 */

import type { UploadConfiguration, UploadProgress } from "../types";
import { extractFileMetadata } from "../utils";
import { performXHRUpload } from "./useXHRUpload";

export interface SingleFileUploadOptions {
  config: UploadConfiguration;
  currentPath?: string;
  updateProgress: (uploadId: string, updates: Partial<UploadProgress>) => void;
  uploadControllers: Map<string, AbortController>;
}

export function useSingleFileUpload(options: SingleFileUploadOptions) {
  const uploadSingleFile = async (file: File, initialProgress: UploadProgress): Promise<void> => {
    const uploadId = initialProgress.id;
    const controller = new AbortController();
    options.uploadControllers.set(uploadId, controller);

    try {
      options.updateProgress(uploadId, { status: "uploading" });

      let metadata: Record<string, unknown> = {};
      if (options.config.generateThumbnails) {
        metadata = await extractFileMetadata(file);
      }

      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", options.currentPath || "");
      formData.append("metadata", JSON.stringify(metadata));

      await performXHRUpload(file, formData, uploadId, options);
    } catch (error) {
      options.updateProgress(uploadId, {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      options.uploadControllers.delete(uploadId);
    }
  };

  return { uploadSingleFile };
}
