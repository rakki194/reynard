/**
 * Base Markdown Parser for Reynard Chat System
 *
 * This module provides the foundational parsing infrastructure and common utilities
 * for all specialized markdown parsers.
 */
import type { MarkdownNode, StreamingParserState, ParseResult, ParserError } from "../types";
export declare abstract class BaseMarkdownParser {
    protected state: StreamingParserState;
    protected startTime: number;
    constructor();
    /**
     * Abstract method for parsing a single line
     */
    abstract parseLine(line: string): boolean;
    /**
     * Abstract method for finalizing parsing
     */
    abstract finalize(): ParseResult;
    /**
     * Add a node to the parse result
     */
    protected addNode(node: MarkdownNode): void;
    /**
     * Create a complete node with required properties
     */
    protected createNode(node: Partial<MarkdownNode>): MarkdownNode;
    /**
     * Add an error to the parse result
     */
    protected addError(error: ParserError): void;
    /**
     * Add a warning to the parse result
     */
    protected addWarning(warning: string): void;
    /**
     * Check if a line matches a pattern
     */
    protected matches(line: string, pattern: RegExp): RegExpMatchArray | null;
    /**
     * Extract inline thinking from a line
     */
    protected extractInlineThinking(line: string): string;
    /**
     * Flush the current node if it exists
     */
    protected flushCurrentNode(): void;
    /**
     * Close any open sections
     */
    protected closeOpenSections(): void;
    /**
     * Get the current parsing state
     */
    protected getState(): StreamingParserState;
    /**
     * Set the current parsing state
     */
    protected setState(newState: Partial<StreamingParserState>): void;
    /**
     * Increment the current line number
     */
    protected incrementLine(): void;
    /**
     * Get parsing duration
     */
    protected getDuration(): number;
}
