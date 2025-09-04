/**
 * File Upload Composable
 * Handles file uploads with progress tracking and validation
 */

import { createSignal, createEffect, onCleanup } from "solid-js";
import type { 
  UploadConfiguration, 
  UploadProgress, 
  FileItem, 
  GalleryCallbacks 
} from "../types";
import { validateFile, extractFileMetadata, generateFileId } from "../utils";

export interface UseFileUploadOptions {
  /** Upload configuration */
  config: UploadConfiguration;
  /** Upload callbacks */
  callbacks?: Pick<GalleryCallbacks, "onUploadStart" | "onUploadProgress" | "onUploadComplete" | "onError">;
  /** Current folder path */
  currentPath?: string;
}

export function useFileUpload(options: UseFileUploadOptions) {
  const [uploads, setUploads] = createSignal<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = createSignal(false);

  // Active upload controllers for cancellation
  const uploadControllers = new Map<string, AbortController>();

  onCleanup(() => {
    // Cancel all active uploads on cleanup
    uploadControllers.forEach(controller => controller.abort());
    uploadControllers.clear();
  });

  /**
   * Upload multiple files
   */
  const uploadFiles = async (files: File[]): Promise<void> => {
    if (files.length === 0) return;

    // Validate files
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const validation = validateFile(file, {
        maxFileSize: options.config.maxFileSize,
        allowedTypes: options.config.allowedTypes,
      });

      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    if (errors.length > 0) {
      options.callbacks?.onError?.(
        `Some files could not be uploaded:\n${errors.join("\n")}`,
        { errors }
      );
    }

    if (validFiles.length === 0) return;

    // Check total size limit
    if (options.config.maxTotalSize) {
      const totalSize = validFiles.reduce((sum, file) => sum + file.size, 0);
      if (totalSize > options.config.maxTotalSize) {
        options.callbacks?.onError?.(
          `Total upload size exceeds limit`,
          { totalSize, limit: options.config.maxTotalSize }
        );
        return;
      }
    }

    setIsUploading(true);
    options.callbacks?.onUploadStart?.(validFiles);

    // Initialize upload progress
    const initialProgress: UploadProgress[] = validFiles.map(file => ({
      id: generateFileId(file),
      file,
      progress: 0,
      status: "pending",
    }));

    setUploads(initialProgress);

    // Upload files concurrently
    const uploadPromises = validFiles.map((file, index) => 
      uploadSingleFile(file, initialProgress[index])
    );

    try {
      await Promise.all(uploadPromises);
      
      const finalUploads = uploads();
      const successful = finalUploads.filter(u => u.status === "completed");
      const failed = finalUploads.filter(u => u.status === "error");

      if (failed.length > 0) {
        options.callbacks?.onError?.(
          `${failed.length} file(s) failed to upload`,
          { failed: failed.map(u => ({ name: u.file.name, error: u.error })) }
        );
      }

      options.callbacks?.onUploadComplete?.(finalUploads);
    } catch (error) {
      options.callbacks?.onError?.(
        "Upload failed",
        { error: error instanceof Error ? error.message : String(error) }
      );
    } finally {
      setIsUploading(false);
      
      // Clear uploads after a delay
      setTimeout(() => {
        setUploads([]);
        uploadControllers.clear();
      }, 3000);
    }
  };

  /**
   * Upload a single file
   */
  const uploadSingleFile = async (file: File, initialProgress: UploadProgress): Promise<void> => {
    const uploadId = initialProgress.id;
    const controller = new AbortController();
    uploadControllers.set(uploadId, controller);

    try {
      // Update status to uploading
      updateUploadProgress(uploadId, { status: "uploading" });

      // Extract metadata if enabled
      let metadata: any = {};
      if (options.config.generateThumbnails) {
        metadata = await extractFileMetadata(file);
      }

      // Prepare form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", options.currentPath || "");
      formData.append("metadata", JSON.stringify(metadata));

      // Track upload progress
      let startTime = Date.now();
      let lastProgress = 0;

      const xhr = new XMLHttpRequest();

      // Set up progress tracking
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          const currentTime = Date.now();
          const elapsed = (currentTime - startTime) / 1000;
          
          if (elapsed > 0) {
            const speed = event.loaded / elapsed;
            const remaining = (event.total - event.loaded) / speed;
            
            updateUploadProgress(uploadId, {
              progress,
              speed,
              timeRemaining: remaining,
            });
          }
          
          lastProgress = progress;
        }
      });

      // Set up completion handlers
      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            updateUploadProgress(uploadId, {
              progress: 100,
              status: "completed",
            });
            resolve();
          } else {
            const error = `Upload failed with status ${xhr.status}`;
            updateUploadProgress(uploadId, {
              status: "error",
              error,
            });
            reject(new Error(error));
          }
        };

        xhr.onerror = () => {
          const error = "Network error during upload";
          updateUploadProgress(uploadId, {
            status: "error",
            error,
          });
          reject(new Error(error));
        };

        xhr.onabort = () => {
          updateUploadProgress(uploadId, {
            status: "cancelled",
          });
          reject(new Error("Upload cancelled"));
        };

        // Set up headers
        Object.entries(options.config.headers || {}).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });

        // Start upload
        xhr.open("POST", options.config.uploadUrl);
        xhr.send(formData);

        // Handle cancellation
        controller.signal.addEventListener("abort", () => {
          xhr.abort();
        });
      });

    } catch (error) {
      updateUploadProgress(uploadId, {
        status: "error",
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    } finally {
      uploadControllers.delete(uploadId);
    }
  };

  /**
   * Update upload progress for a specific upload
   */
  const updateUploadProgress = (uploadId: string, updates: Partial<UploadProgress>): void => {
    setUploads(prev => prev.map(upload => 
      upload.id === uploadId 
        ? { ...upload, ...updates }
        : upload
    ));

    // Trigger progress callback
    options.callbacks?.onUploadProgress?.(uploads());
  };

  /**
   * Cancel a specific upload
   */
  const cancelUpload = (uploadId: string): void => {
    const controller = uploadControllers.get(uploadId);
    if (controller) {
      controller.abort();
      updateUploadProgress(uploadId, { status: "cancelled" });
    }
  };

  /**
   * Cancel all uploads
   */
  const cancelAllUploads = (): void => {
    uploadControllers.forEach((controller, uploadId) => {
      controller.abort();
      updateUploadProgress(uploadId, { status: "cancelled" });
    });
  };

  /**
   * Get overall upload statistics
   */
  const getUploadStats = () => {
    const currentUploads = uploads();
    const total = currentUploads.length;
    const completed = currentUploads.filter(u => u.status === "completed").length;
    const failed = currentUploads.filter(u => u.status === "error").length;
    const cancelled = currentUploads.filter(u => u.status === "cancelled").length;
    const inProgress = currentUploads.filter(u => u.status === "uploading").length;
    
    const totalProgress = total > 0 
      ? currentUploads.reduce((sum, upload) => sum + upload.progress, 0) / total 
      : 0;

    return {
      total,
      completed,
      failed,
      cancelled,
      inProgress,
      totalProgress,
    };
  };

  return {
    // State
    uploads,
    isUploading,
    
    // Actions
    uploadFiles,
    cancelUpload,
    cancelAllUploads,
    
    // Computed
    getUploadStats,
  };
}




