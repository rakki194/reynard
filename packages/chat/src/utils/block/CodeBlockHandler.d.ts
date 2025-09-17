/**
 * Code Block Handler for Block Parser
 *
 * Handles parsing of code blocks and indented code
 */
import type { StreamingParserState } from "../../types";
export declare class CodeBlockHandler {
    /**
     * Handle code block parsing
     */
    static handleCodeBlock(line: string, state: StreamingParserState, addNode: (node: any) => void): boolean;
}
