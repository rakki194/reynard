/**
 * Thinking Section Parser for Reynard Chat System
 *
 * This module handles parsing of thinking sections, which are special
 * markdown blocks that contain AI reasoning and thought processes.
 */

import { BaseMarkdownParser } from "./BaseMarkdownParser";
import { ThinkingCore } from "./ThinkingCore";
import type { ParseResult } from "../types";

export class ThinkingSectionParser extends BaseMarkdownParser {
  /**
   * Parse a single line for thinking sections
   */
  parseLine(line: string): boolean {
    this.incrementLine();

    // Handle thinking sections first (highest priority)
    if (this.handleThinkingSection(line)) {
      return true;
    }

    // Skip processing content inside thinking sections
    if (this.state.inThinking) {
      this.state.thinkingBuffer += line + "\n";
      return true;
    }

    // Process inline thinking
    const processedLine = this.extractInlineThinking(line);
    if (processedLine !== line) {
      // Inline thinking was found and removed
      return false;
    }

    return false;
  }

  /**
   * Finalize parsing and return result
   */
  finalize(): ParseResult {
    // Close any open thinking sections
    if (this.state.inThinking && this.state.thinkingBuffer.trim()) {
      this.state.thinkingSections.push(this.state.thinkingBuffer.trim());
      this.state.thinkingBuffer = "";
      this.state.inThinking = false;
    }

    return {
      html: "",
      nodes: this.state.nodes,
      isComplete: true,
      hasThinking: this.state.thinkingSections.length > 0,
      thinking: this.state.thinkingSections,
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
   * Handle thinking sections
   */
  private handleThinkingSection(line: string): boolean {
    return ThinkingCore.handleThinkingSection(
      line,
      this.state,
      this.addWarning.bind(this),
      this.addNode.bind(this),
      this.createNode.bind(this)
    );
  }

  /**
   * Extract inline thinking from a line
   */
  protected extractInlineThinking(line: string): string {
    return ThinkingCore.extractInlineThinking(line, this.state, this.addNode.bind(this), this.createNode.bind(this));
  }

  /**
   * Get all thinking sections
   */
  public getThinkingSections(): string[] {
    return [...this.state.thinkingSections];
  }

  /**
   * Check if currently in a thinking section
   */
  public isInThinkingSection(): boolean {
    return this.state.inThinking;
  }

  /**
   * Get current thinking buffer
   */
  public getThinkingBuffer(): string {
    return this.state.thinkingBuffer;
  }

  /**
   * Clear thinking sections
   */
  public clearThinkingSections(): void {
    this.state.thinkingSections = [];
    this.state.thinkingBuffer = "";
    this.state.inThinking = false;
  }
}
