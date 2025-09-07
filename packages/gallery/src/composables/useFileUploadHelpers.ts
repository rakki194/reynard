/**
 * FileUpload Helpers
 * Helper functions for the main useFileUpload composable
 */

import type { UploadProgress, GalleryCallbacks } from "../types";

export function createUpdateProgressFunction(
  setUploads: (uploads: UploadProgress[] | ((prev: UploadProgress[]) => UploadProgress[])) => void,
  getUploads: () => UploadProgress[],
  callbacks?: Pick<GalleryCallbacks, "onUploadProgress">
) {
  return (uploadId: string, updates: Partial<UploadProgress>) => {
    setUploads((prev) =>
      prev.map((upload) =>
        upload.id === uploadId ? { ...upload, ...updates } : upload,
      ),
    );
    callbacks?.onUploadProgress?.(getUploads());
  };
}
