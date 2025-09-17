/**
 * List Handler for Block Parser
 *
 * Handles parsing of different types of lists (unordered, ordered, task lists)
 */
import type { StreamingParserState } from "../../types";
export declare class ListHandler {
    /**
     * Handle list parsing
     */
    static handleList(line: string, state: StreamingParserState): boolean;
    private static handleUnorderedList;
    private static handleNumberedList;
    private static handleTaskList;
    private static flushCurrentList;
}
