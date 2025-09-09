/**
 * Task and result interfaces for Reynard annotation system
 *
 * This module defines the core interfaces for caption generation
 * tasks and their results.
 */

import { CaptionType, ErrorType } from "./enums";

export interface CaptionTask {
  imagePath: string;
  generatorName: string;
  config?: Record<string, any>;
  postProcess?: boolean;
  force?: boolean;
  priority?: number; // Higher numbers = higher priority
  metadata?: Record<string, any>;
}

export interface CaptionResult {
  imagePath: string;
  generatorName: string;
  success: boolean;
  caption?: string;
  error?: string;
  errorType?: ErrorType;
  retryable?: boolean;
  processingTime?: number;
  captionType?: CaptionType;
  metadata?: Record<string, any>;
  timestamp?: Date;
}
