/**
 * Thinking Section Core Logic
 *
 * Contains the core parsing logic for thinking sections
 */
export declare class ThinkingCore {
    /**
     * Handle thinking sections
     */
    static handleThinkingSection(line: string, state: {
        inThinking: boolean;
        thinkingBuffer: string;
        thinkingSections: string[];
        currentLine: number;
    }, addWarning: (message: string) => void, addNode: (node: any) => void, createNode: (data: any) => any): boolean;
    /**
     * Extract inline thinking from a line
     */
    static extractInlineThinking(line: string, state: {
        currentLine: number;
    }, addNode: (node: any) => void, createNode: (data: any) => any): string;
}
