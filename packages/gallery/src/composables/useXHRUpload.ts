/**
 * XHR Upload Handler
 * Handles XMLHttpRequest upload operations
 */

import type { SingleFileUploadOptions } from "./useSingleFileUpload";

export async function performXHRUpload(
  file: File,
  formData: FormData,
  uploadId: string,
  options: SingleFileUploadOptions
): Promise<void> {
  const startTime = Date.now();
  const xhr = new XMLHttpRequest();

  setupProgressTracking(xhr, startTime, uploadId, options);
  return setupXHRHandlers(xhr, formData, uploadId, options);
}

function setupProgressTracking(
  xhr: XMLHttpRequest,
  startTime: number,
  uploadId: string,
  options: SingleFileUploadOptions
) {
  xhr.upload.addEventListener("progress", event => {
    if (event.lengthComputable) {
      const progress = Math.round((event.loaded / event.total) * 100);
      const currentTime = Date.now();
      const elapsed = (currentTime - startTime) / 1000;

      if (elapsed > 0) {
        const speed = event.loaded / elapsed;
        const remaining = (event.total - event.loaded) / speed;

        options.updateProgress(uploadId, {
          progress,
          speed,
          timeRemaining: remaining,
        });
      }
    }
  });
}

function setupXHRHandlers(
  xhr: XMLHttpRequest,
  formData: FormData,
  uploadId: string,
  options: SingleFileUploadOptions
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    xhr.onload = () => handleXHRLoad(xhr, uploadId, options, resolve, reject);
    xhr.onerror = () => handleXHRError(uploadId, options, reject);
    xhr.onabort = () => handleXHRAbort(uploadId, options, reject);

    Object.entries(options.config.headers || {}).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.open("POST", options.config.uploadUrl);
    xhr.send(formData);

    const controller = options.uploadControllers.get(uploadId);
    controller?.signal.addEventListener("abort", () => {
      xhr.abort();
    });
  });
}

function handleXHRLoad(
  xhr: XMLHttpRequest,
  uploadId: string,
  options: SingleFileUploadOptions,
  resolve: () => void,
  reject: (error: Error) => void
) {
  if (xhr.status >= 200 && xhr.status < 300) {
    options.updateProgress(uploadId, {
      progress: 100,
      status: "completed",
    });
    resolve();
  } else {
    const error = `Upload failed with status ${xhr.status}`;
    options.updateProgress(uploadId, {
      status: "error",
      error,
    });
    reject(new Error(error));
  }
}

function handleXHRError(uploadId: string, options: SingleFileUploadOptions, reject: (error: Error) => void) {
  const error = "Network error during upload";
  options.updateProgress(uploadId, {
    status: "error",
    error,
  });
  reject(new Error(error));
}

function handleXHRAbort(uploadId: string, options: SingleFileUploadOptions, reject: (error: Error) => void) {
  options.updateProgress(uploadId, {
    status: "cancelled",
  });
  reject(new Error("Upload cancelled"));
}
