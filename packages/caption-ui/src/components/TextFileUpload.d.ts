/**
 * Text File Upload Component for Reynard Caption System
 *
 * Handles file upload UI and interactions.
 */
import { Component } from "solid-js";
export interface TextFileUploadProps {
    onFileUpload: (event: Event) => void;
    isLoading: boolean;
    error: string | null;
    class?: string;
}
export declare const TextFileUpload: Component<TextFileUploadProps>;
