/**
 * File Processing Utilities for Multi-Modal Gallery
 *
 * Utility functions for file type determination and processing
 * logic used across the multi-modal gallery system.
 */
import { FileProcessingPipeline } from "reynard-file-processing";
/**
 * Determines the media type of a file based on MIME type and extension
 */
export const determineFileType = (file) => {
    const mimeType = file.type.toLowerCase();
    const extension = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    // Image files
    if (mimeType.startsWith("image/") ||
        [".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".svg", ".tiff"].includes(extension)) {
        return "image";
    }
    // Video files
    if (mimeType.startsWith("video/") || [".mp4", ".avi", ".mov", ".mkv", ".webm", ".flv", ".wmv"].includes(extension)) {
        return "video";
    }
    // Audio files
    if (mimeType.startsWith("audio/") || [".mp3", ".wav", ".flac", ".ogg", ".aac", ".m4a"].includes(extension)) {
        return "audio";
    }
    // Text files
    if (mimeType.startsWith("text/") ||
        [".txt", ".md", ".json", ".xml", ".yaml", ".yml", ".toml", ".js", ".ts", ".py", ".html", ".css"].includes(extension)) {
        return "text";
    }
    // Document files
    if (mimeType.includes("pdf") ||
        mimeType.includes("document") ||
        [".pdf", ".doc", ".docx", ".ppt", ".pptx", ".xls", ".xlsx"].includes(extension)) {
        return "document";
    }
    return "unknown";
};
/**
 * Processes a single file using the file processing pipeline
 */
export const processFile = async (file, processingPipeline) => {
    // Determine file type
    const fileType = determineFileType(file);
    // Process file using existing pipeline
    const result = await processingPipeline.processFile(file, {
        generateThumbnails: true,
        extractMetadata: true,
        analyzeContent: true,
    });
    if (!result.success) {
        throw new Error(result.error || "Failed to process file");
    }
    const multiModalFile = {
        id: crypto.randomUUID(),
        name: file.name,
        size: file.size,
        type: file.type,
        fileType,
        url: URL.createObjectURL(file),
        thumbnail: result.data?.thumbnail,
        metadata: result.data?.metadata,
        content: result.data?.content,
        uploadedAt: new Date(),
        modifiedAt: new Date(),
    };
    return multiModalFile;
};
/**
 * Calculates file counts by type from an array of files
 */
export const calculateFileCounts = (files) => {
    return {
        all: files.length,
        image: files.filter(f => f.fileType === "image").length,
        video: files.filter(f => f.fileType === "video").length,
        audio: files.filter(f => f.fileType === "audio").length,
        text: files.filter(f => f.fileType === "text").length,
        document: files.filter(f => f.fileType === "document").length,
    };
};
/**
 * Creates a file processing pipeline with default configuration
 */
export const createFileProcessingPipeline = () => {
    return new FileProcessingPipeline({
        defaultThumbnailSize: [200, 200],
        maxFileSize: 100 * 1024 * 1024, // 100MB
    });
};
/**
 * Gets the appropriate icon for a media type
 */
export const getFileIcon = (type) => {
    const iconMap = {
        image: "🖼️",
        video: "🎥",
        audio: "🎵",
        text: "📄",
        document: "📋",
        unknown: "📁",
    };
    return iconMap[type] || "📁";
};
/**
 * Gets the appropriate color for a media type
 */
export const getTypeColor = (type) => {
    const colorMap = {
        image: "oklch(var(--success-color))",
        video: "oklch(var(--info-color))",
        audio: "oklch(var(--warning-color))",
        text: "oklch(var(--primary-color))",
        document: "oklch(var(--secondary-color))",
        unknown: "oklch(var(--text-muted))",
    };
    return colorMap[type] || "oklch(var(--text-muted))";
};
