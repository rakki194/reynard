/**
 * 🦦 Reynard File Discovery Service
 *
 * *splashes with enthusiasm* Discovers and filters relevant files
 * for code quality analysis with otter-like thoroughness.
 */
import { readFile, readdir } from "fs/promises";
import { extname, join } from "path";
export class FileDiscoveryService {
    constructor() {
        Object.defineProperty(this, "excludePatterns", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [
                "node_modules",
                ".git",
                "dist",
                "build",
                "coverage",
                "venv",
                "__pycache__",
                ".pytest_cache",
                "third_party",
            ]
        });
        Object.defineProperty(this, "supportedExtensions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: [".ts", ".tsx", ".js", ".jsx", ".py", ".sh", ".md", ".yml", ".yaml", ".json"]
        });
    }
    /**
     * 🦦 Discover all relevant files in the project
     */
    async discoverFiles(projectRoot) {
        const files = [];
        await this.scanDirectory(projectRoot, files, this.excludePatterns);
        return files;
    }
    async scanDirectory(dir, files, excludePatterns) {
        try {
            const entries = await readdir(dir);
            for (const entry of entries) {
                const fullPath = join(dir, entry);
                const stat = await readFile(fullPath).catch(() => null);
                if (stat) {
                    // It's a file
                    const ext = extname(entry);
                    if (this.isSupportedFile(ext)) {
                        files.push(fullPath);
                    }
                }
                else {
                    // It's a directory
                    if (!excludePatterns.some(pattern => entry.includes(pattern))) {
                        await this.scanDirectory(fullPath, files, excludePatterns);
                    }
                }
            }
        }
        catch (error) {
            // Ignore permission errors
        }
    }
    isSupportedFile(extension) {
        return this.supportedExtensions.includes(extension);
    }
    /**
     * 🦦 Count lines in a file
     */
    async countLines(file) {
        try {
            const content = await readFile(file, "utf-8");
            return content.split("\n").length;
        }
        catch {
            return 0;
        }
    }
    /**
     * 🦦 Detect language from file extension
     */
    detectLanguage(file) {
        const ext = extname(file);
        const languageMap = {
            ".ts": "typescript",
            ".tsx": "typescript",
            ".js": "javascript",
            ".jsx": "javascript",
            ".py": "python",
            ".sh": "shell",
            ".md": "markdown",
            ".yml": "yaml",
            ".yaml": "yaml",
            ".json": "json",
        };
        return languageMap[ext] || "unknown";
    }
}
