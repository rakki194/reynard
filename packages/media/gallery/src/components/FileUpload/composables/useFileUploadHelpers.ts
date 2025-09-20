/**
 * FileUpload Helpers
 * Helper functions for the main createFileUpload composable
 */

import type { FileUploadItem } from "../types";
import type { UploadState } from "./useUploadState";

export function createUpdateItemFunction(
  setUploadItems: (items: FileUploadItem[] | ((prev: FileUploadItem[]) => FileUploadItem[])) => void
) {
  return (id: string, updates: Partial<FileUploadItem>) => {
    setUploadItems(prev => prev.map(item => (item.id === id ? { ...item, ...updates } : item)));
  };
}

export function createFileUploadActions(
  fileOps: {
    addFiles: (files: File[]) => FileUploadItem[];
    removeFile: (id: string, items: FileUploadItem[]) => FileUploadItem[];
    clearFiles: () => FileUploadItem[];
  },
  uploadOps: {
    startUpload: (
      items: FileUploadItem[],
      updateItem: (id: string, updates: Partial<FileUploadItem>) => void,
      setIsUploading: (uploading: boolean) => void
    ) => Promise<void>;
    retryFailedUploads: (items: FileUploadItem[]) => FileUploadItem[];
  },
  state: UploadState,
  updateItem: (id: string, updates: Partial<FileUploadItem>) => void,
  props: { autoUpload?: boolean; uploadUrl?: string }
) {
  const addFiles = (files: File[]) => {
    const newItems = fileOps.addFiles(files);
    state.setUploadItems(prev => [...prev, ...newItems]);

    if (props.autoUpload && props.uploadUrl) {
      startUpload(newItems);
    }
  };

  const startUpload = async (items: FileUploadItem[] = state.uploadItems()) => {
    await uploadOps.startUpload(items, updateItem, state.setIsUploading);
  };

  const removeFile = (id: string) => {
    state.setUploadItems(prev => fileOps.removeFile(id, prev));
  };

  const clearFiles = () => {
    state.setUploadItems(fileOps.clearFiles());
  };

  const retryFailedUploads = () => {
    const failedItems = uploadOps.retryFailedUploads(state.uploadItems());
    if (failedItems.length > 0) {
      startUpload(failedItems);
    }
  };

  return {
    addFiles,
    startUpload,
    removeFile,
    clearFiles,
    retryFailedUploads,
  };
}
