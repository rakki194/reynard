/**
 * Streaming Coordinator for Reynard Chat System
 *
 * Manages the coordination between different parsers during streaming
 * markdown processing.
 */

import type { StreamingParserState, ParseResult } from "../../types";
import { createNode } from "../parsing-utils";

export class StreamingCoordinator {
  private state: StreamingParserState;
  private startTime: number;

  constructor(initialState: StreamingParserState) {
    this.state = { ...initialState };
    this.startTime = Date.now();
  }

  /**
   * Update the parsing state
   */
  updateState(updates: Partial<StreamingParserState>): void {
    this.state = { ...this.state, ...updates };
  }

  /**
   * Get current state
   */
  getState(): StreamingParserState {
    return { ...this.state };
  }

  /**
   * Add a node to the parse result
   */
  addNode(node: Partial<any>): void {
    this.state.nodes.push(createNode(node));
  }

  /**
   * Handle code block streaming
   */
  handleCodeBlock(line: string): boolean {
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
  processBuffer(chunk: string): string[] {
    this.state.buffer += chunk;
    const lines = this.state.buffer.split('\n');
    
    // Keep the last line in buffer (might be incomplete)
    this.state.buffer = lines.pop() || '';
    
    return lines;
  }

  /**
   * Finalize and create result
   */
  finalize(allNodes: any[], allErrors: any[], allWarnings: string[]): ParseResult {
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
  reset(): void {
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
