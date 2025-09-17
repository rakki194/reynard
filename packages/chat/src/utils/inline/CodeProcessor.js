/**
 * Code Processor for Code Spans and Inline Code
 */
import { InlineProcessor } from "./InlineProcessor";
import { MARKDOWN_PATTERNS } from "../patterns";
export class CodeProcessor extends InlineProcessor {
    constructor() {
        super(...arguments);
        Object.defineProperty(this, "nodes", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
    }
    process(text) {
        return text.replace(MARKDOWN_PATTERNS.code, (match, content) => {
            // Create a code node for tracking
            this.nodes.push(this.createTrackingNode({
                type: "code",
                content: content.trim(),
                inline: true,
            }));
            return `<code>${content}</code>`;
        });
    }
    getNodes() {
        return this.nodes;
    }
    clearNodes() {
        this.nodes = [];
    }
}
