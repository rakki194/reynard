/**
 * Caption Generator Event Handlers Composable
 *
 * Manages all event handlers for the caption generator component.
 * Extracted to keep the main component under the 140-line limit.
 */
import type { CaptionGeneratorState } from "reynard-caption-core";
export interface CaptionGeneratorHandlers {
    handleFileSelect: (file: File) => void;
    handleDragOver: (e: DragEvent) => void;
    handleDragLeave: (e: DragEvent) => void;
    handleDrop: (e: DragEvent) => void;
    generateCaption: () => Promise<void>;
}
/**
 * Creates event handlers for the caption generator
 */
export declare function useCaptionGeneratorHandlers(state: CaptionGeneratorState, manager: import("reynard-annotating").BackendAnnotationManager | null, onCaptionGenerated?: (result: import("reynard-annotating-core").CaptionResult) => void, onGenerationError?: (error: Error) => void): CaptionGeneratorHandlers;
