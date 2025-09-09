/**
 * Caption Generator State Composable
 * 
 * Manages all state for the caption generator component.
 * Extracted to keep the main component under the 140-line limit.
 */

import { createSignal } from "solid-js";
import type { CaptionResult } from "reynard-annotating";

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
export function useCaptionGeneratorState(): CaptionGeneratorState {
  const [selectedModel, setSelectedModel] = createSignal<string>("jtp2");
  const [imageFile, setImageFile] = createSignal<File | null>(null);
  const [imagePreview, setImagePreview] = createSignal<string | null>(null);
  const [isGenerating, setIsGenerating] = createSignal(false);
  const [generationProgress, setGenerationProgress] = createSignal(0);
  const [result, setResult] = createSignal<CaptionResult | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  const [availableGenerators, setAvailableGenerators] = createSignal<GeneratorInfo[]>([]);
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
