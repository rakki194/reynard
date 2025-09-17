/**
 * 🦊 Reynard Language Analyzer
 *
 * *whiskers twitch with intelligence* Analyzes code by language
 * with fox-like strategic precision.
 */
import { LanguageAnalysis } from "./types";
export declare class LanguageAnalyzer {
    private readonly fileDiscovery;
    constructor();
    /**
     * 🦊 Analyze files by language
     */
    analyzeLanguages(files: string[]): Promise<LanguageAnalysis[]>;
    /**
     * 🦊 Get language statistics for a specific language
     */
    getLanguageStats(analyses: LanguageAnalysis[], language: string): LanguageAnalysis | null;
    /**
     * 🦊 Get total lines across all languages
     */
    getTotalLines(analyses: LanguageAnalysis[]): number;
    /**
     * 🦊 Get total files across all languages
     */
    getTotalFiles(analyses: LanguageAnalysis[]): number;
    /**
     * 🦊 Get language distribution as percentages
     */
    getLanguageDistribution(analyses: LanguageAnalysis[]): Array<{
        language: string;
        percentage: number;
    }>;
}
