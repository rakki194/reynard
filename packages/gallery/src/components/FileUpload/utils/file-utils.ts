/**
 * File Utilities
 * Helper functions for file operations and validation
 */

import type { FileUploadItem } from "../types";

/**
 * Generate a unique ID for file upload items
 */
export function generateFileId(): string {
  return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate file size against maximum allowed size
 */
export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

/**
 * Validate file type against accepted types
 */
export function validateFileType(file: File, accept: string): boolean {
  if (accept === "*/*") return true;

  const acceptedTypes = accept.split(",").map((type) => type.trim());
  return acceptedTypes.some((type) => {
    if (type.startsWith(".")) {
      // File extension check
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    } else {
      // MIME type check
      return file.type.match(type.replace("*", ".*"));
    }
  });
}

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Format upload speed in human readable format
 */
export function formatUploadSpeed(bytesPerSecond: number): string {
  return formatFileSize(bytesPerSecond) + "/s";
}

/**
 * Calculate upload progress percentage
 */
export function calculateProgress(loaded: number, total: number): number {
  return Math.round((loaded / total) * 100);
}

/**
 * Calculate upload speed and time remaining
 */
export function calculateUploadMetrics(
  loaded: number,
  total: number,
  startTime: number,
): { speed: number; timeRemaining: number } {
  const elapsed = (Date.now() - startTime) / 1000; // seconds
  const speed = loaded / elapsed; // bytes per second
  const remaining = total - loaded;
  const timeRemaining = remaining / speed; // seconds

  return {
    speed: Math.round(speed),
    timeRemaining: Math.round(timeRemaining),
  };
}

/**
 * Create a file upload item from a File object
 */
export function createFileUploadItem(file: File): FileUploadItem {
  return {
    id: generateFileId(),
    file,
    progress: 0,
    status: "pending",
  };
}
