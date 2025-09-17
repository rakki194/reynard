/**
 * File Upload Composable for Multi-Modal Gallery
 *
 * Provides file upload functionality with progress tracking and error handling.
 */
import { createSignal } from "solid-js";
export function useFileUpload() {
    const [isLoading, setIsLoading] = createSignal(false);
    const [error, setError] = createSignal(null);
    const [uploadProgress, setUploadProgress] = createSignal({});
    const detectFileType = (file) => {
        const type = file.type.toLowerCase();
        if (type.startsWith("image/"))
            return "image";
        if (type.startsWith("video/"))
            return "video";
        if (type.startsWith("audio/"))
            return "audio";
        if (type.startsWith("text/"))
            return "text";
        if (type.includes("pdf") || type.includes("document") || type.includes("word"))
            return "document";
        return "unknown";
    };
    const createMultiModalFile = (file) => {
        const now = new Date();
        return {
            id: `${file.name}-${now.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            size: file.size,
            type: file.type,
            fileType: detectFileType(file),
            url: URL.createObjectURL(file),
            uploadedAt: now,
            modifiedAt: now,
        };
    };
    const handleFileUpload = (event, setFiles, maxFiles) => {
        const target = event.target;
        const files = target.files;
        if (!files || files.length === 0)
            return;
        setIsLoading(true);
        setError(null);
        try {
            const newFiles = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const multiModalFile = createMultiModalFile(file);
                newFiles.push(multiModalFile);
                // Simulate upload progress
                setUploadProgress(prev => ({
                    ...prev,
                    [multiModalFile.id]: 0,
                }));
                // Simulate progress updates
                const progressInterval = setInterval(() => {
                    setUploadProgress(prev => {
                        const current = prev[multiModalFile.id] || 0;
                        if (current >= 100) {
                            clearInterval(progressInterval);
                            return prev;
                        }
                        return {
                            ...prev,
                            [multiModalFile.id]: current + 10,
                        };
                    });
                }, 100);
            }
            // Add new files to existing files
            setFiles(prev => {
                const combined = [...prev, ...newFiles];
                if (maxFiles && combined.length > maxFiles) {
                    return combined.slice(0, maxFiles);
                }
                return combined;
            });
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Upload failed");
        }
        finally {
            setIsLoading(false);
            // Clear progress after a delay
            setTimeout(() => {
                setUploadProgress({});
            }, 1000);
        }
    };
    return {
        isLoading,
        error,
        uploadProgress,
        handleFileUpload,
    };
}
