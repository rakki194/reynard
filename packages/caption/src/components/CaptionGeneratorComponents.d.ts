/**
 * Caption Generator Sub-components
 *
 * Sub-components for the Caption Generator to keep the main component
 * under the 140-line limit.
 */
import type { CaptionResult } from "reynard-annotating-core";
import { Component } from "solid-js";
import type { GeneratorInfo } from "../composables";
export declare const ModelSelection: Component<{
    generators: GeneratorInfo[];
    selectedModel: string;
    onModelSelect: (model: string) => void;
}>;
export declare const ImageUpload: Component<{
    imagePreview: string | null;
    imageFile: File | null;
    isDragOver: boolean;
    onFileSelect: (file: File) => void;
    onDragOver: (e: DragEvent) => void;
    onDragLeave: (e: DragEvent) => void;
    onDrop: (e: DragEvent) => void;
    onFileInputClick: () => void;
    fileInputRef: HTMLInputElement | undefined;
}>;
export declare const GenerationResults: Component<{
    result: CaptionResult;
    selectedModel: string;
    captionData: unknown;
}>;
