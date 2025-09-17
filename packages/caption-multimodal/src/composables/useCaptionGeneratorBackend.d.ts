/**
 * Caption Generator Backend Composable
 *
 * Manages backend initialization and generator discovery.
 * Extracted to keep the main component under the 140-line limit.
 */
import { createAnnotationManager } from "reynard-annotating";
import { useCaption as useGeneratedCaption } from "reynard-api-client";
import type { CaptionGeneratorState } from "./useCaptionGeneratorState";
export interface BackendConfig {
    baseUrl: string;
    apiKey?: string;
}
export interface CaptionGeneratorBackend {
    manager: ReturnType<typeof createAnnotationManager> | null;
    generatedCaption: ReturnType<typeof useGeneratedCaption> | null;
    initialize: () => Promise<void>;
    shutdown: () => Promise<void>;
}
/**
 * Creates backend management for the caption generator
 */
export declare function useCaptionGeneratorBackend(state: CaptionGeneratorState, config?: BackendConfig): CaptionGeneratorBackend;
