/**
 * 🦦 Reynard File Analyzer
 *
 * *splashes with thoroughness* Analyzes individual files with
 * otter-like attention to detail.
 */
import { FileAnalysis, QualityIssue } from "./types";
export declare class FileAnalyzer {
    private readonly fileDiscovery;
    constructor();
    /**
     * 🦦 Analyze files with their issues
     */
    analyzeFiles(files: string[], issues: QualityIssue[]): Promise<FileAnalysis[]>;
    /**
     * 🦦 Get files with most issues
     */
    getFilesWithMostIssues(analyses: FileAnalysis[], limit?: number): FileAnalysis[];
    /**
     * 🦦 Get files by language
     */
    getFilesByLanguage(analyses: FileAnalysis[], language: string): FileAnalysis[];
    /**
     * 🦦 Get files with no issues
     */
    getCleanFiles(analyses: FileAnalysis[]): FileAnalysis[];
    /**
     * 🦦 Get files with critical issues
     */
    getFilesWithCriticalIssues(analyses: FileAnalysis[]): FileAnalysis[];
    /**
     * 🦦 Calculate average complexity per file
     */
    calculateAverageComplexity(analyses: FileAnalysis[]): number;
    /**
     * 🦦 Calculate average issues per file
     */
    calculateAverageIssues(analyses: FileAnalysis[]): number;
}
