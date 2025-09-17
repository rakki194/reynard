/**
 * Thinking Section Parser for Reynard Chat System
 *
 * This module handles parsing of thinking sections, which are special
 * markdown blocks that contain AI reasoning and thought processes.
 */
import { BaseMarkdownParser } from "./BaseMarkdownParser";
import type { ParseResult } from "../types";
export declare class ThinkingSectionParser extends BaseMarkdownParser {
    /**
     * Parse a single line for thinking sections
     */
    parseLine(line: string): boolean;
    /**
     * Finalize parsing and return result
     */
    finalize(): ParseResult;
    /**
     * Handle thinking sections
     */
    private handleThinkingSection;
    /**
     * Extract inline thinking from a line
     */
    protected extractInlineThinking(line: string): string;
    /**
     * Get all thinking sections
     */
    getThinkingSections(): string[];
    /**
     * Check if currently in a thinking section
     */
    isInThinkingSection(): boolean;
    /**
     * Get current thinking buffer
     */
    getThinkingBuffer(): string;
    /**
     * Clear thinking sections
     */
    clearThinkingSections(): void;
}
