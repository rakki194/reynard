/**
 * Text File Upload Composable for Reynard Caption System
 *
 * Handles file upload logic and processing for text files.
 */
import { processTextFile } from "reynard-caption-core";
import { createSignal } from "solid-js";
export const useTextFileUpload = (options = {}) => {
    const [isLoading, setIsLoading] = createSignal(false);
    const [error, setError] = createSignal(null);
    // Process uploaded files with error handling
    const processFileWithErrorHandling = async (file) => {
        setIsLoading(true);
        setError(null);
        try {
            return await processTextFile(file);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to process text file";
            setError(errorMessage);
            options.onError?.(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    };
    // Handle file upload
    const handleFileUpload = async (event) => {
        const input = event.target;
        const files = input.files;
        if (!files || files.length === 0)
            return [];
        const maxFiles = options.maxFiles || 10;
        const filesToProcess = Array.from(files).slice(0, maxFiles);
        try {
            return await Promise.all(filesToProcess.map(processFileWithErrorHandling));
        }
        catch (err) {
            console.error("Failed to process text files:", err);
            return [];
        }
    };
    return {
        isLoading,
        error,
        handleFileUpload,
        setError,
    };
};
