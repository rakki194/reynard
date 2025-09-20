/**
 * useScrapingProgress Composable
 * Tracks and manages scraping progress
 */

import { createEffect, createSignal, onCleanup } from "solid-js";
import type { ScrapingEvent, ScrapingEventType } from "../types";

export interface ProgressUpdate {
  jobId: string;
  progress: number;
  currentFile?: string;
  totalFiles?: number;
  downloadedFiles?: number;
  speed?: number;
  estimatedTime?: number;
  message?: string;
}

export interface UseScrapingProgressOptions {
  onProgressUpdate?: (update: ProgressUpdate) => void;
  onJobComplete?: (jobId: string) => void;
  onJobError?: (jobId: string, error: string) => void;
}

export interface UseScrapingProgressReturn {
  progress: Record<string, ProgressUpdate>;
  getProgress: (jobId: string) => ProgressUpdate | undefined;
  getOverallProgress: () => number;
  isJobActive: (jobId: string) => boolean;
  getActiveJobsCount: () => number;
}

export function useScrapingProgress(options: UseScrapingProgressOptions = {}): UseScrapingProgressReturn {
  const { onProgressUpdate, onJobComplete, onJobError } = options;

  const [progress, setProgress] = createSignal<Record<string, ProgressUpdate>>({});

  let ws: WebSocket | null = null;

  const connectWebSocket = () => {
    try {
      ws = new WebSocket(`ws://localhost:8000/api/scraping/events`);

      ws.onmessage = event => {
        try {
          const scrapingEvent: ScrapingEvent = JSON.parse(event.data);
          handleScrapingEvent(scrapingEvent);
        } catch (err) {
          console.error("Failed to parse scraping event:", err);
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

  const handleScrapingEvent = (event: ScrapingEvent) => {
    switch (event.type) {
      case ScrapingEventType.JOB_STARTED:
        setProgress(prev => ({
          ...prev,
          [event.jobId]: {
            jobId: event.jobId,
            progress: 0,
            message: "Starting...",
          },
        }));
        break;

      case ScrapingEventType.JOB_PROGRESS:
        const progressUpdate: ProgressUpdate = {
          jobId: event.jobId,
          progress: event.data.progress,
          currentFile: event.data.currentFile,
          totalFiles: event.data.totalFiles,
          downloadedFiles: event.data.downloadedFiles,
          speed: event.data.speed,
          estimatedTime: event.data.estimatedTime,
          message: event.data.message,
        };

        setProgress(prev => ({
          ...prev,
          [event.jobId]: progressUpdate,
        }));

        onProgressUpdate?.(progressUpdate);
        break;

      case ScrapingEventType.JOB_COMPLETED:
        setProgress(prev => ({
          ...prev,
          [event.jobId]: {
            ...prev[event.jobId],
            progress: 100,
            message: "Completed",
          },
        }));
        onJobComplete?.(event.jobId);
        break;

      case ScrapingEventType.JOB_FAILED:
        setProgress(prev => ({
          ...prev,
          [event.jobId]: {
            ...prev[event.jobId],
            message: `Failed: ${event.data.error}`,
          },
        }));
        onJobError?.(event.jobId, event.data.error);
        break;
    }
  };

  const getProgress = (jobId: string): ProgressUpdate | undefined => {
    return progress()[jobId];
  };

  const getOverallProgress = (): number => {
    const progressData = progress();
    const jobIds = Object.keys(progressData);

    if (jobIds.length === 0) return 0;

    const totalProgress = jobIds.reduce((sum, jobId) => {
      return sum + (progressData[jobId]?.progress || 0);
    }, 0);

    return totalProgress / jobIds.length;
  };

  const isJobActive = (jobId: string): boolean => {
    const jobProgress = progress()[jobId];
    return jobProgress !== undefined && jobProgress.progress < 100;
  };

  const getActiveJobsCount = (): number => {
    const progressData = progress();
    return Object.values(progressData).filter(p => p.progress < 100 && !p.message?.includes("Failed")).length;
  };

  createEffect(() => {
    connectWebSocket();

    return () => {
      if (ws) {
        ws.close();
      }
    };
  });

  onCleanup(() => {
    if (ws) {
      ws.close();
    }
  });

  return {
    progress: progress(),
    getProgress,
    getOverallProgress,
    isJobActive,
    getActiveJobsCount,
  };
}
