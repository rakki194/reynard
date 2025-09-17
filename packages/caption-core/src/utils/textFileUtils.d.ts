/**
 * Text File Utilities for Reynard Caption System
 *
 * Utility functions for processing text files and detecting language types.
 */
import { TextFile } from "../types/TextTypes";
/**
 * Extracts file extension from filename
 */
export declare const getFileExtension: (filename: string) => string;
/**
 * Detects programming language based on file extension
 */
export declare const detectLanguage: (filename: string, _content?: string) => string;
/**
 * Gets appropriate file icon based on extension
 */
export declare const getTextFileIcon: (extension: string) => string;
/**
 * Processes uploaded file and creates TextFile object
 */
export declare const processTextFile: (file: File) => Promise<TextFile>;
