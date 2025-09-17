/**
 * Base Markdown Parser for Reynard Chat System
 *
 * This module provides the foundational parsing infrastructure and common utilities
 * for all specialized markdown parsers.
 */
import { createNode } from "./parsing-utils";
import { SectionCloser } from "./block/SectionCloser";
export class BaseMarkdownParser {
    constructor() {
        Object.defineProperty(this, "state", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "startTime", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.startTime = Date.now();
        this.state = {
            nodes: [],
            currentNode: null,
            currentLine: 0,
            inCodeBlock: false,
            codeBlockLanguage: "",
            codeBlockContent: [],
            inThinking: false,
            thinkingBuffer: "",
            thinkingSections: [],
            inTable: false,
            tableHeaders: [],
            tableRows: [],
            inBlockquote: false,
            blockquoteContent: [],
            inList: false,
            listType: "unordered",
            listLevel: 0,
            listItems: [],
            inMathBlock: false,
            mathBlockContent: [],
            inHtmlBlock: false,
            htmlBlockContent: [],
            listStack: [],
            buffer: "",
            lastProcessedLength: 0,
            lineNumber: 0,
            errors: [],
            warnings: [],
        };
    }
    /**
     * Add a node to the parse result
     */
    addNode(node) {
        this.state.nodes.push(node);
    }
    /**
     * Create a complete node with required properties
     */
    createNode(node) {
        return createNode(node);
    }
    /**
     * Add an error to the parse result
     */
    addError(error) {
        this.state.errors.push(error);
    }
    /**
     * Add a warning to the parse result
     */
    addWarning(warning) {
        this.state.warnings.push(warning);
    }
    /**
     * Check if a line matches a pattern
     */
    matches(line, pattern) {
        return line.match(pattern);
    }
    /**
     * Extract inline thinking from a line
     */
    extractInlineThinking(line) {
        // Remove inline thinking patterns like <think>content</think>
        return line.replace(/<think>.*?<\/think>/g, "");
    }
    /**
     * Flush the current node if it exists
     */
    flushCurrentNode() {
        // This would be implemented by subclasses
    }
    /**
     * Close any open sections
     */
    closeOpenSections() {
        SectionCloser.closeAllSections(this.state, (node) => this.addNode(this.createNode(node)));
    }
    /**
     * Get the current parsing state
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Set the current parsing state
     */
    setState(newState) {
        this.state = { ...this.state, ...newState };
    }
    /**
     * Increment the current line number
     */
    incrementLine() {
        this.state.currentLine++;
    }
    /**
     * Get parsing duration
     */
    getDuration() {
        return Date.now() - this.startTime;
    }
}
