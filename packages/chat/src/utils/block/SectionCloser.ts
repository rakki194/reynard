/**
 * Section Closer for Base Markdown Parser
 *
 * Handles closing of various open sections during parsing finalization
 */

import type { StreamingParserState } from "../../types";

export class SectionCloser {
  /**
   * Close all open sections
   */
  static closeAllSections(
    state: StreamingParserState,
    addNode: (node: any) => void,
  ): void {
    this.closeThinkingSections(state);
    this.closeCodeBlocks(state, addNode);
    this.closeTables(state, addNode);
    this.closeBlockquotes(state, addNode);
    this.closeLists(state, addNode);
    this.closeMathBlocks(state, addNode);
    this.closeHtmlBlocks(state, addNode);
  }

  private static closeThinkingSections(state: StreamingParserState): void {
    if (state.inThinking && state.thinkingBuffer.trim()) {
      state.thinkingSections.push(state.thinkingBuffer.trim());
      state.thinkingBuffer = "";
      state.inThinking = false;
    }
  }

  private static closeCodeBlocks(
    state: StreamingParserState,
    addNode: (node: any) => void,
  ): void {
    if (state.inCodeBlock) {
      addNode({
        type: "code",
        language: state.codeBlockLanguage,
        content: state.codeBlockContent.join("\n"),
        line: state.currentLine,
      });
      state.inCodeBlock = false;
      state.codeBlockContent = [];
      state.codeBlockLanguage = "";
    }
  }

  private static closeTables(
    state: StreamingParserState,
    addNode: (node: any) => void,
  ): void {
    if (state.inTable) {
      addNode({
        type: "table",
        content: "",
        headers: state.tableHeaders,
        rows: state.tableRows,
        line: state.currentLine,
      });
      state.inTable = false;
      state.tableHeaders = [];
      state.tableRows = [];
    }
  }

  private static closeBlockquotes(
    state: StreamingParserState,
    addNode: (node: any) => void,
  ): void {
    if (state.inBlockquote) {
      addNode({
        type: "blockquote",
        content: state.blockquoteContent.join("\n"),
        line: state.currentLine,
      });
      state.inBlockquote = false;
      state.blockquoteContent = [];
    }
  }

  private static closeLists(
    state: StreamingParserState,
    addNode: (node: any) => void,
  ): void {
    if (state.inList) {
      addNode({
        type: "list",
        content: "",
        listType: state.listType,
        items: state.listItems,
        line: state.currentLine,
      });
      state.inList = false;
      state.listItems = [];
      state.listType = "unordered";
      state.listLevel = 0;
    }
  }

  private static closeMathBlocks(
    state: StreamingParserState,
    addNode: (node: any) => void,
  ): void {
    if (state.inMathBlock) {
      addNode({
        type: "math",
        content: state.mathBlockContent.join("\n"),
        line: state.currentLine,
      });
      state.inMathBlock = false;
      state.mathBlockContent = [];
    }
  }

  private static closeHtmlBlocks(
    state: StreamingParserState,
    addNode: (node: any) => void,
  ): void {
    if (state.inHtmlBlock) {
      addNode({
        type: "html",
        content: state.htmlBlockContent.join("\n"),
        line: state.currentLine,
      });
      state.inHtmlBlock = false;
      state.htmlBlockContent = [];
    }
  }
}
