/**
 * Base Markdown Parser for Reynard Chat System
 *
 * This module provides the foundational parsing infrastructure and common utilities
 * for all specialized markdown parsers.
 */

import { createNode } from "./parsing-utils";
import { SectionCloser } from "./block/SectionCloser";
import type {
  MarkdownNode,
  StreamingParserState,
  ParseResult,
  ParserError,
} from "../types";

export abstract class BaseMarkdownParser {
  protected state: StreamingParserState;
  protected startTime: number;

  constructor() {
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

  /**
   * Abstract method for parsing a single line
   */
  abstract parseLine(line: string): boolean;

  /**
   * Abstract method for finalizing parsing
   */
  abstract finalize(): ParseResult;

  /**
   * Add a node to the parse result
   */
  protected addNode(node: MarkdownNode): void {
    this.state.nodes.push(node);
  }

  /**
   * Create a complete node with required properties
   */
  protected createNode(node: Partial<MarkdownNode>): MarkdownNode {
    return createNode(node);
  }

  /**
   * Add an error to the parse result
   */
  protected addError(error: ParserError): void {
    this.state.errors.push(error);
  }

  /**
   * Add a warning to the parse result
   */
  protected addWarning(warning: string): void {
    this.state.warnings.push(warning);
  }

  /**
   * Check if a line matches a pattern
   */
  protected matches(line: string, pattern: RegExp): RegExpMatchArray | null {
    return line.match(pattern);
  }

  /**
   * Extract inline thinking from a line
   */
  protected extractInlineThinking(line: string): string {
    // Remove inline thinking patterns like <think>content</think>
    return line.replace(/<think>.*?<\/think>/g, "");
  }

  /**
   * Flush the current node if it exists
   */
  protected flushCurrentNode(): void {
    // This would be implemented by subclasses
  }

  /**
   * Close any open sections
   */
  protected closeOpenSections(): void {
    SectionCloser.closeAllSections(this.state, (node) =>
      this.addNode(this.createNode(node)),
    );
  }

  /**
   * Get the current parsing state
   */
  protected getState(): StreamingParserState {
    return { ...this.state };
  }

  /**
   * Set the current parsing state
   */
  protected setState(newState: Partial<StreamingParserState>): void {
    this.state = { ...this.state, ...newState };
  }

  /**
   * Increment the current line number
   */
  protected incrementLine(): void {
    this.state.currentLine++;
  }

  /**
   * Get parsing duration
   */
  protected getDuration(): number {
    return Date.now() - this.startTime;
  }
}
