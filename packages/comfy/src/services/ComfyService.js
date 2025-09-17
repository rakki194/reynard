/**
 * ComfyUI Service
 *
 * Main service class for ComfyUI integration and workflow management.
 */
import { createReynardApiClient } from "reynard-api-client";
export class ComfyService {
    constructor(apiClient) {
        Object.defineProperty(this, "apiClient", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "eventSource", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.apiClient = apiClient || createReynardApiClient();
    }
    /**
     * Check ComfyUI service health
     */
    async getHealth() {
        const response = await this.apiClient.comfy.health();
        return response.data;
    }
    /**
     * Force a health check
     */
    async forceHealthCheck() {
        const response = await this.apiClient.comfy.forceHealthCheck();
        return response.data;
    }
    /**
     * Queue a workflow for execution
     */
    async queueWorkflow(workflow, clientId) {
        const response = await this.apiClient.comfy.queue({
            workflow,
            client_id: clientId,
        });
        return response.data;
    }
    /**
     * Get the status of a queued prompt
     */
    async getStatus(promptId) {
        const response = await this.apiClient.comfy.getStatus(promptId);
        return {
            id: promptId,
            timestamp: new Date(),
            status: response.data.status,
            progress: response.data.progress,
            message: response.data.message,
            error: response.data.error,
        };
    }
    /**
     * Get the history for a prompt
     */
    async getHistory(promptId) {
        const response = await this.apiClient.comfy.getHistory(promptId);
        return {
            id: promptId,
            status: response.data.status,
            outputs: response.data.items || {},
            error: response.data.status === "error" ? "Job failed" : undefined,
            completedAt: new Date(),
        };
    }
    /**
     * Get ComfyUI object information
     */
    async getObjectInfo(refresh = false) {
        const response = await this.apiClient.comfy.getObjectInfo({ refresh });
        return response.data;
    }
    /**
     * View a generated image
     */
    async getImage(filename, subfolder = "", type = "output") {
        const response = await this.apiClient.comfy.viewImage(filename, subfolder, type);
        return {
            filename,
            subfolder,
            type: type,
            url: URL.createObjectURL(response.data),
        };
    }
    /**
     * Generate an image from text
     */
    async textToImage(params) {
        const response = await this.apiClient.comfy.text2img(params);
        return { promptId: response.data.prompt_id };
    }
    /**
     * Ingest a generated image
     */
    async ingestImage(file, promptId, workflow, metadata = {}) {
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
    streamStatus(promptId, onEvent) {
        if (this.eventSource) {
            this.eventSource.close();
        }
        this.eventSource = new EventSource(`/api/comfy/stream/${promptId}`);
        this.eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                onEvent(data);
            }
            catch (error) {
                console.error("Failed to parse stream event:", error);
            }
        };
        this.eventSource.onerror = (error) => {
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
    async validateCheckpoint(checkpoint) {
        const response = await this.apiClient.comfy.validateCheckpoint(checkpoint);
        return response.data;
    }
    /**
     * Validate LoRA
     */
    async validateLora(lora) {
        const response = await this.apiClient.comfy.validateLora(lora);
        return response.data;
    }
    /**
     * Validate sampler
     */
    async validateSampler(sampler) {
        const response = await this.apiClient.comfy.validateSampler(sampler);
        return response.data;
    }
    /**
     * Validate scheduler
     */
    async validateScheduler(scheduler) {
        const response = await this.apiClient.comfy.validateScheduler(scheduler);
        return response.data;
    }
    /**
     * Get queue status
     */
    async getQueueStatus() {
        const response = await this.apiClient.comfy.getQueueStatus();
        return response.data;
    }
    /**
     * Get queue items
     */
    async getQueueItems() {
        const response = await this.apiClient.comfy.getQueueItems();
        return response.data.items || [];
    }
    /**
     * Clear a queue item
     */
    async clearQueueItem(promptId) {
        await this.apiClient.comfy.clearQueueItem(promptId);
    }
    /**
     * Clear all queue items
     */
    async clearAllQueueItems() {
        await this.apiClient.comfy.clearAllQueueItems();
    }
    /**
     * Pause the queue
     */
    async pauseQueue() {
        await this.apiClient.comfy.pauseQueue();
    }
    /**
     * Resume the queue
     */
    async resumeQueue() {
        await this.apiClient.comfy.resumeQueue();
    }
    /**
     * Move a queue item
     */
    async moveQueueItem(promptId, position) {
        await this.apiClient.comfy.moveQueueItem(promptId, { position });
    }
    /**
     * Get presets
     */
    async getPresets() {
        const response = await this.apiClient.comfy.getPresets();
        return response.data.presets || [];
    }
    /**
     * Create a preset
     */
    async createPreset(preset) {
        const response = await this.apiClient.comfy.createPreset(preset);
        return response.data.preset;
    }
    /**
     * Delete a preset
     */
    async deletePreset(name) {
        await this.apiClient.comfy.deletePreset(name);
    }
    /**
     * Set default preset
     */
    async setDefaultPreset(name) {
        await this.apiClient.comfy.setDefaultPreset(name);
    }
    /**
     * Import a preset
     */
    async importPreset(preset) {
        const response = await this.apiClient.comfy.importPreset(preset);
        return response.data.preset;
    }
    /**
     * Get workflow templates
     */
    async getWorkflowTemplates(filters) {
        const response = await this.apiClient.comfy.getWorkflowTemplates(filters);
        return response.data.templates || [];
    }
    /**
     * Get a specific workflow template
     */
    async getWorkflowTemplate(templateId) {
        const response = await this.apiClient.comfy.getWorkflowTemplate(templateId);
        return response.data.template;
    }
    /**
     * Create a workflow template
     */
    async createWorkflowTemplate(template) {
        const response = await this.apiClient.comfy.createWorkflowTemplate(template);
        return response.data.template;
    }
    /**
     * Update a workflow template
     */
    async updateWorkflowTemplate(templateId, updates) {
        const response = await this.apiClient.comfy.updateWorkflowTemplate(templateId, updates);
        return response.data.template;
    }
    /**
     * Delete a workflow template
     */
    async deleteWorkflowTemplate(templateId) {
        await this.apiClient.comfy.deleteWorkflowTemplate(templateId);
    }
    /**
     * Search workflow templates
     */
    async searchWorkflowTemplates(query, filters) {
        const response = await this.apiClient.comfy.searchWorkflowTemplates(query, filters);
        return response.data.templates || [];
    }
    /**
     * Get community templates
     */
    async getCommunityTemplates(limit) {
        const response = await this.apiClient.comfy.getCommunityTemplates({
            limit,
        });
        return response.data.templates || [];
    }
    /**
     * Rate a template
     */
    async rateTemplate(templateId, rating) {
        await this.apiClient.comfy.rateTemplate(templateId, { rating });
    }
    /**
     * Export a template
     */
    async exportTemplate(templateId) {
        const response = await this.apiClient.comfy.exportTemplate(templateId);
        return response.data.export_data;
    }
    /**
     * Import a template
     */
    async importTemplate(templateData, visibility = "private") {
        const response = await this.apiClient.comfy.importTemplate({
            template_data: templateData,
            visibility,
        });
        return response.data.template;
    }
    /**
     * Get template statistics
     */
    async getTemplateStats() {
        const response = await this.apiClient.comfy.getTemplateStats();
        return response.data.stats;
    }
    /**
     * Cleanup resources
     */
    cleanup() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
        }
    }
}
