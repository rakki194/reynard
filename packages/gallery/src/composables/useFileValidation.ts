/**
 * File Validation Logic
 * Handles file validation and error reporting
 */

import type { UploadConfiguration } from "../types";
import { validateFile } from "../utils";

export interface FileValidationResult {
  validFiles: File[];
  errors: string[];
}

export function useFileValidation(config: UploadConfiguration) {
  const validateFiles = (files: File[]): FileValidationResult => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      const validation = validateFile(file, {
        maxFileSize: config.maxFileSize,
        allowedTypes: config.allowedTypes,
      });

      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    }

    return { validFiles, errors };
  };

  const checkTotalSizeLimit = (files: File[]): boolean => {
    if (!config.maxTotalSize) return true;

    const totalSize = files.reduce((sum, file) => sum + file.size, 0);
    return totalSize <= config.maxTotalSize;
  };

  return {
    validateFiles,
    checkTotalSizeLimit,
  };
}
