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
export declare function createNode(node: Partial<MarkdownNode>): MarkdownNode;
/**
 * Validate and sanitize URLs
 */
export declare function validateUrl(url: string): boolean;
/**
 * Sanitize HTML content
 */
export declare function sanitizeHtml(html: string): string;
/**
 * Extract inline thinking from a line
 */
export declare function extractInlineThinking(line: string): string;
/**
 * Parse table cells from a row
 */
export declare function parseTableCells(rowContent: string): Array<{
    content: string;
    alignment?: string;
}>;
/**
 * Parse table alignment from separator
 */
export declare function parseTableAlignment(separatorContent: string): string[];
/**
 * Create a parser error
 */
export declare function createParserError(type: "syntax" | "malformed" | "incomplete" | "table_error", message: string, line: number, recoverable?: boolean): ParserError;
/**
 * Check if a line matches a pattern
 */
export declare function matches(line: string, pattern: RegExp): RegExpMatchArray | null;
/**
 * Calculate parsing duration
 */
export declare function calculateDuration(startTime: number): number;
