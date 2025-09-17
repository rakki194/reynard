/**
 * File Processing Composable
 *
 * Handles file upload and processing logic for the multi-modal gallery.
 */
import { createFileProcessingPipeline, processFile } from "reynard-caption-core";
import { createSignal } from "solid-js";
export const useFileProcessing = () => {
    const [isLoading, setIsLoading] = createSignal(false);
    const [error, setError] = createSignal(null);
    const processingPipeline = createFileProcessingPipeline();
    const processFileWrapper = async (file) => {
        setIsLoading(true);
        setError(null);
        try {
            return await processFile(file, processingPipeline);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to process file";
            setError(errorMessage);
            throw new Error(errorMessage);
        }
        finally {
            setIsLoading(false);
        }
    };
    return {
        isLoading,
        error,
        processFileWrapper,
        processingPipeline,
    };
};
