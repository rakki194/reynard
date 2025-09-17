/**
 * Table Utilities for Reynard Chat System
 *
 * Helper functions for table validation and formatting.
 */
import type { StreamingParserState, ParserError } from "../types";
export declare class TableUtils {
    /**
     * Validate table structure
     */
    static validateTable(state: StreamingParserState, addError: (error: ParserError) => void, addWarning: (warning: string) => void): boolean;
    /**
     * Format table for output
     */
    static formatTable(state: StreamingParserState): string;
}
