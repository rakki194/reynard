/**
 * Streaming Coordinator for Reynard Chat System
 *
 * Manages the coordination between different parsers during streaming
 * markdown processing.
 */
import type { StreamingParserState, ParseResult } from "../../types";
export declare class StreamingCoordinator {
    private state;
    private startTime;
    constructor(initialState: StreamingParserState);
    /**
     * Update the parsing state
     */
    updateState(updates: Partial<StreamingParserState>): void;
    /**
     * Get current state
     */
    getState(): StreamingParserState;
    /**
     * Add a node to the parse result
     */
    addNode(node: Partial<any>): void;
    /**
     * Handle code block streaming
     */
    handleCodeBlock(line: string): boolean;
    /**
     * Process buffer content
     */
    processBuffer(chunk: string): string[];
    /**
     * Finalize and create result
     */
    finalize(allNodes: any[], allErrors: any[], allWarnings: string[]): ParseResult;
    /**
     * Reset coordinator state
     */
    reset(): void;
}
