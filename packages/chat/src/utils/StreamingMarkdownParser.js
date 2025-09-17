/**
 * Advanced Streaming Markdown Parser for Reynard Chat System
 *
 * Orchestrates specialized parsers to provide comprehensive markdown parsing
 * with streaming optimization and enhanced error handling.
 */
import { StreamingCoordinator } from "./streaming/StreamingCoordinator";
import { ParserOrchestrator } from "./streaming/ParserOrchestrator";
export class StreamingMarkdownParser {
    constructor() {
        Object.defineProperty(this, "coordinator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "orchestrator", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        const initialState = {
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
        this.coordinator = new StreamingCoordinator(initialState);
        this.orchestrator = new ParserOrchestrator();
    }
    /**
     * Parse streaming markdown content
     */
    parseStream(chunk) {
        const lines = this.coordinator.processBuffer(chunk);
        // Process complete lines
        for (const line of lines) {
            this.parseLine(line);
        }
    }
    /**
     * Parse a chunk of content (alias for parseStream)
     */
    parseChunk(chunk) {
        this.parseStream(chunk);
        return this.getResult();
    }
    /**
     * Get the current parse result
     */
    getResult() {
        return this.finalize();
    }
    /**
     * Create a complete node with required properties
     */
    createNode(node) {
        return {
            type: node.type,
            content: node.content || "",
            isComplete: true,
            ...node,
        };
    }
    /**
     * Parse a single line
     */
    parseLine(line) {
        const state = this.coordinator.getState();
        this.coordinator.updateState({ currentLine: state.currentLine + 1 });
        // Handle code blocks first (special streaming case)
        if (this.coordinator.handleCodeBlock(line)) {
            return;
        }
        // Skip processing inside code blocks
        if (state.inCodeBlock) {
            return;
        }
        // Delegate to orchestrator for other parsing
        this.orchestrator.parseLine(line);
    }
    /**
     * Finalize parsing and return result
     */
    finalize() {
        const { allNodes, allErrors, allWarnings } = this.orchestrator.finalize();
        return this.coordinator.finalize(allNodes, allErrors, allWarnings);
    }
    /**
     * Parse complete markdown text
     */
    parse(text) {
        this.reset();
        this.parseStream(text);
        return this.finalize();
    }
    /**
     * Reset parser state
     */
    reset() {
        this.coordinator.reset();
        this.orchestrator.clearThinkingSections();
    }
    /**
     * Get current parsing state
     */
    getState() {
        return this.coordinator.getState();
    }
    /**
     * Get thinking sections
     */
    getThinkingSections() {
        return this.orchestrator.getThinkingSections();
    }
    /**
     * Check if currently in a thinking section
     */
    isInThinkingSection() {
        return this.orchestrator.isInThinkingSection();
    }
    /**
     * Get parsing duration
     */
    getDuration() {
        return this.coordinator.getState().currentLine; // This would need to be tracked properly
    }
}
// Utility functions
export function createStreamingMarkdownParser() {
    return new StreamingMarkdownParser();
}
export function parseMarkdown(text) {
    const parser = new StreamingMarkdownParser();
    return parser.parse(text);
}
export function parseMarkdownStream(chunks) {
    const parser = new StreamingMarkdownParser();
    for (const chunk of chunks) {
        parser.parseStream(chunk);
    }
    return parser.finalize();
}
