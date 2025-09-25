/**
 * 🦊 Training Progress Hook
 *
 * Hook for managing training progress state and real-time updates
 * following Reynard's composable patterns.
 */

import { createSignal, createEffect, onCleanup } from "solid-js";

export interface TrainingProgressData {
  id: string;
  status: "running" | "completed" | "failed" | "paused" | "queued";
  progress: number; // 0-100
  currentEpoch: number;
  totalEpochs: number;
  startTime: string;
  endTime?: string;
  metrics: {
    loss: number;
    learningRate: number;
    gpuMemory: number;
    cpuUsage?: number;
    gpuUtilization?: number;
    gpuTemperature?: number;
    throughput?: number;
  };
  estimatedTimeRemaining?: number;
  currentSpeed?: number;
}

export interface UseTrainingProgressOptions {
  trainingId?: string;
  refreshInterval?: number;
  onProgressUpdate?: (data: TrainingProgressData) => void;
  onStatusChange?: (status: string) => void;
  onError?: (error: Error) => void;
}

export interface UseTrainingProgressReturn {
  progress: () => TrainingProgressData | null;
  isLoading: () => boolean;
  error: () => string | null;
  refresh: () => Promise<void>;
  start: (config: any) => Promise<void>;
  stop: () => Promise<void>;
  pause: () => Promise<void>;
  resume: () => Promise<void>;
}

export const useTrainingProgress = (options: UseTrainingProgressOptions = {}): UseTrainingProgressReturn => {
  const [progress, setProgress] = createSignal<TrainingProgressData | null>(null);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);

  let refreshInterval: NodeJS.Timeout | undefined;
  let websocket: WebSocket | undefined;

  // Initialize progress data
  const initializeProgress = () => {
    if (options.trainingId) {
      // Load existing training progress
      loadProgress();
    }
  };

  // Load progress from API
  const loadProgress = async () => {
    if (!options.trainingId) return;

    setIsLoading(true);
    setError(null);

    try {
      // This would typically call the API client
      // const client = createDiffusionPipeClient();
      // const data = await client.getTrainingProgress(options.trainingId);
      // setProgress(data);

      // Mock data for now
      const mockData: TrainingProgressData = {
        id: options.trainingId,
        status: "running",
        progress: 45,
        currentEpoch: 450,
        totalEpochs: 1000,
        startTime: new Date().toISOString(),
        metrics: {
          loss: 0.123456,
          learningRate: 2.5e-4,
          gpuMemory: 8.5 * 1024 * 1024 * 1024, // 8.5 GB
          cpuUsage: 65,
          gpuUtilization: 85,
          gpuTemperature: 72,
          throughput: 2.3,
        },
        estimatedTimeRemaining: 3600, // 1 hour
        currentSpeed: 0.45, // epochs per second
      };

      setProgress(mockData);
      options.onProgressUpdate?.(mockData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load training progress";
      setError(errorMessage);
      options.onError?.(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to WebSocket for real-time updates
  const connectWebSocket = () => {
    if (!options.trainingId) return;

    try {
      // This would typically connect to the WebSocket endpoint
      // websocket = new WebSocket(`ws://localhost:8000/ws/training/${options.trainingId}`);

      // Mock WebSocket connection for now
      websocket = new WebSocket("ws://localhost:8000/ws/training/mock");

      websocket.onopen = () => {
        console.log("Training progress WebSocket connected");
      };

      websocket.onmessage = event => {
        try {
          const data = JSON.parse(event.data);

          if (data.type === "progress_update") {
            const updatedProgress: TrainingProgressData = {
              id: data.trainingId,
              status: data.status,
              progress: data.progress,
              currentEpoch: data.currentEpoch,
              totalEpochs: data.totalEpochs,
              startTime: data.startTime,
              endTime: data.endTime,
              metrics: data.metrics,
              estimatedTimeRemaining: data.estimatedTimeRemaining,
              currentSpeed: data.currentSpeed,
            };

            setProgress(updatedProgress);
            options.onProgressUpdate?.(updatedProgress);

            // Notify status change
            if (data.status !== progress()?.status) {
              options.onStatusChange?.(data.status);
            }
          }
        } catch (err) {
          console.error("Failed to parse WebSocket message:", err);
        }
      };

      websocket.onerror = err => {
        console.error("Training progress WebSocket error:", err);
        setError("WebSocket connection error");
      };

      websocket.onclose = () => {
        console.log("Training progress WebSocket disconnected");
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (options.trainingId) {
            connectWebSocket();
          }
        }, 5000);
      };
    } catch (err) {
      console.error("Failed to connect to training progress WebSocket:", err);
      setError("Failed to connect to real-time updates");
    }
  };

  // Disconnect WebSocket
  const disconnectWebSocket = () => {
    if (websocket) {
      websocket.close();
      websocket = undefined;
    }
  };

  // Start training
  const start = async (config: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // This would typically call the API client
      // const client = createDiffusionPipeClient();
      // const result = await client.startTraining(config);
      // setProgress(result);

      // Mock training start
      const mockData: TrainingProgressData = {
        id: `training-${Date.now()}`,
        status: "running",
        progress: 0,
        currentEpoch: 0,
        totalEpochs: config.epochs || 1000,
        startTime: new Date().toISOString(),
        metrics: {
          loss: 0,
          learningRate: config.learningRate || 2.5e-4,
          gpuMemory: 0,
          cpuUsage: 0,
          gpuUtilization: 0,
          gpuTemperature: 0,
          throughput: 0,
        },
      };

      setProgress(mockData);
      options.onProgressUpdate?.(mockData);
      options.onStatusChange?.("running");

      // Connect to WebSocket for real-time updates
      connectWebSocket();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to start training";
      setError(errorMessage);
      options.onError?.(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  // Stop training
  const stop = async () => {
    if (!progress()) return;

    setIsLoading(true);
    setError(null);

    try {
      // This would typically call the API client
      // const client = createDiffusionPipeClient();
      // await client.stopTraining(progress()!.id);

      // Mock training stop
      setProgress(prev => (prev ? { ...prev, status: "failed" } : null));
      options.onStatusChange?.("failed");
      disconnectWebSocket();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to stop training";
      setError(errorMessage);
      options.onError?.(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  // Pause training
  const pause = async () => {
    if (!progress()) return;

    setIsLoading(true);
    setError(null);

    try {
      // This would typically call the API client
      // const client = createDiffusionPipeClient();
      // await client.pauseTraining(progress()!.id);

      // Mock training pause
      setProgress(prev => (prev ? { ...prev, status: "paused" } : null));
      options.onStatusChange?.("paused");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to pause training";
      setError(errorMessage);
      options.onError?.(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  // Resume training
  const resume = async () => {
    if (!progress()) return;

    setIsLoading(true);
    setError(null);

    try {
      // This would typically call the API client
      // const client = createDiffusionPipeClient();
      // await client.resumeTraining(progress()!.id);

      // Mock training resume
      setProgress(prev => (prev ? { ...prev, status: "running" } : null));
      options.onStatusChange?.("running");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to resume training";
      setError(errorMessage);
      options.onError?.(new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh progress
  const refresh = async () => {
    await loadProgress();
  };

  // Set up auto-refresh
  createEffect(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }

    if (options.refreshInterval && options.refreshInterval > 0) {
      refreshInterval = setInterval(() => {
        refresh();
      }, options.refreshInterval);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  });

  // Initialize on mount
  createEffect(() => {
    initializeProgress();
  });

  // Cleanup on unmount
  onCleanup(() => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    disconnectWebSocket();
  });

  return {
    progress,
    isLoading,
    error,
    refresh,
    start,
    stop,
    pause,
    resume,
  };
};
