/**
 * @fileoverview Main CLI runner for Reynard documentation generator
 */
import { CLIOptions } from "./arg-parser";
/**
 * Main CLI runner for the documentation generator
 */
export declare class ReynardDocsCLI {
    private argParser;
    private configLoader;
    constructor();
    /**
     * Parse command line arguments
     */
    parseArgs(args: string[]): CLIOptions;
    /**
     * Run the CLI
     */
    run(options: CLIOptions): Promise<void>;
}
