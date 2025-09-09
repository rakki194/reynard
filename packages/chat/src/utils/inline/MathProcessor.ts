/**
 * Math Processor for Inline Math Expressions
 */

import { InlineProcessor } from "./InlineProcessor";
import { MARKDOWN_PATTERNS } from "../patterns";

export class MathProcessor extends InlineProcessor {
  private nodes: any[] = [];

  process(text: string): string {
    return text.replace(MARKDOWN_PATTERNS.mathInline, (match, content) => {
      // Create a math node for tracking
      this.nodes.push(
        this.createTrackingNode({
          type: "math",
          content: content.trim(),
          inline: true,
        }),
      );
      return `<span class="math-inline">${content}</span>`;
    });
  }

  getNodes(): any[] {
    return this.nodes;
  }

  clearNodes(): void {
    this.nodes = [];
  }
}
