/**
 * Base Inline Processor for Reynard Chat System
 *
 * Abstract base class for processing inline markdown elements.
 */
import type { MarkdownNode } from "../../types";
export declare abstract class InlineProcessor {
    protected currentLine: number;
    /**
     * Process inline elements in text
     */
    abstract process(text: string): string;
    /**
     * Set the current line number
     */
    setLineNumber(line: number): void;
    /**
     * Create a node for tracking
     */
    protected createTrackingNode(node: Partial<MarkdownNode>): MarkdownNode;
}
