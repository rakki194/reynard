/**
 * File Handling Composable
 *
 * Handles file state management and operations for the multi-modal gallery.
 */
import { calculateFileCounts } from "reynard-caption-core";
import { createMemo, createSignal } from "solid-js";
export const useFileHandling = (initialFiles = [], defaultView = "grid", onFileSelect, onFileRemove, onFileModify) => {
    const [files, setFiles] = createSignal(initialFiles);
    const [selectedFile, setSelectedFile] = createSignal(null);
    const [currentView, setCurrentView] = createSignal(defaultView);
    const [filterType, setFilterType] = createSignal("all");
    // Filtered files based on current filter
    const filteredFiles = createMemo(() => {
        const allFiles = files();
        if (filterType() === "all")
            return allFiles;
        return allFiles.filter(file => file.fileType === filterType());
    });
    // File counts by type
    const fileCounts = createMemo(() => calculateFileCounts(files()));
    // Handle file selection
    const handleFileSelect = (file) => {
        setSelectedFile(file);
        onFileSelect?.(file);
    };
    // Handle file removal
    const handleFileRemove = (fileId) => {
        setFiles(prev => prev.filter(f => f.id !== fileId));
        if (selectedFile()?.id === fileId) {
            setSelectedFile(null);
        }
        onFileRemove?.(fileId);
    };
    // Handle file modification
    const handleFileModify = (fileId, content) => {
        setFiles(prev => prev.map(f => (f.id === fileId ? { ...f, content, modifiedAt: new Date() } : f)));
        onFileModify?.(fileId, content);
    };
    return {
        files,
        setFiles,
        selectedFile,
        setSelectedFile,
        currentView,
        setCurrentView,
        filterType,
        setFilterType,
        filteredFiles,
        fileCounts,
        handleFileSelect,
        handleFileRemove,
        handleFileModify,
    };
};
