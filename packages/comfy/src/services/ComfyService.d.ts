/**
 * ComfyUI Service
 *
 * Main service class for ComfyUI integration and workflow management.
 */
import { createReynardApiClient } from "reynard-api-client";
import type { ComfyJob, ComfyJobResult, ComfyImage, ComfyText2ImgParams, ComfyValidationResult, ComfyQueueStatus, ComfyQueueItem, ComfyHealthStatus, ComfyIngestResult, ComfyStreamEvent, ComfyPreset, ComfyWorkflowTemplate } from "../types/index.js";
export declare class ComfyService {
    private apiClient;
    private eventSource;
    constructor(apiClient?: ReturnType<typeof createReynardApiClient>);
    /**
     * Check ComfyUI service health
     */
    getHealth(): Promise<ComfyHealthStatus>;
    /**
     * Force a health check
     */
    forceHealthCheck(): Promise<ComfyHealthStatus>;
    /**
     * Queue a workflow for execution
     */
    queueWorkflow(workflow: Record<string, unknown>, clientId?: string): Promise<{
        promptId: string;
        clientId?: string;
    }>;
    /**
     * Get the status of a queued prompt
     */
    getStatus(promptId: string): Promise<ComfyJob>;
    /**
     * Get the history for a prompt
     */
    getHistory(promptId: string): Promise<ComfyJobResult>;
    /**
     * Get ComfyUI object information
     */
    getObjectInfo(refresh?: boolean): Promise<Record<string, unknown>>;
    /**
     * View a generated image
     */
    getImage(filename: string, subfolder?: string, type?: string): Promise<ComfyImage>;
    /**
     * Generate an image from text
     */
    textToImage(params: ComfyText2ImgParams): Promise<{
        promptId: string;
    }>;
    /**
     * Ingest a generated image
     */
    ingestImage(file: File, promptId: string, workflow: Record<string, unknown>, metadata?: Record<string, unknown>): Promise<ComfyIngestResult>;
    /**
     * Stream status updates for a prompt
     */
    streamStatus(promptId: string, onEvent: (event: ComfyStreamEvent) => void): () => void;
    /**
     * Validate checkpoint
     */
    validateCheckpoint(checkpoint: string): Promise<ComfyValidationResult>;
    /**
     * Validate LoRA
     */
    validateLora(lora: string): Promise<ComfyValidationResult>;
    /**
     * Validate sampler
     */
    validateSampler(sampler: string): Promise<ComfyValidationResult>;
    /**
     * Validate scheduler
     */
    validateScheduler(scheduler: string): Promise<ComfyValidationResult>;
    /**
     * Get queue status
     */
    getQueueStatus(): Promise<ComfyQueueStatus>;
    /**
     * Get queue items
     */
    getQueueItems(): Promise<ComfyQueueItem[]>;
    /**
     * Clear a queue item
     */
    clearQueueItem(promptId: string): Promise<void>;
    /**
     * Clear all queue items
     */
    clearAllQueueItems(): Promise<void>;
    /**
     * Pause the queue
     */
    pauseQueue(): Promise<void>;
    /**
     * Resume the queue
     */
    resumeQueue(): Promise<void>;
    /**
     * Move a queue item
     */
    moveQueueItem(promptId: string, position: number): Promise<void>;
    /**
     * Get presets
     */
    getPresets(): Promise<ComfyPreset[]>;
    /**
     * Create a preset
     */
    createPreset(preset: Omit<ComfyPreset, "createdAt" | "updatedAt" | "createdBy">): Promise<ComfyPreset>;
    /**
     * Delete a preset
     */
    deletePreset(name: string): Promise<void>;
    /**
     * Set default preset
     */
    setDefaultPreset(name: string): Promise<void>;
    /**
     * Import a preset
     */
    importPreset(preset: Omit<ComfyPreset, "createdAt" | "updatedAt" | "createdBy">): Promise<ComfyPreset>;
    /**
     * Get workflow templates
     */
    getWorkflowTemplates(filters?: {
        category?: string;
        author?: string;
        visibility?: string;
        tags?: string;
        isCommunity?: boolean;
    }): Promise<ComfyWorkflowTemplate[]>;
    /**
     * Get a specific workflow template
     */
    getWorkflowTemplate(templateId: string): Promise<ComfyWorkflowTemplate>;
    /**
     * Create a workflow template
     */
    createWorkflowTemplate(template: Omit<ComfyWorkflowTemplate, "id" | "createdAt" | "updatedAt" | "usageCount">): Promise<ComfyWorkflowTemplate>;
    /**
     * Update a workflow template
     */
    updateWorkflowTemplate(templateId: string, updates: Partial<ComfyWorkflowTemplate>): Promise<ComfyWorkflowTemplate>;
    /**
     * Delete a workflow template
     */
    deleteWorkflowTemplate(templateId: string): Promise<void>;
    /**
     * Search workflow templates
     */
    searchWorkflowTemplates(query: string, filters?: {
        category?: string;
        tags?: string;
    }): Promise<ComfyWorkflowTemplate[]>;
    /**
     * Get community templates
     */
    getCommunityTemplates(limit?: number): Promise<ComfyWorkflowTemplate[]>;
    /**
     * Rate a template
     */
    rateTemplate(templateId: string, rating: number): Promise<void>;
    /**
     * Export a template
     */
    exportTemplate(templateId: string): Promise<Record<string, unknown>>;
    /**
     * Import a template
     */
    importTemplate(templateData: Record<string, unknown>, visibility?: string): Promise<ComfyWorkflowTemplate>;
    /**
     * Get template statistics
     */
    getTemplateStats(): Promise<Record<string, unknown>>;
    /**
     * Cleanup resources
     */
    cleanup(): void;
}
