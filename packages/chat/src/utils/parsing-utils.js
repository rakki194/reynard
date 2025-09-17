/**
 * Shared Parsing Utilities for Reynard Chat System
 *
 * Common utility functions used across all parsers for consistency
 * and code reuse.
 */
/**
 * Create a complete node with required properties
 */
export function createNode(node) {
    return {
        type: node.type,
        content: node.content || "",
        isComplete: true,
        ...node,
    };
}
/**
 * Validate and sanitize URLs
 */
export function validateUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html) {
    // Basic HTML sanitization - in a real implementation, you'd use a proper sanitizer
    return html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
        .replace(/on\w+="[^"]*"/gi, "");
}
/**
 * Extract inline thinking from a line
 */
export function extractInlineThinking(line) {
    return line.replace(/<think>.*?<\/think>/g, "");
}
/**
 * Parse table cells from a row
 */
export function parseTableCells(rowContent) {
    const cells = [];
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
export function parseTableAlignment(separatorContent) {
    const alignment = [];
    const parts = separatorContent.split("|");
    for (const part of parts) {
        const content = part.trim();
        if (content === "")
            continue;
        if (content.startsWith(":") && content.endsWith(":")) {
            alignment.push("center");
        }
        else if (content.endsWith(":")) {
            alignment.push("right");
        }
        else {
            alignment.push("left");
        }
    }
    return alignment;
}
/**
 * Create a parser error
 */
export function createParserError(type, message, line, recoverable = true) {
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
export function matches(line, pattern) {
    return line.match(pattern);
}
/**
 * Calculate parsing duration
 */
export function calculateDuration(startTime) {
    return Date.now() - startTime;
}
