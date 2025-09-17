/**
 * Text File Manager Composable for Reynard Caption System
 *
 * Handles text file state management and operations.
 */
import { createSignal } from "solid-js";
export const useTextFileManager = (options = {}) => {
    const [textFiles, setTextFiles] = createSignal(options.initialFiles || []);
    const [selectedFile, setSelectedFile] = createSignal(null);
    // Handle file selection
    const handleFileSelect = (file) => {
        setSelectedFile(file);
        options.onFileSelect?.(file);
    };
    // Handle file removal
    const handleFileRemove = (fileId) => {
        setTextFiles((prev) => prev.filter((f) => f.id !== fileId));
        if (selectedFile()?.id === fileId) {
            setSelectedFile(null);
        }
        options.onFileRemove?.(fileId);
    };
    // Handle file content modification
    const handleFileModify = (fileId, content) => {
        setTextFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, content, modifiedAt: new Date() } : f));
        options.onFileModify?.(fileId, content);
    };
    // Add new files
    const addFiles = (newFiles) => {
        setTextFiles((prev) => [...prev, ...newFiles]);
    };
    return {
        textFiles,
        selectedFile,
        setSelectedFile,
        handleFileSelect,
        handleFileRemove,
        handleFileModify,
        addFiles,
    };
};
