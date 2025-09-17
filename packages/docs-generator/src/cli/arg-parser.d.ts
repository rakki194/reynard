/**
 * @fileoverview Command line argument parser for Reynard documentation generator
 */
export interface CLIOptions {
    configPath: string;
    watch: boolean;
    verbose: boolean;
}
/**
 * Parses command line arguments for the documentation generator CLI
 */
export declare class ArgParser {
    private options;
    constructor();
    /**
     * Parse command line arguments
     */
    parseArgs(args: string[]): CLIOptions;
    /**
     * Show help information
     */
    private showHelp;
    /**
     * Show version information
     */
    private showVersion;
}
