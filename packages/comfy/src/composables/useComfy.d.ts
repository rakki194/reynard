/**
 * useComfy Composable
 *
 * Main composable for ComfyUI integration and workflow management.
 */
import type { ComfyJob, ComfyJobResult, ComfyImage, ComfyText2ImgParams, ComfyValidationResult, ComfyQueueStatus, ComfyQueueItem, ComfyHealthStatus, ComfyIngestResult, ComfyStreamEvent } from "../types/index.js";
export declare function useComfy(): {
    health: import("solid-js").Accessor<ComfyHealthStatus | null>;
    isLoading: import("solid-js").Accessor<boolean>;
    error: import("solid-js").Accessor<string | null>;
    queueWorkflow: (workflow: Record<string, unknown>, clientId?: string) => Promise<{
        promptId: string;
        clientId?: string;
    }>;
    getStatus: (promptId: string) => Promise<ComfyJob>;
    getHistory: (promptId: string) => Promise<ComfyJobResult>;
    getObjectInfo: (refresh?: boolean) => Promise<Record<string, unknown>>;
    getImage: (filename: string, subfolder?: string, type?: string) => Promise<ComfyImage>;
    textToImage: (params: ComfyText2ImgParams) => Promise<{
        promptId: string;
    }>;
    ingestImage: (file: File, promptId: string, workflow: Record<string, unknown>, metadata?: Record<string, unknown>) => Promise<ComfyIngestResult>;
    streamStatus: (promptId: string, onEvent: (event: ComfyStreamEvent) => void) => () => void;
    validateCheckpoint: (checkpoint: string) => Promise<ComfyValidationResult>;
    validateLora: (lora: string) => Promise<ComfyValidationResult>;
    validateSampler: (sampler: string) => Promise<ComfyValidationResult>;
    validateScheduler: (scheduler: string) => Promise<ComfyValidationResult>;
    getQueueStatus: () => Promise<ComfyQueueStatus>;
    getQueueItems: () => Promise<ComfyQueueItem[]>;
    clearQueueItem: (promptId: string) => Promise<void>;
    clearAllQueueItems: () => Promise<void>;
    pauseQueue: () => Promise<void>;
    resumeQueue: () => Promise<void>;
    moveQueueItem: (promptId: string, position: number) => Promise<void>;
};
