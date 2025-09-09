/**
 * Code Processor for Code Spans and Inline Code
 */

import { InlineProcessor } from "./InlineProcessor";
import { MARKDOWN_PATTERNS } from "../patterns";

export class CodeProcessor extends InlineProcessor {
  private nodes: any[] = [];

  process(text: string): string {
    return text.replace(MARKDOWN_PATTERNS.code, (match, content) => {
      // Create a code node for tracking
      this.nodes.push(
        this.createTrackingNode({
          type: "code",
          content: content.trim(),
          inline: true,
        }),
      );
      return `<code>${content}</code>`;
    });
  }

  getNodes(): any[] {
    return this.nodes;
  }

  clearNodes(): void {
    this.nodes = [];
  }
}
