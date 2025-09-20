/**
 * Code Block Handler for Block Parser
 *
 * Handles parsing of code blocks and indented code
 */

import { MARKDOWN_PATTERNS } from "../patterns";
import { matches } from "../parsing-utils";
import type { StreamingParserState } from "../../types";

export class CodeBlockHandler {
  /**
   * Handle code block parsing
   */
  static handleCodeBlock(line: string, state: StreamingParserState, addNode: (node: any) => void): boolean {
    // Start of code block
    const startMatch = matches(line, MARKDOWN_PATTERNS.codeBlock);
    if (startMatch) {
      state.inCodeBlock = true;
      state.codeBlockLanguage = startMatch[1] || "";
      state.codeBlockContent = [];
      return true;
    }

    // End of code block
    const endMatch = matches(line, MARKDOWN_PATTERNS.codeBlockEnd);
    if (endMatch && state.inCodeBlock) {
      addNode({
        type: "code",
        language: state.codeBlockLanguage,
        content: state.codeBlockContent.join("\n"),
        line: state.currentLine,
      });
      state.inCodeBlock = false;
      state.codeBlockContent = [];
      state.codeBlockLanguage = "";
      return true;
    }

    // Content inside code block
    if (state.inCodeBlock) {
      state.codeBlockContent.push(line);
      return true;
    }

    // Indented code blocks
    const indentedMatch = matches(line, MARKDOWN_PATTERNS.indentedCode);
    if (indentedMatch) {
      if (!state.inCodeBlock) {
        state.inCodeBlock = true;
        state.codeBlockLanguage = "";
        state.codeBlockContent = [];
      }
      state.codeBlockContent.push(indentedMatch[2]);
      return true;
    }

    return false;
  }
}
