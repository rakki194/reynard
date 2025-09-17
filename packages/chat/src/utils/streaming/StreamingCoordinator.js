/**
 * Streaming Coordinator for Reynard Chat System
 *
 * Manages the coordination between different parsers during streaming
 * markdown processing.
 */
import { createNode } from "../parsing-utils";
export class StreamingCoordinator {
    constructor(initialState) {
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
        this.state = { ...initialState };
        this.startTime = Date.now();
    }
    /**
     * Update the parsing state
     */
    updateState(updates) {
        this.state = { ...this.state, ...updates };
    }
    /**
     * Get current state
     */
    getState() {
        return { ...this.state };
    }
    /**
     * Add a node to the parse result
     */
    addNode(node) {
        this.state.nodes.push(createNode(node));
    }
    /**
     * Handle code block streaming
     */
    handleCodeBlock(line) {
        // Start of code block
        const codeBlockStart = /^```(\w*)\s*$/;
        const startMatch = line.match(codeBlockStart);
        if (startMatch) {
            this.state.inCodeBlock = true;
            this.state.codeBlockLanguage = startMatch[1] || "";
            this.state.codeBlockContent = [];
            return true;
        }
        // End of code block
        const codeBlockEnd = /^```\s*$/;
        const endMatch = line.match(codeBlockEnd);
        if (endMatch && this.state.inCodeBlock) {
            this.addNode({
                type: "code",
                language: this.state.codeBlockLanguage,
                content: this.state.codeBlockContent.join("\n"),
                line: this.state.currentLine,
            });
            this.state.inCodeBlock = false;
            this.state.codeBlockContent = [];
            this.state.codeBlockLanguage = "";
            return true;
        }
        // Content inside code block
        if (this.state.inCodeBlock) {
            this.state.codeBlockContent.push(line);
            return true;
        }
        return false;
    }
    /**
     * Process buffer content
     */
    processBuffer(chunk) {
        this.state.buffer += chunk;
        const lines = this.state.buffer.split("\n");
        // Keep the last line in buffer (might be incomplete)
        this.state.buffer = lines.pop() || "";
        return lines;
    }
    /**
     * Finalize and create result
     */
    finalize(allNodes, allErrors, allWarnings) {
        // Process any remaining buffer content
        if (this.state.buffer.trim()) {
            this.state.currentLine++;
        }
        // Close any open code blocks
        if (this.state.inCodeBlock) {
            this.addNode({
                type: "code",
                language: this.state.codeBlockLanguage,
                content: this.state.codeBlockContent.join("\n"),
                line: this.state.currentLine,
            });
        }
        return {
            html: "",
            nodes: allNodes,
            isComplete: true,
            hasThinking: this.state.thinkingSections.length > 0,
            thinking: this.state.thinkingSections,
            errors: allErrors,
            warnings: allWarnings,
            duration: Date.now() - this.startTime,
            stats: {
                totalNodes: allNodes.length,
                processedChars: 0,
                parsingTime: Date.now() - this.startTime,
                lineCount: this.state.currentLine,
            },
        };
    }
    /**
     * Reset coordinator state
     */
    reset() {
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
}
