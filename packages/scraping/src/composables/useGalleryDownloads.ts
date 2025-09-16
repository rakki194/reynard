/**
 * useGalleryDownloads Composable
 * Manages gallery-dl download operations
 */

import { createEffect, createSignal, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import type { DownloadProgress, GalleryConfig, GalleryDownloadJob } from "../types";

export interface UseGalleryDownloadsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onDownloadComplete?: (job: GalleryDownloadJob) => void;
  onDownloadError?: (job: GalleryDownloadJob, error: string) => void;
}

export interface UseGalleryDownloadsReturn {
  downloads: GalleryDownloadJob[];
  activeDownloads: GalleryDownloadJob[];
  completedDownloads: GalleryDownloadJob[];
  failedDownloads: GalleryDownloadJob[];
  isLoading: boolean;
  error: string | null;
  startDownload: (url: string, config?: Partial<GalleryConfig>) => Promise<GalleryDownloadJob>;
  cancelDownload: (jobId: string) => Promise<void>;
  pauseDownload: (jobId: string) => Promise<void>;
  resumeDownload: (jobId: string) => Promise<void>;
  deleteDownload: (jobId: string) => Promise<void>;
  getDownload: (jobId: string) => GalleryDownloadJob | undefined;
  getDownloadProgress: (jobId: string) => DownloadProgress | undefined;
  refreshDownloads: () => Promise<void>;
}

export function useGalleryDownloads(options: UseGalleryDownloadsOptions = {}): UseGalleryDownloadsReturn {
  const { autoRefresh = true, refreshInterval = 2000, onDownloadComplete, onDownloadError } = options;

  const [downloads, setDownloads] = createStore<GalleryDownloadJob[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Computed signals
  const activeDownloads = () =>
    downloads.filter(download => download.status === "pending" || download.status === "downloading");

  const completedDownloads = () => downloads.filter(download => download.status === "completed");

  const failedDownloads = () => downloads.filter(download => download.status === "failed");

  let ws: WebSocket | null = null;
  let refreshTimer: number | null = null;

  const connectWebSocket = () => {
    try {
      ws = new WebSocket(`ws://localhost:8000/api/gallery/events`);

      ws.onmessage = event => {
        try {
          const data = JSON.parse(event.data);
          handleDownloadEvent(data);
        } catch (err) {
          console.error("Failed to parse download event:", err);
        }
      };

      ws.onclose = () => {
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = err => {
        console.error("WebSocket error:", err);
      };
    } catch (err) {
      console.error("Failed to connect to WebSocket:", err);
    }
  };

  const handleDownloadEvent = (event: any) => {
    const downloadIndex = downloads.findIndex(d => d.id === event.jobId);
    if (downloadIndex === -1) return;

    switch (event.type) {
      case "download_progress":
        setDownloads(downloadIndex, "progress", event.data);
        setDownloads(downloadIndex, "updatedAt", new Date());
        break;

      case "download_completed":
        setDownloads(downloadIndex, "status", "completed");
        setDownloads(downloadIndex, "progress", { ...downloads[downloadIndex].progress, percentage: 100 });
        setDownloads(downloadIndex, "updatedAt", new Date());
        onDownloadComplete?.(downloads[downloadIndex]);
        break;

      case "download_failed":
        setDownloads(downloadIndex, "status", "failed");
        setDownloads(downloadIndex, "error", event.data.error);
        setDownloads(downloadIndex, "updatedAt", new Date());
        onDownloadError?.(downloads[downloadIndex], event.data.error);
        break;
    }
  };

  const fetchDownloads = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/gallery/downloads");
      const result = await response.json();

      if (result.success && result.data) {
        setDownloads(result.data);
      } else {
        setError(result.error || "Failed to fetch downloads");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const startDownload = async (url: string, config?: Partial<GalleryConfig>): Promise<GalleryDownloadJob> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/gallery/downloads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url,
          config: config || {},
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setDownloads(downloads.length, result.data);
        return result.data;
      } else {
        throw new Error(result.error || "Failed to start download");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDownload = async (jobId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/gallery/downloads/${jobId}/cancel`, {
        method: "POST",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to cancel download");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const pauseDownload = async (jobId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/gallery/downloads/${jobId}/pause`, {
        method: "POST",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to pause download");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resumeDownload = async (jobId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/gallery/downloads/${jobId}/resume`, {
        method: "POST",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to resume download");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteDownload = async (jobId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/gallery/downloads/${jobId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setDownloads(downloads.filter(d => d.id !== jobId));
      } else {
        throw new Error(result.error || "Failed to delete download");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getDownload = (jobId: string): GalleryDownloadJob | undefined => {
    return downloads.find(d => d.id === jobId);
  };

  const getDownloadProgress = (jobId: string): DownloadProgress | undefined => {
    const download = downloads.find(d => d.id === jobId);
    return download?.progress;
  };

  createEffect(() => {
    if (autoRefresh) {
      fetchDownloads();
      connectWebSocket();

      refreshTimer = setInterval(fetchDownloads, refreshInterval);
    }

    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
      if (ws) {
        ws.close();
      }
    };
  });

  onCleanup(() => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
    }
    if (ws) {
      ws.close();
    }
  });

  return {
    downloads: downloads,
    activeDownloads,
    completedDownloads,
    failedDownloads,
    isLoading,
    error,
    startDownload,
    cancelDownload,
    pauseDownload,
    resumeDownload,
    deleteDownload,
    getDownload,
    getDownloadProgress,
    refreshDownloads: fetchDownloads,
  };
}
