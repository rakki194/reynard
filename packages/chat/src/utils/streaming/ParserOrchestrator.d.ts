/**
 * Parser Orchestrator for Reynard Chat System
 *
 * Orchestrates the execution of specialized parsers in the correct order
 * and manages their interactions.
 */
export declare class ParserOrchestrator {
    private parsers;
    constructor();
    /**
     * Parse a single line through all parsers
     */
    parseLine(line: string): void;
    /**
     * Finalize all parsers and combine results
     */
    finalize(): {
        allNodes: any[];
        allErrors: any[];
        allWarnings: string[];
    };
    /**
     * Get thinking sections
     */
    getThinkingSections(): string[];
    /**
     * Check if currently in a thinking section
     */
    isInThinkingSection(): boolean;
    /**
     * Clear thinking sections
     */
    clearThinkingSections(): void;
}
