/**
 * Upload State Management Composable
 * Handles file upload state and basic operations
 */

import { createSignal } from 'solid-js';
import type { FileUploadItem } from '../types';

export interface UploadState {
  uploadItems: () => FileUploadItem[];
  isUploading: () => boolean;
  setUploadItems: (items: FileUploadItem[] | ((prev: FileUploadItem[]) => FileUploadItem[])) => void;
  setIsUploading: (uploading: boolean | ((prev: boolean) => boolean)) => void;
}

export function useUploadState(): UploadState {
  const [uploadItems, setUploadItems] = createSignal<FileUploadItem[]>([]);
  const [isUploading, setIsUploading] = createSignal(false);

  return {
    uploadItems,
    isUploading,
    setUploadItems,
    setIsUploading
  };
}
