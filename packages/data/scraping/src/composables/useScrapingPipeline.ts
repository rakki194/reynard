/**
 * useScrapingPipeline Composable
 * Manages scraping processing pipelines
 */

import { createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
import type { PipelineConfig, ProcessingPipeline } from "../types";

export interface UseScrapingPipelineOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseScrapingPipelineReturn {
  pipelines: ProcessingPipeline[];
  activePipelines: ProcessingPipeline[];
  isLoading: boolean;
  error: string | null;
  createPipeline: (name: string, config: PipelineConfig) => Promise<ProcessingPipeline>;
  startPipeline: (pipelineId: string) => Promise<void>;
  stopPipeline: (pipelineId: string) => Promise<void>;
  pausePipeline: (pipelineId: string) => Promise<void>;
  resumePipeline: (pipelineId: string) => Promise<void>;
  deletePipeline: (pipelineId: string) => Promise<void>;
  getPipeline: (pipelineId: string) => ProcessingPipeline | undefined;
  refreshPipelines: () => Promise<void>;
}

export function useScrapingPipeline(options: UseScrapingPipelineOptions = {}): UseScrapingPipelineReturn {
  const { autoRefresh = true, refreshInterval = 5000 } = options;

  const [pipelines, setPipelines] = createStore<ProcessingPipeline[]>([]);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  let refreshTimer: number | null = null;

  const activePipelines = () =>
    pipelines.filter(pipeline => pipeline.status === "running" || pipeline.status === "paused");

  const fetchPipelines = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/scraping/pipelines");
      const result = await response.json();

      if (result.success && result.data) {
        setPipelines(result.data);
      } else {
        setError(result.error || "Failed to fetch pipelines");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  };

  const createPipeline = async (name: string, config: PipelineConfig): Promise<ProcessingPipeline> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/scraping/pipelines", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          config,
        }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        setPipelines(pipelines.length, result.data);
        return result.data;
      } else {
        throw new Error(result.error || "Failed to create pipeline");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const startPipeline = async (pipelineId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/scraping/pipelines/${pipelineId}/start`, {
        method: "POST",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to start pipeline");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const stopPipeline = async (pipelineId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/scraping/pipelines/${pipelineId}/stop`, {
        method: "POST",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to stop pipeline");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const pausePipeline = async (pipelineId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/scraping/pipelines/${pipelineId}/pause`, {
        method: "POST",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to pause pipeline");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const resumePipeline = async (pipelineId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/scraping/pipelines/${pipelineId}/resume`, {
        method: "POST",
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to resume pipeline");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deletePipeline = async (pipelineId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/scraping/pipelines/${pipelineId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setPipelines(pipelines.filter(p => p.id !== pipelineId));
      } else {
        throw new Error(result.error || "Failed to delete pipeline");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getPipeline = (pipelineId: string): ProcessingPipeline | undefined => {
    return pipelines.find(p => p.id === pipelineId);
  };

  createEffect(() => {
    if (autoRefresh) {
      fetchPipelines();
      refreshTimer = setInterval(fetchPipelines, refreshInterval);
    }

    return () => {
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  });

  return {
    pipelines: pipelines,
    activePipelines,
    isLoading,
    error,
    createPipeline,
    startPipeline,
    stopPipeline,
    pausePipeline,
    resumePipeline,
    deletePipeline,
    getPipeline,
    refreshPipelines: fetchPipelines,
  };
}
