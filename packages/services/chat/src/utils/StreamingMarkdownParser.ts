/**
 * Advanced Streaming Markdown Parser for Reynard Chat System
 *
 * Orchestrates specialized parsers to provide comprehensive markdown parsing
 * with streaming optimization and enhanced error handling.
 */

import { StreamingCoordinator } from "./streaming/StreamingCoordinator";
import { ParserOrchestrator } from "./streaming/ParserOrchestrator";
import type { MarkdownNode, StreamingParserState, ParseResult } from "../types";

export class StreamingMarkdownParser {
  private coordinator: StreamingCoordinator;
  private orchestrator: ParserOrchestrator;

  constructor() {
    const initialState: StreamingParserState = {
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

    this.coordinator = new StreamingCoordinator(initialState);
    this.orchestrator = new ParserOrchestrator();
  }

  /**
   * Parse streaming markdown content
   */
  parseStream(chunk: string): void {
    const lines = this.coordinator.processBuffer(chunk);

    // Process complete lines
    for (const line of lines) {
      this.parseLine(line);
    }
  }

  /**
   * Parse a chunk of content (alias for parseStream)
   */
  parseChunk(chunk: string): ParseResult {
    this.parseStream(chunk);
    return this.getResult();
  }

  /**
   * Get the current parse result
   */
  getResult(): ParseResult {
    return this.finalize();
  }

  /**
   * Create a complete node with required properties
   */
  protected createNode(node: Partial<MarkdownNode>): MarkdownNode {
    return {
      type: node.type!,
      content: node.content || "",
      isComplete: true,
      ...node,
    };
  }

  /**
   * Parse a single line
   */
  private parseLine(line: string): void {
    const state = this.coordinator.getState();
    this.coordinator.updateState({ currentLine: state.currentLine + 1 });

    // Handle code blocks first (special streaming case)
    if (this.coordinator.handleCodeBlock(line)) {
      return;
    }

    // Skip processing inside code blocks
    if (state.inCodeBlock) {
      return;
    }

    // Delegate to orchestrator for other parsing
    this.orchestrator.parseLine(line);
  }

  /**
   * Finalize parsing and return result
   */
  finalize(): ParseResult {
    const { allNodes, allErrors, allWarnings } = this.orchestrator.finalize();
    return this.coordinator.finalize(allNodes, allErrors, allWarnings);
  }

  /**
   * Parse complete markdown text
   */
  parse(text: string): ParseResult {
    this.reset();
    this.parseStream(text);
    return this.finalize();
  }

  /**
   * Reset parser state
   */
  reset(): void {
    this.coordinator.reset();
    this.orchestrator.clearThinkingSections();
  }

  /**
   * Get current parsing state
   */
  getState(): StreamingParserState {
    return this.coordinator.getState();
  }

  /**
   * Get thinking sections
   */
  getThinkingSections(): string[] {
    return this.orchestrator.getThinkingSections();
  }

  /**
   * Check if currently in a thinking section
   */
  isInThinkingSection(): boolean {
    return this.orchestrator.isInThinkingSection();
  }

  /**
   * Get parsing duration
   */
  getDuration(): number {
    return this.coordinator.getState().currentLine; // This would need to be tracked properly
  }
}

// Utility functions
export function createStreamingMarkdownParser(): StreamingMarkdownParser {
  return new StreamingMarkdownParser();
}

export function parseMarkdown(text: string): ParseResult {
  const parser = new StreamingMarkdownParser();
  return parser.parse(text);
}

export function parseMarkdownStream(chunks: string[]): ParseResult {
  const parser = new StreamingMarkdownParser();

  for (const chunk of chunks) {
    parser.parseStream(chunk);
  }

  return parser.finalize();
}
