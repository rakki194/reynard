/**
 * ComfyUI Service
 *
 * Main service class for ComfyUI integration and workflow management.
 */

import { createReynardApiClient } from "reynard-api-client";
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

export class ComfyService {
  private apiClient: ReturnType<typeof createReynardApiClient>;
  private eventSource: EventSource | null = null;

  constructor(apiClient?: ReturnType<typeof createReynardApiClient>) {
    this.apiClient = apiClient || createReynardApiClient();
  }

  /**
   * Check ComfyUI service health
   */
  async getHealth(): Promise<ComfyHealthStatus> {
    const response = await this.apiClient.comfy.health();
    return response.data;
  }

  /**
   * Force a health check
   */
  async forceHealthCheck(): Promise<ComfyHealthStatus> {
    const response = await this.apiClient.comfy.forceHealthCheck();
    return response.data;
  }

  /**
   * Queue a workflow for execution
   */
  async queueWorkflow(
    workflow: Record<string, unknown>,
    clientId?: string
  ): Promise<{ promptId: string; clientId?: string }> {
    const response = await this.apiClient.comfy.queue({
      workflow,
      client_id: clientId,
    });
    return response.data;
  }

  /**
   * Get the status of a queued prompt
   */
  async getStatus(promptId: string): Promise<ComfyJob> {
    const response = await this.apiClient.comfy.getStatus(promptId);
    return {
      id: promptId,
      timestamp: new Date(),
      status: response.data.status as any,
      progress: response.data.progress,
      message: response.data.message,
      error: response.data.error,
    };
  }

  /**
   * Get the history for a prompt
   */
  async getHistory(promptId: string): Promise<ComfyJobResult> {
    const response = await this.apiClient.comfy.getHistory(promptId);
    return {
      id: promptId,
      status: response.data.status as "completed" | "failed",
      outputs: response.data.items || {},
      error: response.data.status === "error" ? "Job failed" : undefined,
      completedAt: new Date(),
    };
  }

  /**
   * Get ComfyUI object information
   */
  async getObjectInfo(refresh = false): Promise<Record<string, unknown>> {
    const response = await this.apiClient.comfy.getObjectInfo({ refresh });
    return response.data;
  }

  /**
   * View a generated image
   */
  async getImage(filename: string, subfolder = "", type = "output"): Promise<ComfyImage> {
    const response = await this.apiClient.comfy.viewImage(filename, subfolder, type);
    return {
      filename,
      subfolder,
      type: type as "output" | "input" | "temp",
      url: URL.createObjectURL(response.data),
    };
  }

  /**
   * Generate an image from text
   */
  async textToImage(params: ComfyText2ImgParams): Promise<{ promptId: string }> {
    const response = await this.apiClient.comfy.text2img(params);
    return { promptId: response.data.prompt_id };
  }

  /**
   * Ingest a generated image
   */
  async ingestImage(
    file: File,
    promptId: string,
    workflow: Record<string, unknown>,
    metadata: Record<string, unknown> = {}
  ): Promise<ComfyIngestResult> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt_id", promptId);
    formData.append("workflow", JSON.stringify(workflow));
    formData.append("metadata", JSON.stringify(metadata));

    const response = await this.apiClient.comfy.ingest(formData);
    return response.data;
  }

  /**
   * Stream status updates for a prompt
   */
  streamStatus(promptId: string, onEvent: (event: ComfyStreamEvent) => void): () => void {
    if (this.eventSource) {
      this.eventSource.close();
    }

    this.eventSource = new EventSource(`/api/comfy/stream/${promptId}`);

    this.eventSource.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        onEvent(data);
      } catch (error) {
        console.error("Failed to parse stream event:", error);
      }
    };

    this.eventSource.onerror = error => {
      console.error("ComfyUI stream error:", error);
      onEvent({ type: "error", message: "Stream connection failed" });
    };

    // Return cleanup function
    return () => {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
    };
  }

  /**
   * Validate checkpoint
   */
  async validateCheckpoint(checkpoint: string): Promise<ComfyValidationResult> {
    const response = await this.apiClient.comfy.validateCheckpoint(checkpoint);
    return response.data;
  }

  /**
   * Validate LoRA
   */
  async validateLora(lora: string): Promise<ComfyValidationResult> {
    const response = await this.apiClient.comfy.validateLora(lora);
    return response.data;
  }

  /**
   * Validate sampler
   */
  async validateSampler(sampler: string): Promise<ComfyValidationResult> {
    const response = await this.apiClient.comfy.validateSampler(sampler);
    return response.data;
  }

  /**
   * Validate scheduler
   */
  async validateScheduler(scheduler: string): Promise<ComfyValidationResult> {
    const response = await this.apiClient.comfy.validateScheduler(scheduler);
    return response.data;
  }

  /**
   * Get queue status
   */
  async getQueueStatus(): Promise<ComfyQueueStatus> {
    const response = await this.apiClient.comfy.getQueueStatus();
    return response.data;
  }

  /**
   * Get queue items
   */
  async getQueueItems(): Promise<ComfyQueueItem[]> {
    const response = await this.apiClient.comfy.getQueueItems();
    return response.data.items || [];
  }

  /**
   * Clear a queue item
   */
  async clearQueueItem(promptId: string): Promise<void> {
    await this.apiClient.comfy.clearQueueItem(promptId);
  }

  /**
   * Clear all queue items
   */
  async clearAllQueueItems(): Promise<void> {
    await this.apiClient.comfy.clearAllQueueItems();
  }

  /**
   * Pause the queue
   */
  async pauseQueue(): Promise<void> {
    await this.apiClient.comfy.pauseQueue();
  }

  /**
   * Resume the queue
   */
  async resumeQueue(): Promise<void> {
    await this.apiClient.comfy.resumeQueue();
  }

  /**
   * Move a queue item
   */
  async moveQueueItem(promptId: string, position: number): Promise<void> {
    await this.apiClient.comfy.moveQueueItem(promptId, { position });
  }

  /**
   * Get presets
   */
  async getPresets(): Promise<ComfyPreset[]> {
    const response = await this.apiClient.comfy.getPresets();
    return response.data.presets || [];
  }

  /**
   * Create a preset
   */
  async createPreset(preset: Omit<ComfyPreset, "createdAt" | "updatedAt" | "createdBy">): Promise<ComfyPreset> {
    const response = await this.apiClient.comfy.createPreset(preset);
    return response.data.preset;
  }

  /**
   * Delete a preset
   */
  async deletePreset(name: string): Promise<void> {
    await this.apiClient.comfy.deletePreset(name);
  }

  /**
   * Set default preset
   */
  async setDefaultPreset(name: string): Promise<void> {
    await this.apiClient.comfy.setDefaultPreset(name);
  }

  /**
   * Import a preset
   */
  async importPreset(preset: Omit<ComfyPreset, "createdAt" | "updatedAt" | "createdBy">): Promise<ComfyPreset> {
    const response = await this.apiClient.comfy.importPreset(preset);
    return response.data.preset;
  }

  /**
   * Get workflow templates
   */
  async getWorkflowTemplates(filters?: {
    category?: string;
    author?: string;
    visibility?: string;
    tags?: string;
    isCommunity?: boolean;
  }): Promise<ComfyWorkflowTemplate[]> {
    const response = await this.apiClient.comfy.getWorkflowTemplates(filters);
    return response.data.templates || [];
  }

  /**
   * Get a specific workflow template
   */
  async getWorkflowTemplate(templateId: string): Promise<ComfyWorkflowTemplate> {
    const response = await this.apiClient.comfy.getWorkflowTemplate(templateId);
    return response.data.template;
  }

  /**
   * Create a workflow template
   */
  async createWorkflowTemplate(
    template: Omit<ComfyWorkflowTemplate, "id" | "createdAt" | "updatedAt" | "usageCount">
  ): Promise<ComfyWorkflowTemplate> {
    const response = await this.apiClient.comfy.createWorkflowTemplate(template);
    return response.data.template;
  }

  /**
   * Update a workflow template
   */
  async updateWorkflowTemplate(
    templateId: string,
    updates: Partial<ComfyWorkflowTemplate>
  ): Promise<ComfyWorkflowTemplate> {
    const response = await this.apiClient.comfy.updateWorkflowTemplate(templateId, updates);
    return response.data.template;
  }

  /**
   * Delete a workflow template
   */
  async deleteWorkflowTemplate(templateId: string): Promise<void> {
    await this.apiClient.comfy.deleteWorkflowTemplate(templateId);
  }

  /**
   * Search workflow templates
   */
  async searchWorkflowTemplates(
    query: string,
    filters?: {
      category?: string;
      tags?: string;
    }
  ): Promise<ComfyWorkflowTemplate[]> {
    const response = await this.apiClient.comfy.searchWorkflowTemplates(query, filters);
    return response.data.templates || [];
  }

  /**
   * Get community templates
   */
  async getCommunityTemplates(limit?: number): Promise<ComfyWorkflowTemplate[]> {
    const response = await this.apiClient.comfy.getCommunityTemplates({
      limit,
    });
    return response.data.templates || [];
  }

  /**
   * Rate a template
   */
  async rateTemplate(templateId: string, rating: number): Promise<void> {
    await this.apiClient.comfy.rateTemplate(templateId, { rating });
  }

  /**
   * Export a template
   */
  async exportTemplate(templateId: string): Promise<Record<string, unknown>> {
    const response = await this.apiClient.comfy.exportTemplate(templateId);
    return response.data.export_data;
  }

  /**
   * Import a template
   */
  async importTemplate(templateData: Record<string, unknown>, visibility = "private"): Promise<ComfyWorkflowTemplate> {
    const response = await this.apiClient.comfy.importTemplate({
      template_data: templateData,
      visibility,
    });
    return response.data.template;
  }

  /**
   * Get template statistics
   */
  async getTemplateStats(): Promise<Record<string, unknown>> {
    const response = await this.apiClient.comfy.getTemplateStats();
    return response.data.stats;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }
}
