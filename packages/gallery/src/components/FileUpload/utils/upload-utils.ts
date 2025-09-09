/**
 * Upload Utilities
 * Helper functions for file upload operations
 */

import type { UploadProgress } from "../types";

/**
 * Upload a file with progress tracking
 */
export async function uploadFile(
  file: File,
  uploadUrl: string,
  headers: Record<string, string> = {},
  onProgress?: (progress: UploadProgress) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append("file", file);

    // Set up progress tracking
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress: UploadProgress = {
          loaded: event.loaded,
          total: event.total,
          speed: 0, // Will be calculated by the calling code
          timeRemaining: 0, // Will be calculated by the calling code
        };
        onProgress(progress);
      }
    });

    // Set up completion handlers
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error(`Upload failed with status: ${xhr.status}`));
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Upload failed due to network error"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload was aborted"));
    });

    // Set headers
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    // Start upload
    xhr.open("POST", uploadUrl);
    xhr.send(formData);
  });
}

/**
 * Upload multiple files sequentially
 */
export async function uploadFilesSequentially(
  files: File[],
  uploadUrl: string,
  headers: Record<string, string> = {},
  onProgress?: (fileIndex: number, progress: UploadProgress) => void,
): Promise<void> {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    await uploadFile(file, uploadUrl, headers, (progress) => {
      onProgress?.(i, progress);
    });
  }
}

/**
 * Upload multiple files in parallel
 */
export async function uploadFilesParallel(
  files: File[],
  uploadUrl: string,
  headers: Record<string, string> = {},
  onProgress?: (fileIndex: number, progress: UploadProgress) => void,
): Promise<void> {
  const uploadPromises = files.map((file, index) =>
    uploadFile(file, uploadUrl, headers, (progress) => {
      onProgress?.(index, progress);
    }),
  );

  await Promise.all(uploadPromises);
}
