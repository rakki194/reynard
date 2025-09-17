/**
 * 🦊 Reynard Language Analyzer
 *
 * *whiskers twitch with intelligence* Analyzes code by language
 * with fox-like strategic precision.
 */
import { FileDiscoveryService } from "./FileDiscoveryService";
export class LanguageAnalyzer {
    constructor() {
        Object.defineProperty(this, "fileDiscovery", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.fileDiscovery = new FileDiscoveryService();
    }
    /**
     * 🦊 Analyze files by language
     */
    async analyzeLanguages(files) {
        const languageMap = new Map();
        for (const file of files) {
            const language = this.fileDiscovery.detectLanguage(file);
            const lines = await this.fileDiscovery.countLines(file);
            if (!languageMap.has(language)) {
                languageMap.set(language, { files: 0, lines: 0, issues: 0 });
            }
            const stats = languageMap.get(language);
            stats.files++;
            stats.lines += lines;
        }
        return Array.from(languageMap.entries()).map(([language, stats]) => ({
            language,
            files: stats.files,
            lines: stats.lines,
            issues: stats.issues,
            coverage: 0, // Will be calculated separately
        }));
    }
    /**
     * 🦊 Get language statistics for a specific language
     */
    getLanguageStats(analyses, language) {
        return analyses.find(analysis => analysis.language === language) || null;
    }
    /**
     * 🦊 Get total lines across all languages
     */
    getTotalLines(analyses) {
        return analyses.reduce((total, analysis) => total + analysis.lines, 0);
    }
    /**
     * 🦊 Get total files across all languages
     */
    getTotalFiles(analyses) {
        return analyses.reduce((total, analysis) => total + analysis.files, 0);
    }
    /**
     * 🦊 Get language distribution as percentages
     */
    getLanguageDistribution(analyses) {
        const totalLines = this.getTotalLines(analyses);
        return analyses.map(analysis => ({
            language: analysis.language,
            percentage: totalLines > 0 ? (analysis.lines / totalLines) * 100 : 0,
        }));
    }
}
