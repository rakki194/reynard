/**
 * Section Closer for Base Markdown Parser
 *
 * Handles closing of various open sections during parsing finalization
 */
import type { StreamingParserState } from "../../types";
export declare class SectionCloser {
    /**
     * Close all open sections
     */
    static closeAllSections(state: StreamingParserState, addNode: (node: any) => void): void;
    private static closeThinkingSections;
    private static closeCodeBlocks;
    private static closeTables;
    private static closeBlockquotes;
    private static closeLists;
    private static closeMathBlocks;
    private static closeHtmlBlocks;
}
