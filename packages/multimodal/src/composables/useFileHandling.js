/**
 * File Handling Composable for Multi-Modal Gallery
 *
 * Provides state management and utilities for handling files in the gallery.
 */
import { createSignal, createMemo } from "solid-js";
export function useFileHandling(initialFiles = [], defaultView = "grid", onFileSelect, onFileRemove, onFileModify) {
    const [files, setFiles] = createSignal(initialFiles);
    const [selectedFile, setSelectedFile] = createSignal(null);
    const [currentView, setCurrentView] = createSignal(defaultView);
    const [filterType, setFilterType] = createSignal("all");
    // Computed values
    const filteredFiles = createMemo(() => {
        const currentFilter = filterType();
        if (currentFilter === "all") {
            return files();
        }
        return files().filter(file => file.fileType === currentFilter);
    });
    const fileCounts = createMemo(() => {
        const counts = {
            image: 0,
            video: 0,
            audio: 0,
            text: 0,
            document: 0,
            unknown: 0,
        };
        files().forEach(file => {
            counts[file.fileType] = (counts[file.fileType] || 0) + 1;
        });
        return counts;
    });
    // Event handlers
    const handleFileSelect = (file) => {
        setSelectedFile(file);
        onFileSelect?.(file);
    };
    const handleFileRemove = (file) => {
        setFiles(files().filter(f => f.id !== file.id));
        if (selectedFile()?.id === file.id) {
            setSelectedFile(null);
        }
        onFileRemove?.(file);
    };
    const handleFileModify = (file) => {
        setFiles(files().map(f => (f.id === file.id ? file : f)));
        if (selectedFile()?.id === file.id) {
            setSelectedFile(file);
        }
        onFileModify?.(file);
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
}
