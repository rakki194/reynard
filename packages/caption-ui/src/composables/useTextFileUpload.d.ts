/**
 * Text File Upload Composable for Reynard Caption System
 *
 * Handles file upload logic and processing for text files.
 */
import { TextFile } from "reynard-caption-core";
export interface UseTextFileUploadOptions {
    maxFiles?: number;
    onError?: (error: string) => void;
}
export declare const useTextFileUpload: (options?: UseTextFileUploadOptions) => {
    isLoading: import("solid-js").Accessor<boolean>;
    error: import("solid-js").Accessor<string | null>;
    handleFileUpload: (event: Event) => Promise<TextFile[]>;
    setError: import("solid-js").Setter<string | null>;
};
