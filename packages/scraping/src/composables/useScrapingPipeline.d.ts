/**
 * useScrapingPipeline Composable
 * Manages scraping processing pipelines
 */
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
export declare function useScrapingPipeline(options?: UseScrapingPipelineOptions): UseScrapingPipelineReturn;
