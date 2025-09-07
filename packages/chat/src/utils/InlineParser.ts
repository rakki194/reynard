/**
 * Inline Parser for Reynard Chat System
 *
 * Orchestrates specialized inline processors to handle inline markdown elements.
 */

import { BaseMarkdownParser } from "./BaseMarkdownParser";
import { MathProcessor } from "./inline/MathProcessor";
import { CodeProcessor } from "./inline/CodeProcessor";
import { MediaProcessor } from "./inline/MediaProcessor";
import { LinkProcessor } from "./inline/LinkProcessor";
import { FormattingProcessor } from "./inline/FormattingProcessor";
import { LineBreakProcessor } from "./inline/LineBreakProcessor";
import type { ParseResult, MarkdownNode } from "../types";

interface NodeProcessor {
  getNodes(): MarkdownNode[];
  clearNodes(): void;
}

export class InlineParser extends BaseMarkdownParser {
  private processors: {
    math: MathProcessor;
    code: CodeProcessor;
    media: MediaProcessor;
    link: LinkProcessor;
    formatting: FormattingProcessor;
    lineBreak: LineBreakProcessor;
  };

  constructor() {
    super();
    this.processors = {
      math: new MathProcessor(),
      code: new CodeProcessor(),
      media: new MediaProcessor(),
      link: new LinkProcessor(),
      formatting: new FormattingProcessor(),
      lineBreak: new LineBreakProcessor(),
    };
  }

  /**
   * Parse a single line for inline elements
   */
  parseLine(line: string): boolean {
    this.incrementLine();

    // Set line number for all processors
    Object.values(this.processors).forEach(processor => {
      processor.setLineNumber(this.state.currentLine);
    });

    // Process inline elements in the line
    const processedLine = this.processInlineElements(line);

    // Collect nodes from processors
    this.collectProcessorNodes();

    // If the line has content after processing, add as paragraph
    if (processedLine.trim()) {
      this.addNode(this.createNode({
        type: "paragraph",
        content: processedLine,
        line: this.state.currentLine,
      }));
      return true;
    }

    return false;
  }

  /**
   * Finalize parsing and return result
   */
  finalize(): ParseResult {
    return {
      html: "",
      nodes: this.state.nodes,
      isComplete: true,
      hasThinking: false,
      thinking: [],
      errors: this.state.errors,
      warnings: this.state.warnings,
      duration: this.getDuration(),
      stats: {
        totalNodes: this.state.nodes.length,
        processedChars: 0,
        parsingTime: this.getDuration(),
        lineCount: this.state.currentLine,
      },
    };
  }

  /**
   * Process inline elements in a line of text
   */
  private processInlineElements(line: string): string {
    let processed = line;

    // Process in order of priority (highest to lowest)
    processed = this.processors.math.process(processed);
    processed = this.processors.code.process(processed);
    processed = this.processors.media.process(processed);
    processed = this.processors.link.process(processed);
    processed = this.processors.formatting.process(processed);
    processed = this.processors.lineBreak.process(processed);

    return processed;
  }

  /**
   * Collect nodes from all processors
   */
  private collectProcessorNodes(): void {
    const nodeProcessors: NodeProcessor[] = [this.processors.math, this.processors.code, this.processors.media, this.processors.link];
    
    for (const processor of nodeProcessors) {
      const nodes = processor.getNodes();
      this.state.nodes.push(...nodes);
      processor.clearNodes();
    }
  }
}
