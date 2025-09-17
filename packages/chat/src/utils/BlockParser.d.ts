/**
 * Block Parser for Reynard Chat System
 *
 * This module handles block-level markdown elements like headers, code blocks,
 * lists, blockquotes, and horizontal rules.
 */
import { BaseMarkdownParser } from "./BaseMarkdownParser";
import type { ParseResult } from "../types";
export declare class BlockParser extends BaseMarkdownParser {
    /**
     * Parse a single line for block elements
     */
    parseLine(line: string): boolean;
    /**
     * Finalize parsing and return result
     */
    finalize(): ParseResult;
    /**
     * Handle horizontal rules
     */
    private handleHorizontalRule;
    /**
     * Handle headings
     */
    private handleHeading;
    /**
     * Handle code blocks
     */
    private handleCodeBlock;
    /**
     * Handle lists
     */
    private handleList;
    /**
     * Handle blockquotes
     */
    private handleBlockquote;
    /**
     * Flush the current node if it exists
     */
    protected flushCurrentNode(): void;
}
