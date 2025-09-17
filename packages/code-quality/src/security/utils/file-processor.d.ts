/**
 * 🦊 Security File Processor
 *
 * *whiskers twitch with cunning* Utility functions for processing files
 * in security analysis context.
 */
/**
 * 🦊 Group files by language
 */
export declare function groupFilesByLanguage(files: string[]): Map<string, string[]>;
/**
 * 🦊 Detect file language
 */
export declare function detectLanguage(file: string): string;
/**
 * 🦊 Get files relevant to a security tool
 */
export declare function getRelevantFiles(filesByLanguage: Map<string, string[]>, supportedLanguages: string[]): string[];
