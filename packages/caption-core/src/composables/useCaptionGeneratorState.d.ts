/**
 * Caption Generator State Composable
 *
 * Manages all state for the caption generator component.
 * Extracted to keep the main component under the 140-line limit.
 */
import type { CaptionResult } from "reynard-annotating-core";
export interface GeneratorInfo {
    name: string;
    displayName: string;
    description: string;
    available: boolean;
    loading: boolean;
}
export interface CaptionGeneratorState {
    selectedModel: () => string;
    setSelectedModel: (model: string) => void;
    imageFile: () => File | null;
    setImageFile: (file: File | null) => void;
    imagePreview: () => string | null;
    setImagePreview: (preview: string | null) => void;
    isGenerating: () => boolean;
    setIsGenerating: (generating: boolean) => void;
    generationProgress: () => number;
    setGenerationProgress: (progress: number) => void;
    result: () => CaptionResult | null;
    setResult: (result: CaptionResult | null) => void;
    error: () => string | null;
    setError: (error: string | null) => void;
    availableGenerators: () => GeneratorInfo[];
    setAvailableGenerators: (generators: GeneratorInfo[]) => void;
    isDragOver: () => boolean;
    setIsDragOver: (dragOver: boolean) => void;
}
/**
 * Creates the state management for the caption generator
 */
export declare function useCaptionGeneratorState(): CaptionGeneratorState;
