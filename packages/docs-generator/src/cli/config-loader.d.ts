/**
 * @fileoverview Configuration loader for Reynard documentation generator CLI
 */
/**
 * Loads configuration from file or creates default configuration
 */
export declare class ConfigLoader {
    /**
     * Load configuration from file or create default
     */
    loadConfiguration(configPath: string): Promise<any>;
    /**
     * Check if file exists
     */
    private fileExists;
    /**
     * Create default configuration
     */
    private createDefaultConfig;
}
