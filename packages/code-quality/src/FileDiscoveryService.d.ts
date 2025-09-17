/**
 * 🦦 Reynard File Discovery Service
 *
 * *splashes with enthusiasm* Discovers and filters relevant files
 * for code quality analysis with otter-like thoroughness.
 */
export declare class FileDiscoveryService {
    private readonly excludePatterns;
    private readonly supportedExtensions;
    /**
     * 🦦 Discover all relevant files in the project
     */
    discoverFiles(projectRoot: string): Promise<string[]>;
    private scanDirectory;
    private isSupportedFile;
    /**
     * 🦦 Count lines in a file
     */
    countLines(file: string): Promise<number>;
    /**
     * 🦦 Detect language from file extension
     */
    detectLanguage(file: string): string;
}
