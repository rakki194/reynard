/**
 * useScrapingJobs Composable
 * Manages scraping job state and operations
 */

import { createEffect, createSignal, onCleanup } from "solid-js";
import { createStore } from "solid-js/store";
import type { ScrapingApiRequest, ScrapingApiResponse, ScrapingEvent, ScrapingEventType, ScrapingJob } from "../types";

export interface UseScrapingJobsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onJobUpdate?: (job: ScrapingJob) => void;
  onJobComplete?: (job: ScrapingJob) => void;
  onJobError?: (job: ScrapingJob, error: string) => void;
}

export interface UseScrapingJobsReturn {
  jobs: ScrapingJob[];
  activeJobs: ScrapingJob[];
  completedJobs: ScrapingJob[];
  failedJobs: ScrapingJob[];
  isLoading: boolean;
  error: string | null;
  createJob: (request: ScrapingApiRequest) => Promise<ScrapingJob>;
  cancelJob: (jobId: string) => Promise<void>;
  retryJob: (jobId: string) => Promise<void>;
  deleteJob: (jobId: string) => Promise<void>;
  refreshJobs: () => Promise<void>;
  getJob: (jobId: string) => ScrapingJob | undefined;
}

export function useScrapingJobs(options: UseScrapingJobsOptions = {}): UseScrapingJobsReturn {
  const { autoRefresh = true, refreshInterval = 5000, onJobUpdate, onJobComplete, onJobError } = options;

  const [jobs, setJobs] = createStore<ScrapingJob[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Computed signals
  const activeJobs = () => jobs.filter(job => job.status === "pending" || job.status === "running");

  const completedJobs = () => jobs.filter(job => job.status === "completed");

  const failedJobs = () => jobs.filter(job => job.status === "failed");

  // WebSocket connection for real-time updates
  let ws: WebSocket | null = null;
  let refreshTimer: number | null = null;

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
        // Reconnect after 5 seconds
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
    const jobIndex = jobs.findIndex(job => job.id === event.jobId);
    if (jobIndex === -1) return;

    const job = jobs[jobIndex];

    switch (event.type) {
      case ScrapingEventType.JOB_PROGRESS:
        setJobs(jobIndex, "progress", event.data.progress);
        setJobs(jobIndex, "updatedAt", new Date());
        onJobUpdate?.(jobs[jobIndex]);
        break;

      case ScrapingEventType.JOB_COMPLETED:
        setJobs(jobIndex, "status", "completed");
        setJobs(jobIndex, "progress", 100);
        setJobs(jobIndex, "completedAt", new Date());
        setJobs(jobIndex, "updatedAt", new Date());
        onJobComplete?.(jobs[jobIndex]);
        break;

      case ScrapingEventType.JOB_FAILED:
        setJobs(jobIndex, "status", "failed");
        setJobs(jobIndex, "error", event.data.error);
        setJobs(jobIndex, "updatedAt", new Date());
        onJobError?.(jobs[jobIndex], event.data.error);
        break;
    }
  };

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/scraping/jobs");
      const result: ScrapingApiResponse<ScrapingJob[]> = await response.json();

      if (result.success && result.data) {
        setJobs(result.data);
      } else {
        setError(result.error || "Failed to fetch jobs");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const createJob = async (request: ScrapingApiRequest): Promise<ScrapingJob> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/scraping/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const result: ScrapingApiResponse<ScrapingJob> = await response.json();

      if (result.success && result.data) {
        setJobs(jobs.length, result.data);
        return result.data;
      } else {
        throw new Error(result.error || "Failed to create job");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelJob = async (jobId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/scraping/jobs/${jobId}/cancel`, {
        method: "POST",
      });

      const result: ScrapingApiResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to cancel job");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const retryJob = async (jobId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/scraping/jobs/${jobId}/retry`, {
        method: "POST",
      });

      const result: ScrapingApiResponse = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to retry job");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteJob = async (jobId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/scraping/jobs/${jobId}`, {
        method: "DELETE",
      });

      const result: ScrapingApiResponse = await response.json();

      if (result.success) {
        setJobs(jobs.filter(job => job.id !== jobId));
      } else {
        throw new Error(result.error || "Failed to delete job");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getJob = (jobId: string): ScrapingJob | undefined => {
    return jobs.find(job => job.id === jobId);
  };

  // Auto-refresh effect
  createEffect(() => {
    if (autoRefresh) {
      fetchJobs();
      connectWebSocket();

      refreshTimer = setInterval(fetchJobs, refreshInterval);
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
    jobs: jobs,
    activeJobs,
    completedJobs,
    failedJobs,
    isLoading,
    error,
    createJob,
    cancelJob,
    retryJob,
    deleteJob,
    refreshJobs: fetchJobs,
    getJob,
  };
}
