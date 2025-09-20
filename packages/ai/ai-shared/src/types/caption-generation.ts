/**
 * Caption Generation Types
 *
 * Defines types for image caption generation, including tasks, results,
 * and post-processing rules within the Reynard framework.
 */

import type { ModelConfig } from "./model-management";

export enum CaptionType {
  TAGS = "tags",
  CAPTION = "caption",
  DESCRIPTION = "description",
  E621 = "e621",
  TOML = "toml",
}

export interface CaptionTask {
  imagePath: string;
  generatorName: string;
  config?: ModelConfig;
  postProcess?: boolean;
  force?: boolean;
  priority?: number; // Higher numbers = higher priority
  captionType?: CaptionType; // Specific caption type to generate
  metadata?: Record<string, any>;
}

export interface CaptionResult {
  imagePath: string;
  generatorName: string;
  success: boolean;
  caption?: string; // Optional for failed results
  captionType?: CaptionType;
  processingTime?: number;
  confidence?: number;
  error?: string;
  errorType?: string; // Error classification
  retryable?: boolean; // Whether the error is retryable
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
