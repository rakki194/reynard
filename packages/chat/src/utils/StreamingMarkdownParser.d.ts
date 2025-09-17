/**
 * Advanced Streaming Markdown Parser for Reynard Chat System
 *
 * Orchestrates specialized parsers to provide comprehensive markdown parsing
 * with streaming optimization and enhanced error handling.
 */
import type { MarkdownNode, StreamingParserState, ParseResult } from "../types";
export declare class StreamingMarkdownParser {
    private coordinator;
    private orchestrator;
    constructor();
    /**
     * Parse streaming markdown content
     */
    parseStream(chunk: string): void;
    /**
     * Parse a chunk of content (alias for parseStream)
     */
    parseChunk(chunk: string): ParseResult;
    /**
     * Get the current parse result
     */
    getResult(): ParseResult;
    /**
     * Create a complete node with required properties
     */
    protected createNode(node: Partial<MarkdownNode>): MarkdownNode;
    /**
     * Parse a single line
     */
    private parseLine;
    /**
     * Finalize parsing and return result
     */
    finalize(): ParseResult;
    /**
     * Parse complete markdown text
     */
    parse(text: string): ParseResult;
    /**
     * Reset parser state
     */
    reset(): void;
    /**
     * Get current parsing state
     */
    getState(): StreamingParserState;
    /**
     * Get thinking sections
     */
    getThinkingSections(): string[];
    /**
     * Check if currently in a thinking section
     */
    isInThinkingSection(): boolean;
    /**
     * Get parsing duration
     */
    getDuration(): number;
}
export declare function createStreamingMarkdownParser(): StreamingMarkdownParser;
export declare function parseMarkdown(text: string): ParseResult;
export declare function parseMarkdownStream(chunks: string[]): ParseResult;
