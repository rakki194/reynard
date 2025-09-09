/**
 * File Operations Composable
 * Handles file validation, addition, and removal operations
 */

import type { FileUploadItem, FileUploadProps } from "../types";
import {
  createFileUploadItem,
  validateFileSize,
  validateFileType,
} from "../utils/file-utils";

export interface FileOperations {
  addFiles: (files: File[]) => FileUploadItem[];
  removeFile: (id: string, items: FileUploadItem[]) => FileUploadItem[];
  clearFiles: () => FileUploadItem[];
}

export function useFileOperations(props: FileUploadProps): FileOperations {
  const addFiles = (files: File[]): FileUploadItem[] => {
    const validFiles = files.filter((file) => {
      const sizeValid = validateFileSize(
        file,
        props.maxFileSize || 100 * 1024 * 1024,
      );
      const typeValid = validateFileType(file, props.accept || "*/*");
      return sizeValid && typeValid;
    });

    const newItems = validFiles.map(createFileUploadItem);
    props.onFilesSelected?.(validFiles);

    return newItems;
  };

  const removeFile = (
    id: string,
    items: FileUploadItem[],
  ): FileUploadItem[] => {
    return items.filter((item) => item.id !== id);
  };

  const clearFiles = (): FileUploadItem[] => {
    return [];
  };

  return {
    addFiles,
    removeFile,
    clearFiles,
  };
}
