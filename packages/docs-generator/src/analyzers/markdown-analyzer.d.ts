/**
 * @fileoverview Markdown analyzer for extracting documentation from markdown files
 */
import { DocPage } from "./types";
/**
 * Analyzes markdown files and extracts documentation pages
 */
export declare class MarkdownAnalyzer {
    private rootPath;
    private excludePatterns;
    constructor(config: {
        rootPath: string;
        includePatterns?: string[];
        excludePatterns?: string[];
    });
    /**
     * Analyze markdown files and extract documentation pages
     */
    analyzeMarkdownFiles(): Promise<DocPage[]>;
    /**
     * Find all markdown files in the project
     */
    private findMarkdownFiles;
    /**
     * Find markdown files in a directory recursively
     */
    private findMarkdownFilesInDirectory;
    /**
     * Analyze a single markdown file
     */
    private analyzeMarkdownFile;
}
