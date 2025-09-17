/**
 * Thinking Section Validation Utilities
 *
 * Contains validation and formatting functions for thinking sections
 */
export declare class ThinkingValidation {
    /**
     * Validate thinking section structure
     */
    static validateThinkingSections(inThinking: boolean, thinkingSections: string[], addWarning: (message: string) => void): boolean;
    /**
     * Format thinking sections for output
     */
    static formatThinkingSections(thinkingSections: string[]): string;
}
