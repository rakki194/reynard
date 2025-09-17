/**
 * Base Inline Processor for Reynard Chat System
 *
 * Abstract base class for processing inline markdown elements.
 */
import { createNode } from "../parsing-utils";
export class InlineProcessor {
    constructor() {
        Object.defineProperty(this, "currentLine", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
    }
    /**
     * Set the current line number
     */
    setLineNumber(line) {
        this.currentLine = line;
    }
    /**
     * Create a node for tracking
     */
    createTrackingNode(node) {
        return createNode({
            ...node,
            line: this.currentLine,
        });
    }
}
