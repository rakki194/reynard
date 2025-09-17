/**
 * Batch Caption Processor Component
 *
 * Advanced batch processing UI for caption generation with drag-and-drop,
 * progress tracking, and comprehensive result management.
 */
import type { CaptionResult } from "reynard-annotating-core";
import { Component } from "solid-js";
import type { BackendAnnotationManager } from "../BackendAnnotationManager";
export interface BatchCaptionProcessorProps {
    manager: BackendAnnotationManager;
    class?: string;
    onComplete?: (results: CaptionResult[]) => void;
    onError?: (error: Error) => void;
}
export interface BatchFile {
    id: string;
    file: File;
    path: string;
    generatorName: string;
    config?: Record<string, unknown>;
    force?: boolean;
    postProcess?: boolean;
    status: "pending" | "processing" | "completed" | "error";
    result?: CaptionResult;
    error?: string;
    progress?: number;
}
export interface BatchProgress {
    total: number;
    completed: number;
    processing: number;
    errors: number;
    percentage: number;
    currentFile?: string;
    estimatedTimeRemaining?: number;
}
export declare const BatchCaptionProcessor: Component<BatchCaptionProcessorProps>;
