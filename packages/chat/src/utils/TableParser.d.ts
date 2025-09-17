/**
 * Table Parser for Reynard Chat System
 *
 * This module handles markdown table parsing with support for alignment,
 * headers, and complex table structures.
 */
import { BaseMarkdownParser } from "./BaseMarkdownParser";
import type { ParseResult } from "../types";
export declare class TableParser extends BaseMarkdownParser {
    /**
     * Parse a single line for table elements
     */
    parseLine(line: string): boolean;
    /**
     * Finalize parsing and return result
     */
    finalize(): ParseResult;
    /**
     * Handle table rows
     */
    private handleTableRow;
    /**
     * Handle table separators
     */
    private handleTableSeparator;
    /**
     * Flush the current table
     */
    protected flushCurrentNode(): void;
    /**
     * Validate table structure
     */
    private validateTable;
    /**
     * Format table for output
     */
    private formatTable;
}
