/**
 * useComfy Composable
 *
 * Main composable for ComfyUI integration and workflow management.
 */

import { createSignal, createEffect, onCleanup } from "solid-js";
import { ComfyService } from "../services/ComfyService.js";
import type {
  ComfyJob,
  ComfyJobResult,
  ComfyImage,
  ComfyText2ImgParams,
  ComfyValidationResult,
  ComfyQueueStatus,
  ComfyQueueItem,
  ComfyHealthStatus,
  ComfyIngestResult,
  ComfyStreamEvent,
  ComfyPreset,
  ComfyWorkflowTemplate,
} from "../types/index.js";

export function useComfy() {
  const [service] = createSignal(new ComfyService());
  const [health, setHealth] = createSignal<ComfyHealthStatus | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  // Health monitoring
  createEffect(() => {
    const checkHealth = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const healthStatus = await service().getHealth();
        setHealth(healthStatus);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Health check failed");
      } finally {
        setIsLoading(false);
      }
    };

    checkHealth();

    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    onCleanup(() => {
      clearInterval(interval);
      service().cleanup();
    });
  });

  // Queue workflow
  const queueWorkflow = async (
    workflow: Record<string, unknown>,
    clientId?: string,
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await service().queueWorkflow(workflow, clientId);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to queue workflow");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Get status
  const getStatus = async (promptId: string) => {
    try {
      setError(null);
      return await service().getStatus(promptId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get status");
      throw err;
    }
  };

  // Get history
  const getHistory = async (promptId: string) => {
    try {
      setError(null);
      return await service().getHistory(promptId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get history");
      throw err;
    }
  };

  // Get object info
  const getObjectInfo = async (refresh = false) => {
    try {
      setError(null);
      return await service().getObjectInfo(refresh);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get object info",
      );
      throw err;
    }
  };

  // Get image
  const getImage = async (
    filename: string,
    subfolder = "",
    type = "output",
  ) => {
    try {
      setError(null);
      return await service().getImage(filename, subfolder, type);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to get image");
      throw err;
    }
  };

  // Text to image
  const textToImage = async (params: ComfyText2ImgParams) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await service().textToImage(params);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate image");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Ingest image
  const ingestImage = async (
    file: File,
    promptId: string,
    workflow: Record<string, unknown>,
    metadata: Record<string, unknown> = {},
  ) => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await service().ingestImage(
        file,
        promptId,
        workflow,
        metadata,
      );
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ingest image");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Stream status
  const streamStatus = (
    promptId: string,
    onEvent: (event: ComfyStreamEvent) => void,
  ) => {
    try {
      setError(null);
      return service().streamStatus(promptId, onEvent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to stream status");
      throw err;
    }
  };

  // Validation methods
  const validateCheckpoint = async (checkpoint: string) => {
    try {
      setError(null);
      return await service().validateCheckpoint(checkpoint);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to validate checkpoint",
      );
      throw err;
    }
  };

  const validateLora = async (lora: string) => {
    try {
      setError(null);
      return await service().validateLora(lora);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to validate LoRA");
      throw err;
    }
  };

  const validateSampler = async (sampler: string) => {
    try {
      setError(null);
      return await service().validateSampler(sampler);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to validate sampler",
      );
      throw err;
    }
  };

  const validateScheduler = async (scheduler: string) => {
    try {
      setError(null);
      return await service().validateScheduler(scheduler);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to validate scheduler",
      );
      throw err;
    }
  };

  // Queue management
  const getQueueStatus = async () => {
    try {
      setError(null);
      return await service().getQueueStatus();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get queue status",
      );
      throw err;
    }
  };

  const getQueueItems = async () => {
    try {
      setError(null);
      return await service().getQueueItems();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get queue items",
      );
      throw err;
    }
  };

  const clearQueueItem = async (promptId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await service().clearQueueItem(promptId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to clear queue item",
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllQueueItems = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await service().clearAllQueueItems();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to clear all queue items",
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const pauseQueue = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await service().pauseQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to pause queue");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const resumeQueue = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await service().resumeQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resume queue");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const moveQueueItem = async (promptId: string, position: number) => {
    try {
      setIsLoading(true);
      setError(null);
      await service().moveQueueItem(promptId, position);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to move queue item",
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    health,
    isLoading,
    error,

    // Core methods
    queueWorkflow,
    getStatus,
    getHistory,
    getObjectInfo,
    getImage,
    textToImage,
    ingestImage,
    streamStatus,

    // Validation
    validateCheckpoint,
    validateLora,
    validateSampler,
    validateScheduler,

    // Queue management
    getQueueStatus,
    getQueueItems,
    clearQueueItem,
    clearAllQueueItems,
    pauseQueue,
    resumeQueue,
    moveQueueItem,
  };
}
