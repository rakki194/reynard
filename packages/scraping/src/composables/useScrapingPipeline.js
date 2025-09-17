/**
 * useScrapingPipeline Composable
 * Manages scraping processing pipelines
 */
import { createEffect, createSignal } from "solid-js";
import { createStore } from "solid-js/store";
export function useScrapingPipeline(options = {}) {
    const { autoRefresh = true, refreshInterval = 5000 } = options;
    const [pipelines, setPipelines] = createStore([]);
    const [isLoading, setIsLoading] = createSignal(false);
    const [error, setError] = createSignal(null);
    let refreshTimer = null;
    const activePipelines = () => pipelines.filter(pipeline => pipeline.status === "running" || pipeline.status === "paused");
    const fetchPipelines = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const response = await fetch("/api/scraping/pipelines");
            const result = await response.json();
            if (result.success && result.data) {
                setPipelines(result.data);
            }
            else {
                setError(result.error || "Failed to fetch pipelines");
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        }
        finally {
            setIsLoading(false);
        }
    };
    const createPipeline = async (name, config) => {
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
            }
            else {
                throw new Error(result.error || "Failed to create pipeline");
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    };
    const startPipeline = async (pipelineId) => {
        try {
            const response = await fetch(`/api/scraping/pipelines/${pipelineId}/start`, {
                method: "POST",
            });
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || "Failed to start pipeline");
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };
    const stopPipeline = async (pipelineId) => {
        try {
            const response = await fetch(`/api/scraping/pipelines/${pipelineId}/stop`, {
                method: "POST",
            });
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || "Failed to stop pipeline");
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };
    const pausePipeline = async (pipelineId) => {
        try {
            const response = await fetch(`/api/scraping/pipelines/${pipelineId}/pause`, {
                method: "POST",
            });
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || "Failed to pause pipeline");
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };
    const resumePipeline = async (pipelineId) => {
        try {
            const response = await fetch(`/api/scraping/pipelines/${pipelineId}/resume`, {
                method: "POST",
            });
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.error || "Failed to resume pipeline");
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };
    const deletePipeline = async (pipelineId) => {
        try {
            const response = await fetch(`/api/scraping/pipelines/${pipelineId}`, {
                method: "DELETE",
            });
            const result = await response.json();
            if (result.success) {
                setPipelines(pipelines.filter(p => p.id !== pipelineId));
            }
            else {
                throw new Error(result.error || "Failed to delete pipeline");
            }
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };
    const getPipeline = (pipelineId) => {
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
