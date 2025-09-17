/**
 * File Upload Composable
 * Main orchestrator for file uploads with progress tracking and validation
 */

import type { UploadConfiguration, GalleryCallbacks } from "../types";
import { useUploadState } from "./useUploadState";
import { useFileValidation } from "./useFileValidation";
import { useSingleFileUpload } from "./useSingleFileUpload";
import { useUploadStats } from "./useUploadStats";
import { createUpdateProgressFunction } from "./useFileUploadHelpers";
import { createUploadActions } from "./useUploadActions";

export interface UseFileUploadOptions {
  /** Upload configuration */
  config: UploadConfiguration;
  /** Upload callbacks */
  callbacks?: Pick<GalleryCallbacks, "onUploadStart" | "onUploadProgress" | "onUploadComplete" | "onError">;
  /** Current folder path */
  currentPath?: string;
}

export function useFileUpload(options: UseFileUploadOptions) {
  const state = useUploadState();
  const validation = useFileValidation(options.config);
  const stats = useUploadStats();

  const updateUploadProgress = createUpdateProgressFunction(state.setUploads, state.uploads, options.callbacks);

  const singleUpload = useSingleFileUpload({
    config: options.config,
    currentPath: options.currentPath,
    updateProgress: updateUploadProgress,
    uploadControllers: state.uploadControllers,
  });

  const actions = createUploadActions(state, validation, singleUpload, updateUploadProgress, options);

  return {
    uploads: state.uploads,
    isUploading: state.isUploading,
    ...actions,
    getUploadStats: () => stats.getUploadStats(state.uploads()),
  };
}
