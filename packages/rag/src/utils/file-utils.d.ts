/**
 * File Utility Functions
 *
 * Utility functions for file handling, language detection, and content processing.
 */
export declare const getLanguageFromExtension: (ext: string) => string;
export declare const getFileExtension: (fileName: string) => string;
export declare const downloadFile: (content: string, fileName: string) => void;
export declare const copyToClipboard: (content: string) => Promise<void>;
export declare const chunkContent: (content: string, chunkSize?: number) => string[];
