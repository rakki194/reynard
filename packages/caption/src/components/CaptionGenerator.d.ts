/**
 * Caption Generator Component
 *
 * Interactive caption generation interface that integrates with the backend
 * annotation system. Provides model selection, image upload, and real-time
 * caption generation with progress tracking.
 *
 * Features:
 * - Model selection with availability checking
 * - Image upload with drag-and-drop support
 * - Real-time generation progress
 * - Multiple caption types (tags, detailed, general)
 * - Integration with existing BackendAnnotationManager
 */
import { type CaptionResult } from "reynard-annotating-core";
import { Component } from "solid-js";
import "./CaptionGenerator.css";
export interface CaptionGeneratorProps {
    /** Initial image path (optional) */
    initialImagePath?: string;
    /** Callback when caption is generated */
    onCaptionGenerated?: (result: CaptionResult) => void;
    /** Callback when generation fails */
    onGenerationError?: (error: Error) => void;
    /** Backend configuration */
    backendConfig?: {
        baseUrl: string;
        apiKey?: string;
    };
    /** Whether to show advanced options */
    showAdvanced?: boolean;
    /** Custom CSS class */
    className?: string;
}
export declare const CaptionGenerator: Component<CaptionGeneratorProps>;
