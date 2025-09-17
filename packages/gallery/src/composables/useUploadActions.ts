/**
 * Upload Actions
 * Handles upload actions like cancel and retry
 */

import type { UploadProgress } from "../types";

export function createUploadActions(
  state: any,
  validation: any,
  singleUpload: any,
  updateProgress: (uploadId: string, updates: Partial<UploadProgress>) => void,
  options: any
) {
  const uploadFiles = async (files: File[]): Promise<void> => {
    if (files.length === 0) return;

    const { validFiles, errors } = validation.validateFiles(files);

    if (errors.length > 0) {
      options.callbacks?.onError?.(`Some files could not be uploaded:\n${errors.join("\n")}`, { errors });
    }

    if (validFiles.length === 0) return;

    if (!validation.checkTotalSizeLimit(validFiles)) {
      const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
      options.callbacks?.onError?.(`Total upload size exceeds limit`, {
        totalSize,
        limit: options.config.maxTotalSize,
      });
      return;
    }

    await performUpload(validFiles, state, singleUpload, options);
  };

  const cancelUpload = (uploadId: string): void => {
    const controller = state.uploadControllers.get(uploadId);
    if (controller) {
      controller.abort();
      updateProgress(uploadId, { status: "cancelled" });
    }
  };

  const cancelAllUploads = (): void => {
    state.uploadControllers.forEach((controller, uploadId) => {
      controller.abort();
      updateProgress(uploadId, { status: "cancelled" });
    });
  };

  return {
    uploadFiles,
    cancelUpload,
    cancelAllUploads,
  };
}

async function performUpload(validFiles: File[], state: any, singleUpload: any, options: any): Promise<void> {
  state.setIsUploading(true);
  options.callbacks?.onUploadStart?.(validFiles);

  const initialProgress = validFiles.map(file => ({
    id: generateFileId(file),
    file,
    progress: 0,
    status: "pending",
  }));

  state.setUploads(initialProgress);

  const uploadPromises = validFiles.map((file, index) => singleUpload.uploadSingleFile(file, initialProgress[index]));

  try {
    await Promise.all(uploadPromises);
    const finalUploads = state.uploads();
    const failed = finalUploads.filter(u => u.status === "error");

    if (failed.length > 0) {
      options.callbacks?.onError?.(`${failed.length} file(s) failed to upload`, {
        failed: failed.map(u => ({ name: u.file.name, error: u.error })),
      });
    }

    options.callbacks?.onUploadComplete?.(finalUploads);
  } catch (error) {
    options.callbacks?.onError?.("Upload failed", {
      error: error instanceof Error ? error.message : String(error),
    });
  } finally {
    state.setIsUploading(false);
    setTimeout(() => {
      state.setUploads([]);
      state.uploadControllers.clear();
    }, 3000);
  }
}

function generateFileId(file: File): string {
  return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
