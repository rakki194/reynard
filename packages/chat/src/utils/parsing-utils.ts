/**
 * Shared Parsing Utilities for Reynard Chat System
 *
 * Common utility functions used across all parsers for consistency
 * and code reuse.
 */

import type { MarkdownNode, ParserError } from "../types";

/**
 * Create a complete node with required properties
 */
export function createNode(node: Partial<MarkdownNode>): MarkdownNode {
  return {
    type: node.type!,
    content: node.content || "",
    isComplete: true,
    ...node,
  };
}

/**
 * Validate and sanitize URLs
 */
export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  // Basic HTML sanitization - in a real implementation, you'd use a proper sanitizer
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "");
}

/**
 * Extract inline thinking from a line
 */
export function extractInlineThinking(line: string): string {
  return line.replace(/<think>.*?<\/think>/g, "");
}

/**
 * Parse table cells from a row
 */
export function parseTableCells(
  rowContent: string,
): Array<{ content: string; alignment?: string }> {
  const cells: Array<{ content: string; alignment?: string }> = [];
  const parts = rowContent.split("|");

  for (const part of parts) {
    const content = part.trim();
    if (content !== "") {
      cells.push({ content });
    }
  }

  return cells;
}

/**
 * Parse table alignment from separator
 */
export function parseTableAlignment(separatorContent: string): string[] {
  const alignment: string[] = [];
  const parts = separatorContent.split("|");

  for (const part of parts) {
    const content = part.trim();
    if (content === "") continue;

    if (content.startsWith(":") && content.endsWith(":")) {
      alignment.push("center");
    } else if (content.endsWith(":")) {
      alignment.push("right");
    } else {
      alignment.push("left");
    }
  }

  return alignment;
}

/**
 * Create a parser error
 */
export function createParserError(
  type: "syntax" | "malformed" | "incomplete" | "table_error",
  message: string,
  line: number,
  recoverable: boolean = true,
): ParserError {
  return {
    type,
    message,
    line,
    recoverable,
  };
}

/**
 * Check if a line matches a pattern
 */
export function matches(
  line: string,
  pattern: RegExp,
): RegExpMatchArray | null {
  return line.match(pattern);
}

/**
 * Calculate parsing duration
 */
export function calculateDuration(startTime: number): number {
  return Date.now() - startTime;
}
