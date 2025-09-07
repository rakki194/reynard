/**
 * Upload Statistics
 * Computes upload statistics and progress metrics
 */

import type { UploadProgress } from "../types";

export interface UploadStats {
  total: number;
  completed: number;
  failed: number;
  cancelled: number;
  inProgress: number;
  totalProgress: number;
}

export function useUploadStats() {
  const getUploadStats = (uploads: UploadProgress[]): UploadStats => {
    const total = uploads.length;
    const completed = uploads.filter((u) => u.status === "completed").length;
    const failed = uploads.filter((u) => u.status === "error").length;
    const cancelled = uploads.filter((u) => u.status === "cancelled").length;
    const inProgress = uploads.filter((u) => u.status === "uploading").length;

    const totalProgress =
      total > 0
        ? uploads.reduce((sum, upload) => sum + upload.progress, 0) / total
        : 0;

    return {
      total,
      completed,
      failed,
      cancelled,
      inProgress,
      totalProgress,
    };
  };

  return { getUploadStats };
}
