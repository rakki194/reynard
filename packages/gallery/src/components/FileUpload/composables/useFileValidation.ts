/**
 * useFileValidation Composable
 * Handles file validation logic
 */

import type { FileUploadProps } from "../types";
import { validateFileSize, validateFileType } from "../utils/file-utils";

export function useFileValidation(props: FileUploadProps) {
  /**
   * Validate a single file
   */
  const validateFile = (file: File): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check file size
    if (!validateFileSize(file, props.maxFileSize || 100 * 1024 * 1024)) {
      errors.push(
        `File "${file.name}" is too large. Maximum size is ${formatFileSize(props.maxFileSize || 100 * 1024 * 1024)}`,
      );
    }

    // Check file type
    if (!validateFileType(file, props.accept || "*/*")) {
      errors.push(
        `File "${file.name}" is not an accepted file type. Accepted types: ${props.accept}`,
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  };

  /**
   * Validate multiple files
   */
  const validateFiles = (
    files: File[],
  ): { validFiles: File[]; errors: string[] } => {
    const validFiles: File[] = [];
    const allErrors: string[] = [];

    // Check maximum number of files
    if (props.maxFiles && files.length > props.maxFiles) {
      allErrors.push(
        `Too many files selected. Maximum allowed: ${props.maxFiles}`,
      );
      return { validFiles, errors: allErrors };
    }

    // Validate each file
    files.forEach((file) => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        allErrors.push(...validation.errors);
      }
    });

    return { validFiles, errors: allErrors };
  };

  /**
   * Get validation summary
   */
  const getValidationSummary = (files: File[]) => {
    const { validFiles, errors } = validateFiles(files);

    return {
      totalFiles: files.length,
      validFiles: validFiles.length,
      invalidFiles: files.length - validFiles.length,
      errors,
      isValid: errors.length === 0,
    };
  };

  return {
    validateFile,
    validateFiles,
    getValidationSummary,
  };
}

/**
 * Format file size helper
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
