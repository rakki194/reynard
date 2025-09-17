/**
 * File Processing Utilities for Multi-Modal Gallery
 *
 * Utility functions for file type determination and processing
 * logic used across the multi-modal gallery system.
 */
import { FileProcessingPipeline } from "reynard-file-processing";
import type { MultiModalFile, MediaType, FileCounts } from "../types/MultiModalTypes";
/**
 * Determines the media type of a file based on MIME type and extension
 */
export declare const determineFileType: (file: File) => MediaType;
/**
 * Processes a single file using the file processing pipeline
 */
export declare const processFile: (file: File, processingPipeline: FileProcessingPipeline) => Promise<MultiModalFile>;
/**
 * Calculates file counts by type from an array of files
 */
export declare const calculateFileCounts: (files: MultiModalFile[]) => FileCounts;
/**
 * Creates a file processing pipeline with default configuration
 */
export declare const createFileProcessingPipeline: () => FileProcessingPipeline;
/**
 * Gets the appropriate icon for a media type
 */
export declare const getFileIcon: (type: MediaType) => string;
/**
 * Gets the appropriate color for a media type
 */
export declare const getTypeColor: (type: MediaType) => string;
