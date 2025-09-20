/**
 * Event types for Reynard annotation system
 *
 * This module defines event interfaces for the annotation
 * system's event-driven architecture.
 */

import { ModelStatus } from "./enums";
import { CaptionTask, CaptionResult } from "./tasks";

export interface AnnotationEvent {
  type: string;
  timestamp: Date;
  data: any;
}

export interface ModelEvent extends AnnotationEvent {
  type: "model_loaded" | "model_unloaded" | "model_error" | "model_health_check";
  data: {
    modelName: string;
    status: ModelStatus;
    error?: string;
  };
}

export interface CaptionEvent extends AnnotationEvent {
  type: "caption_started" | "caption_completed" | "caption_failed";
  data: {
    task: CaptionTask;
    result?: CaptionResult;
    error?: string;
  };
}

export interface BatchEvent extends AnnotationEvent {
  type: "batch_started" | "batch_progress" | "batch_completed" | "batch_failed";
  data: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    progress: number;
  };
}

export type AnyAnnotationEvent = ModelEvent | CaptionEvent | BatchEvent;
