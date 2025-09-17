/**
 * Math Processor for Inline Math Expressions
 */
import { InlineProcessor } from "./InlineProcessor";
import { MARKDOWN_PATTERNS } from "../patterns";
export class MathProcessor extends InlineProcessor {
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
        return text.replace(MARKDOWN_PATTERNS.mathInline, (match, content) => {
            // Create a math node for tracking
            this.nodes.push(this.createTrackingNode({
                type: "math",
                content: content.trim(),
                inline: true,
            }));
            return `<span class="math-inline">${content}</span>`;
        });
    }
    getNodes() {
        return this.nodes;
    }
    clearNodes() {
        this.nodes = [];
    }
}
