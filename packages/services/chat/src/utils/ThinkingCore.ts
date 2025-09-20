/**
 * Thinking Section Core Logic
 *
 * Contains the core parsing logic for thinking sections
 */

import { MARKDOWN_PATTERNS } from "./patterns";
import { matches } from "./parsing-utils";

export class ThinkingCore {
  /**
   * Handle thinking sections
   */
  public static handleThinkingSection(
    line: string,
    state: {
      inThinking: boolean;
      thinkingBuffer: string;
      thinkingSections: string[];
      currentLine: number;
    },
    addWarning: (message: string) => void,
    addNode: (node: any) => void,
    createNode: (data: any) => any
  ): boolean {
    // Start of thinking section
    const startMatch = matches(line, MARKDOWN_PATTERNS.thinkingStart);
    if (startMatch) {
      if (state.inThinking) {
        addWarning("Nested thinking sections detected");
      }
      state.inThinking = true;
      state.thinkingBuffer = "";
      return true;
    }

    // End of thinking section
    const endMatch = matches(line, MARKDOWN_PATTERNS.thinkingEnd);
    if (endMatch && state.inThinking) {
      if (state.thinkingBuffer.trim()) {
        state.thinkingSections.push(state.thinkingBuffer.trim());
        addNode(
          createNode({
            type: "thinking",
            content: state.thinkingBuffer.trim(),
            line: state.currentLine,
          })
        );
      }
      state.thinkingBuffer = "";
      state.inThinking = false;
      return true;
    }

    return false;
  }

  /**
   * Extract inline thinking from a line
   */
  public static extractInlineThinking(
    line: string,
    state: { currentLine: number },
    addNode: (node: any) => void,
    createNode: (data: any) => any
  ): string {
    let processedLine = line;

    // Process inline thinking patterns
    processedLine = processedLine.replace(MARKDOWN_PATTERNS.thinkingInline, (match, content) => {
      // Add inline thinking node
      addNode(
        createNode({
          type: "thinking",
          content: content.trim(),
          line: state.currentLine,
          inline: true,
        })
      );

      // Replace with placeholder or remove entirely
      return "";
    });

    return processedLine;
  }
}
