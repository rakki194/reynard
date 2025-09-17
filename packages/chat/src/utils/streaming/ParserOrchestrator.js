/**
 * Parser Orchestrator for Reynard Chat System
 *
 * Orchestrates the execution of specialized parsers in the correct order
 * and manages their interactions.
 */
import { ThinkingSectionParser } from "../ThinkingSectionParser";
import { BlockParser } from "../BlockParser";
import { InlineParser } from "../InlineParser";
import { TableParser } from "../TableParser";
export class ParserOrchestrator {
    constructor() {
        Object.defineProperty(this, "parsers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.parsers = {
            thinking: new ThinkingSectionParser(),
            block: new BlockParser(),
            inline: new InlineParser(),
            table: new TableParser(),
        };
    }
    /**
     * Parse a single line through all parsers
     */
    parseLine(line) {
        // Handle thinking sections first (highest priority)
        if (this.parsers.thinking.parseLine(line)) {
            return;
        }
        // Skip processing content inside thinking sections
        if (this.parsers.thinking.isInThinkingSection()) {
            return;
        }
        // Handle tables
        if (this.parsers.table.parseLine(line)) {
            return;
        }
        // Handle block elements
        if (this.parsers.block.parseLine(line)) {
            return;
        }
        // Handle inline elements (for remaining content)
        this.parsers.inline.parseLine(line);
    }
    /**
     * Finalize all parsers and combine results
     */
    finalize() {
        const thinkingResult = this.parsers.thinking.finalize();
        const blockResult = this.parsers.block.finalize();
        const inlineResult = this.parsers.inline.finalize();
        const tableResult = this.parsers.table.finalize();
        // Combine results
        const allNodes = [
            ...thinkingResult.nodes,
            ...blockResult.nodes,
            ...inlineResult.nodes,
            ...tableResult.nodes,
        ];
        const allErrors = [
            ...thinkingResult.errors,
            ...blockResult.errors,
            ...inlineResult.errors,
            ...tableResult.errors,
        ];
        const allWarnings = [
            ...(thinkingResult.warnings || []),
            ...(blockResult.warnings || []),
            ...(inlineResult.warnings || []),
            ...(tableResult.warnings || []),
        ];
        return { allNodes, allErrors, allWarnings };
    }
    /**
     * Get thinking sections
     */
    getThinkingSections() {
        return this.parsers.thinking.getThinkingSections();
    }
    /**
     * Check if currently in a thinking section
     */
    isInThinkingSection() {
        return this.parsers.thinking.isInThinkingSection();
    }
    /**
     * Clear thinking sections
     */
    clearThinkingSections() {
        this.parsers.thinking.clearThinkingSections();
    }
}
