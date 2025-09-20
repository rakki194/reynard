/**
 * Caption Generator Event Handlers Composable
 *
 * Manages all event handlers for the caption generator component.
 * Extracted to keep the main component under the 140-line limit.
 */
/**
 * Creates event handlers for the caption generator
 */
export function useCaptionGeneratorHandlers(state, manager, onCaptionGenerated, onGenerationError) {
    const handleFileSelect = (file) => {
        if (!file.type.startsWith("image/")) {
            state.setError("Please select a valid image file");
            return;
        }
        state.setImageFile(file);
        state.setError(null);
        state.setResult(null);
        const reader = new FileReader();
        reader.onload = e => {
            state.setImagePreview(e.target?.result || null);
        };
        reader.readAsDataURL(file);
    };
    const handleDragOver = (e) => {
        e.preventDefault();
        state.setIsDragOver(true);
    };
    const handleDragLeave = (e) => {
        e.preventDefault();
        state.setIsDragOver(false);
    };
    const handleDrop = (e) => {
        e.preventDefault();
        state.setIsDragOver(false);
        const files = e.dataTransfer?.files;
        if (files && files.length > 0) {
            handleFileSelect(files[0]);
        }
    };
    const generateCaption = async () => {
        if (!state.imageFile() || !manager)
            return;
        state.setIsGenerating(true);
        state.setGenerationProgress(0);
        state.setError(null);
        state.setResult(null);
        try {
            const task = {
                imagePath: state.imageFile().name,
                generatorName: state.selectedModel(),
                config: { threshold: 0.2 },
                postProcess: true,
            };
            const progressInterval = setInterval(() => {
                state.setGenerationProgress(Math.min(state.generationProgress() + 10, 90));
            }, 200);
            const captionResult = await manager.getService().generateCaption(task);
            clearInterval(progressInterval);
            state.setGenerationProgress(100);
            state.setResult(captionResult);
            onCaptionGenerated?.(captionResult);
        }
        catch (err) {
            state.setError(`Generation failed: ${err instanceof Error ? err.message : "Unknown error"}`);
            onGenerationError?.(err);
        }
        finally {
            state.setIsGenerating(false);
            setTimeout(() => state.setGenerationProgress(0), 1000);
        }
    };
    return {
        handleFileSelect,
        handleDragOver,
        handleDragLeave,
        handleDrop,
        generateCaption,
    };
}
