/**
 * 🦊 Commit Message Formatter
 *
 * Formats commit message components into final commit message
 */

import type { CommitMessage, CommitMessageOptions } from "./types";

export class CommitMessageFormatter {
  /**
   * Format commit message components into final message
   */
  formatCommitMessage(
    type: string,
    scope: string | undefined,
    description: string,
    body: string | undefined,
    footer: string | undefined,
    options: CommitMessageOptions
  ): CommitMessage {
    const header = this.formatHeader(type, scope, description);
    const fullMessage = this.assembleFullMessage(header, body, footer, options);

    return {
      type,
      scope,
      description,
      body,
      footer,
      fullMessage,
    };
  }

  /**
   * Format commit header
   */
  formatHeader(type: string, scope: string | undefined, description: string): string {
    const scopePart = scope ? `(${scope})` : "";
    return `${type}${scopePart}: ${description}`;
  }

  /**
   * Assemble full commit message
   */
  private assembleFullMessage(
    header: string,
    body: string | undefined,
    footer: string | undefined,
    options: CommitMessageOptions
  ): string {
    const parts: string[] = [header];

    if (body && options.includeBody) {
      parts.push("", body);
    }

    if (footer && options.includeFooter) {
      parts.push("", footer);
    }

    return parts.join("\n");
  }

  /**
   * Validate commit message format
   */
  validateCommitMessage(message: CommitMessage): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check header length
    const headerLength =
      message.type.length + (message.scope ? message.scope.length + 3 : 0) + message.description.length + 2; // +2 for ": "

    if (headerLength > 50) {
      errors.push(`Header too long: ${headerLength} characters (max 50)`);
    }

    // Check description
    if (!message.description.trim()) {
      errors.push("Description is required");
    }

    // Check body length
    if (message.body && message.body.length > 72) {
      errors.push(`Body too long: ${message.body.length} characters (max 72)`);
    }

    // Check footer length
    if (message.footer && message.footer.length > 72) {
      errors.push(`Footer too long: ${message.footer.length} characters (max 72)`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get commit message preview
   */
  getPreview(message: CommitMessage): string {
    const lines = message.fullMessage.split("\n");
    const preview: string[] = [];

    // Add header
    preview.push(`📝 ${lines[0]}`);

    // Add body preview
    if (lines.length > 1) {
      const bodyLines = lines.slice(1).filter(line => line.trim());
      if (bodyLines.length > 0) {
        preview.push(`📄 Body: ${bodyLines.length} lines`);
      }
    }

    return preview.join("\n");
  }
}
