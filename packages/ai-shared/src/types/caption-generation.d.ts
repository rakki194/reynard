/**
 * Caption Generation Types
 *
 * Defines types for image caption generation, including tasks, results,
 * and post-processing rules within the Reynard framework.
 */
import type { ModelConfig } from "./model-management";
export declare enum CaptionType {
    TAGS = "tags",
    CAPTION = "caption",
    DESCRIPTION = "description",
    E621 = "e621",
    TOML = "toml"
}
export interface CaptionTask {
    imagePath: string;
    generatorName: string;
    config?: ModelConfig;
    postProcess?: boolean;
    force?: boolean;
    priority?: number;
    captionType?: CaptionType;
    metadata?: Record<string, any>;
}
export interface CaptionResult {
    imagePath: string;
    generatorName: string;
    success: boolean;
    caption?: string;
    captionType?: CaptionType;
    processingTime?: number;
    confidence?: number;
    error?: string;
    errorType?: string;
    retryable?: boolean;
    metadata?: Record<string, any>;
    timestamp?: Date;
}
export interface PostProcessingRules {
    replaceUnderscores: boolean;
    normalizeSpacing: boolean;
    addPunctuation: boolean;
    removeDuplicates: boolean;
    customRules: Array<{
        pattern: string;
        replacement: string;
        flags?: string;
    }>;
}
