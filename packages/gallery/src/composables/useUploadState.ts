/**
 * Upload State Management
 * Handles upload state and progress tracking
 */

import { createSignal, onCleanup } from "solid-js";
import type { UploadProgress } from "../types";

export interface UploadState {
  uploads: () => UploadProgress[];
  isUploading: () => boolean;
  setUploads: (uploads: UploadProgress[] | ((prev: UploadProgress[]) => UploadProgress[])) => void;
  setIsUploading: (uploading: boolean | ((prev: boolean) => boolean)) => void;
  uploadControllers: Map<string, AbortController>;
}

export function useUploadState(): UploadState {
  const [uploads, setUploads] = createSignal<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = createSignal(false);
  const uploadControllers = new Map<string, AbortController>();

  onCleanup(() => {
    uploadControllers.forEach((controller) => controller.abort());
    uploadControllers.clear();
  });

  return {
    uploads,
    isUploading,
    setUploads,
    setIsUploading,
    uploadControllers
  };
}
