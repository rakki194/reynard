/**
 * Language Detection Utilities
 *
 * Provides utilities for detecting programming languages and extracting
 * dependencies from code files.
 */
/**
 * Detect programming language from file extension
 */
export declare function detectProgrammingLanguage(extension: string): string;
/**
 * Extract dependencies from code content based on file type
 */
export declare function extractDependencies(content: string, extension: string): string[];
/**
 * Detect code purpose from filename
 */
export declare function detectCodePurpose(extension: string): string;
