/**
 * Caption Generator State Composable
 *
 * Manages all state for the caption generator component.
 * Extracted to keep the main component under the 140-line limit.
 */
import { createSignal } from "solid-js";
/**
 * Creates the state management for the caption generator
 */
export function useCaptionGeneratorState() {
    const [selectedModel, setSelectedModel] = createSignal("jtp2");
    const [imageFile, setImageFile] = createSignal(null);
    const [imagePreview, setImagePreview] = createSignal(null);
    const [isGenerating, setIsGenerating] = createSignal(false);
    const [generationProgress, setGenerationProgress] = createSignal(0);
    const [result, setResult] = createSignal(null);
    const [error, setError] = createSignal(null);
    const [availableGenerators, setAvailableGenerators] = createSignal([]);
    const [isDragOver, setIsDragOver] = createSignal(false);
    return {
        selectedModel,
        setSelectedModel,
        imageFile,
        setImageFile,
        imagePreview,
        setImagePreview,
        isGenerating,
        setIsGenerating,
        generationProgress,
        setGenerationProgress,
        result,
        setResult,
        error,
        setError,
        availableGenerators,
        setAvailableGenerators,
        isDragOver,
        setIsDragOver,
    };
}
