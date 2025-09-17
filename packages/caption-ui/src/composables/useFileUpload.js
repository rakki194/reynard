/**
 * File Upload Composable
 *
 * Handles file upload logic for the multi-modal gallery.
 */
export const useFileUpload = () => {
    // const { isLoading, error, processFileWrapper } = useFileProcessing();
    const isLoading = () => false;
    const error = () => null;
    const processFileWrapper = async (file) => {
        // Temporary implementation
        return {
            id: `file_${Date.now()}`,
            name: file.name,
            size: file.size,
            type: file.type,
            fileType: "image",
            url: URL.createObjectURL(file),
            content: file,
            uploadedAt: new Date(),
            modifiedAt: new Date(),
        };
    };
    const handleFileUpload = async (event, setFiles, maxFiles = 50) => {
        const input = event.target;
        const files = input.files;
        if (!files || files.length === 0)
            return;
        const filesToProcess = Array.from(files).slice(0, maxFiles);
        try {
            const processedFiles = await Promise.all(filesToProcess.map(processFileWrapper));
            setFiles(prev => [...prev, ...processedFiles]);
        }
        catch (err) {
            console.error("Failed to process files:", err);
        }
    };
    return {
        isLoading,
        error,
        handleFileUpload,
    };
};
