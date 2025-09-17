/**
 * 🦊 Security File Processor
 *
 * *whiskers twitch with cunning* Utility functions for processing files
 * in security analysis context.
 */
import { extname } from "path";
/**
 * 🦊 Group files by language
 */
export function groupFilesByLanguage(files) {
    const grouped = new Map();
    for (const file of files) {
        const language = detectLanguage(file);
        if (!grouped.has(language)) {
            grouped.set(language, []);
        }
        grouped.get(language).push(file);
    }
    return grouped;
}
/**
 * 🦊 Detect file language
 */
export function detectLanguage(file) {
    const ext = extname(file);
    const languageMap = {
        ".py": "python",
        ".ts": "typescript",
        ".tsx": "typescript",
        ".js": "javascript",
        ".jsx": "javascript",
        ".sh": "shell",
        ".md": "markdown",
        ".yml": "yaml",
        ".yaml": "yaml",
        ".json": "json",
    };
    return languageMap[ext] || "unknown";
}
/**
 * 🦊 Get files relevant to a security tool
 */
export function getRelevantFiles(filesByLanguage, supportedLanguages) {
    const relevantFiles = [];
    for (const language of supportedLanguages) {
        const files = filesByLanguage.get(language) || [];
        relevantFiles.push(...files);
    }
    return relevantFiles;
}
