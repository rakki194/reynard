/**
 * Inline Parser for Reynard Chat System
 *
 * Orchestrates specialized inline processors to handle inline markdown elements.
 */
import { BaseMarkdownParser } from "./BaseMarkdownParser";
import type { ParseResult } from "../types";
export declare class InlineParser extends BaseMarkdownParser {
    private processors;
    constructor();
    /**
     * Parse a single line for inline elements
     */
    parseLine(line: string): boolean;
    /**
     * Finalize parsing and return result
     */
    finalize(): ParseResult;
    /**
     * Process inline elements in a line of text
     */
    private processInlineElements;
    /**
     * Collect nodes from all processors
     */
    private collectProcessorNodes;
}
