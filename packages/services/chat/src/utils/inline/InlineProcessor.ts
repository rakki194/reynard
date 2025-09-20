/**
 * Base Inline Processor for Reynard Chat System
 *
 * Abstract base class for processing inline markdown elements.
 */

import type { MarkdownNode } from "../../types";
import { createNode } from "../parsing-utils";

export abstract class InlineProcessor {
  protected currentLine: number = 0;

  /**
   * Process inline elements in text
   */
  abstract process(text: string): string;

  /**
   * Set the current line number
   */
  setLineNumber(line: number): void {
    this.currentLine = line;
  }

  /**
   * Create a node for tracking
   */
  protected createTrackingNode(node: Partial<MarkdownNode>): MarkdownNode {
    return createNode({
      ...node,
      line: this.currentLine,
    });
  }
}
