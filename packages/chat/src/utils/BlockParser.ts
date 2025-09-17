/**
 * Block Parser for Reynard Chat System
 *
 * This module handles block-level markdown elements like headers, code blocks,
 * lists, blockquotes, and horizontal rules.
 */

import { BaseMarkdownParser } from "./BaseMarkdownParser";
import { MARKDOWN_PATTERNS } from "./patterns";
import { matches } from "./parsing-utils";
import { ListHandler } from "./block/ListHandler";
import { CodeBlockHandler } from "./block/CodeBlockHandler";
import type { ParseResult } from "../types";

export class BlockParser extends BaseMarkdownParser {
  /**
   * Parse a single line for block elements
   */
  parseLine(line: string): boolean {
    this.incrementLine();

    // Handle empty lines - they break blocks
    if (line.trim() === "") {
      this.flushCurrentNode();
      return false;
    }

    // Handle various block types in order of specificity
    if (this.handleHorizontalRule(line)) return true;
    if (this.handleHeading(line)) return true;
    if (this.handleCodeBlock(line)) return true;
    if (this.handleList(line)) return true;
    if (this.handleBlockquote(line)) return true;

    // If no block pattern matches, treat as paragraph
    return false;
  }

  /**
   * Finalize parsing and return result
   */
  finalize(): ParseResult {
    this.closeOpenSections();

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
   * Handle horizontal rules
   */
  private handleHorizontalRule(line: string): boolean {
    const match = matches(line, MARKDOWN_PATTERNS.horizontalRule);
    if (match) {
      this.addNode(
        this.createNode({
          type: "horizontalRule",
          content: "",
          line: this.state.currentLine,
        })
      );
      return true;
    }
    return false;
  }

  /**
   * Handle headings
   */
  private handleHeading(line: string): boolean {
    // Hash-style headings
    const hashMatch = matches(line, MARKDOWN_PATTERNS.heading);
    if (hashMatch) {
      const level = hashMatch[1].length;
      const text = hashMatch[2].trim();
      this.addNode(
        this.createNode({
          type: "heading",
          level,
          content: text,
          line: this.state.currentLine,
        })
      );
      return true;
    }

    // Underline-style headings (requires previous line context)
    const underlineMatch = matches(line, MARKDOWN_PATTERNS.headingUnderline);
    if (underlineMatch && this.state.nodes.length > 0) {
      const lastNode = this.state.nodes[this.state.nodes.length - 1];
      if (lastNode.type === "paragraph") {
        const level = underlineMatch[1].startsWith("=") ? 1 : 2;
        this.state.nodes[this.state.nodes.length - 1] = this.createNode({
          type: "heading",
          level,
          content: lastNode.content,
          line: lastNode.line,
        });
        return true;
      }
    }

    return false;
  }

  /**
   * Handle code blocks
   */
  private handleCodeBlock(line: string): boolean {
    return CodeBlockHandler.handleCodeBlock(line, this.state, node => this.addNode(this.createNode(node)));
  }

  /**
   * Handle lists
   */
  private handleList(line: string): boolean {
    return ListHandler.handleList(line, this.state);
  }

  /**
   * Handle blockquotes
   */
  private handleBlockquote(line: string): boolean {
    const match = matches(line, MARKDOWN_PATTERNS.blockquote);
    if (match) {
      if (!this.state.inBlockquote) {
        this.state.inBlockquote = true;
        this.state.blockquoteContent = [];
      }
      this.state.blockquoteContent.push(match[1]);
      return true;
    }

    return false;
  }

  /**
   * Flush the current node if it exists
   */
  protected flushCurrentNode(): void {
    if (this.state.inList) {
      this.addNode(
        this.createNode({
          type: "list",
          content: "",
          listType: this.state.listType,
          items: this.state.listItems,
          line: this.state.currentLine,
        })
      );
      this.state.inList = false;
      this.state.listItems = [];
      this.state.listType = "unordered";
      this.state.listLevel = 0;
    }

    if (this.state.inBlockquote) {
      this.addNode(
        this.createNode({
          type: "blockquote",
          content: this.state.blockquoteContent.join("\n"),
          line: this.state.currentLine,
        })
      );
      this.state.inBlockquote = false;
      this.state.blockquoteContent = [];
    }
  }
}
