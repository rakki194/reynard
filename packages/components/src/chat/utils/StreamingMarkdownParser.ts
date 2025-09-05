/**
 * Advanced Streaming Markdown Parser for Reynard Chat System
 *
 * Greatly enhanced from yipyap's initial implementation with:
 * - Better error handling and recovery
 * - Performance optimizations
 * - Extended markdown support (tables, task lists, math)
 * - Comprehensive thinking section parsing
 * - Streaming optimization with buffering
 * - TypeScript-first design
 */

import type {
  MarkdownNode,
  StreamingParserState,
  ParseResult,
  ParserError,
} from "../types";

export class StreamingMarkdownParser {
  private state: StreamingParserState;
  private startTime: number;

  private static readonly BLOCK_PATTERNS = {
    // Headers
    heading: /^(#{1,6})\s+(.*)$/,
    headingUnderline: /^(=+|-+)\s*$/,

    // Code blocks
    codeBlock: /^```(\w*)\s*$/,
    codeBlockEnd: /^```\s*$/,
    indentedCode: /^(    |\t)(.*)$/,

    // Lists
    listItem: /^(\s*)([-*+])\s+(.*)$/,
    numberedList: /^(\s*)(\d+)\.\s+(.*)$/,
    taskList: /^(\s*)([-*+])\s+\[([ xX])\]\s+(.*)$/,

    // Quotes and callouts
    blockquote: /^>\s+(.*)$/,

    // Tables
    tableRow: /^\|(.+)\|$/,
    tableSeparator: /^\|(\s*:?-+:?\s*\|)+$/,

    // Horizontal rules
    horizontalRule: /^(\*{3,}|-{3,}|_{3,})\s*$/,

    // Thinking sections
    thinkingStart: /^<think>\s*$/,
    thinkingEnd: /^<\/think>\s*$/,
    inlineThinking: /<think>(.*?)<\/think>/gs,

    // Math blocks
    mathBlock: /^\$\$(.*)$/,
    mathBlockEnd: /^(.*)\$\$$/,

    // HTML blocks
    htmlBlock: /^<([a-zA-Z][a-zA-Z0-9]*)[^>]*>/,
    htmlBlockEnd: /^<\/([a-zA-Z][a-zA-Z0-9]*)>/,
  };

  private static readonly INLINE_PATTERNS = {
    // Text formatting
    boldDouble: /\*\*((?:[^*]|\*(?!\*))+)\*\*/g,
    boldSingle: /\b_((?:[^_]|_(?!_))+)_\b/g,
    italicAsterisk: /\*([^*]+?)\*/g,
    italicUnderscore: /_([^_]+)_/g,
    strikethrough: /~~([^~]+)~~/g,

    // Code and links
    inlineCode: /`([^`]+)`/g,
    link: /\[([^\]]+)\]\(([^)]+)\)/g,
    autoLink: /(https?:\/\/[^\s]+)/g,

    // Math
    inlineMath: /\$([^$]+)\$/g,

    // Special characters
    emoji: /:([a-z_]+):/g,
  };

  constructor() {
    this.state = this.createInitialState();
    this.startTime = performance.now();
  }

  private createInitialState(): StreamingParserState {
    return {
      nodes: [],
      buffer: "",
      currentNode: null,
      inCodeBlock: false,
      codeBlockLanguage: "",
      codeBlockContent: [],
      inThinking: false,
      thinkingBuffer: "",
      thinkingSections: [],
      listStack: [],
      inTable: false,
      tableHeaders: [],
      lastProcessedLength: 0,
      lineNumber: 0,
      errors: [],
    };
  }

  /**
   * Parse a chunk of streaming content with optimized buffering
   */
  parseChunk(chunk: string): ParseResult {
    if (!chunk) {
      return this.generateResult(false);
    }

    // Add chunk to buffer
    this.state.buffer += chunk;

    // Only process complete lines to avoid partial parsing
    this.processCompleteLines();

    return this.generateResult(false);
  }

  /**
   * Reset the parser state for a new conversation
   */
  reset(): void {
    this.state = this.createInitialState();
    this.startTime = performance.now();
  }

  /**
   * Finalize parsing and get complete result
   */
  finalize(): ParseResult {
    // Process any remaining content in buffer
    if (this.state.buffer.trim()) {
      this.processRemainingBuffer();
    }

    // Close any open thinking sections
    this.closeOpenSections();

    // Flush any current node
    this.flushCurrentNode();

    // Mark all nodes as complete
    this.markNodesComplete(this.state.nodes);

    return this.generateResult(true);
  }

  private processCompleteLines(): void {
    const lines = this.state.buffer.split("\n");

    // Keep incomplete last line in buffer unless it ends with newline
    let linesToProcess: string[];
    let remainingBuffer: string;

    if (this.state.buffer.endsWith("\n")) {
      linesToProcess = lines.slice(0, -1); // Exclude empty string at end
      remainingBuffer = "";
    } else {
      linesToProcess = lines.slice(0, -1);
      remainingBuffer = lines[lines.length - 1] || "";
    }

    // Process each complete line
    for (const line of linesToProcess) {
      this.processLine(line);
      this.state.lineNumber++;
    }

    this.state.buffer = remainingBuffer;
  }

  private processRemainingBuffer(): void {
    if (this.state.buffer.trim()) {
      const lines = this.state.buffer.split("\n");
      for (const line of lines) {
        if (line.trim()) {
          this.processLine(line);
          this.state.lineNumber++;
        }
      }
      this.state.buffer = "";
    }
  }

  private processLine(line: string): void {
    try {
      // Handle thinking sections first (highest priority)
      if (this.handleThinkingSection(line)) {
        return;
      }

      // Skip processing content inside thinking sections
      if (this.state.inThinking) {
        this.state.thinkingBuffer += line + "\n";
        return;
      }

      // Handle code blocks
      if (this.handleCodeBlock(line)) {
        return;
      }

      // Skip processing inside code blocks
      if (this.state.inCodeBlock) {
        this.state.codeBlockContent.push(line);
        return;
      }

      // Process markdown content
      this.processMarkdownLine(line);
    } catch (error) {
      this.addError(
        "syntax",
        `Error processing line ${this.state.lineNumber}: ${error}`,
        true,
      );
    }
  }

  private handleThinkingSection(line: string): boolean {
    const thinkingStartMatch = line.match(
      StreamingMarkdownParser.BLOCK_PATTERNS.thinkingStart,
    );
    const thinkingEndMatch = line.match(
      StreamingMarkdownParser.BLOCK_PATTERNS.thinkingEnd,
    );

    if (thinkingStartMatch) {
      if (this.state.inThinking) {
        this.addError("syntax", "Nested thinking sections not allowed", true);
      }
      this.state.inThinking = true;
      this.state.thinkingBuffer = "";
      return true;
    }

    if (thinkingEndMatch) {
      if (!this.state.inThinking) {
        this.addError(
          "syntax",
          "Closing thinking tag without opening tag",
          true,
        );
        return true;
      }

      this.state.inThinking = false;
      if (this.state.thinkingBuffer.trim()) {
        this.state.thinkingSections.push(this.state.thinkingBuffer.trim());
      }
      this.state.thinkingBuffer = "";
      return true;
    }

    return false;
  }

  private handleCodeBlock(line: string): boolean {
    const codeBlockMatch = line.match(
      StreamingMarkdownParser.BLOCK_PATTERNS.codeBlock,
    );
    const codeBlockEndMatch = line.match(
      StreamingMarkdownParser.BLOCK_PATTERNS.codeBlockEnd,
    );

    if (codeBlockMatch && !this.state.inCodeBlock) {
      this.flushCurrentNode();
      this.state.inCodeBlock = true;
      this.state.codeBlockLanguage = codeBlockMatch[1] || "";
      this.state.codeBlockContent = [];
      return true;
    }

    if (codeBlockEndMatch && this.state.inCodeBlock) {
      this.state.inCodeBlock = false;
      this.addNode({
        type: "code-block",
        content: this.state.codeBlockContent.join("\n"),
        attributes: { language: this.state.codeBlockLanguage },
        isComplete: true,
      });
      this.state.codeBlockContent = [];
      this.state.codeBlockLanguage = "";
      return true;
    }

    return false;
  }

  private processMarkdownLine(line: string): void {
    // Process inline thinking first and remove it
    let processedLine = this.extractInlineThinking(line);

    // Handle empty lines - they break blocks
    if (processedLine.trim() === "") {
      this.flushCurrentNode();
      return;
    }

    // Handle various block types in order of specificity
    if (this.handleHorizontalRule(processedLine)) return;
    if (this.handleHeading(processedLine)) return;
    if (this.handleBlockquote(processedLine)) return;
    if (this.handleTable(processedLine)) return;
    if (this.handleList(processedLine)) return;

    // Default to paragraph
    this.handleParagraph(processedLine);
  }

  private extractInlineThinking(line: string): string {
    let processedLine = line;
    const thinkingMatches = Array.from(
      processedLine.matchAll(
        StreamingMarkdownParser.BLOCK_PATTERNS.inlineThinking,
      ),
    );

    for (const match of thinkingMatches) {
      if (match[1].trim()) {
        this.state.thinkingSections.push(match[1].trim());
      }
      processedLine = processedLine.replace(match[0], "");
    }

    return processedLine;
  }

  private handleHorizontalRule(line: string): boolean {
    if (StreamingMarkdownParser.BLOCK_PATTERNS.horizontalRule.test(line)) {
      this.flushCurrentNode();
      this.addNode({
        type: "hr",
        content: "",
        isComplete: true,
      });
      return true;
    }
    return false;
  }

  private handleHeading(line: string): boolean {
    const headingMatch = line.match(
      StreamingMarkdownParser.BLOCK_PATTERNS.heading,
    );
    if (headingMatch) {
      this.flushCurrentNode();
      this.addNode({
        type: "heading",
        content: headingMatch[2].trim(),
        attributes: { level: headingMatch[1].length.toString() },
        isComplete: true,
        raw: line,
      });
      return true;
    }
    return false;
  }

  private handleBlockquote(line: string): boolean {
    const blockquoteMatch = line.match(
      StreamingMarkdownParser.BLOCK_PATTERNS.blockquote,
    );
    if (blockquoteMatch) {
      if (
        this.state.currentNode?.type === "blockquote" &&
        !this.state.currentNode.isComplete
      ) {
        this.state.currentNode.content += "\n" + blockquoteMatch[1];
      } else {
        this.flushCurrentNode();
        this.state.currentNode = {
          type: "blockquote",
          content: blockquoteMatch[1],
          isComplete: false,
        };
      }
      return true;
    }
    return false;
  }

  private handleTable(line: string): boolean {
    const tableRowMatch = line.match(
      StreamingMarkdownParser.BLOCK_PATTERNS.tableRow,
    );
    const tableSeparatorMatch = line.match(
      StreamingMarkdownParser.BLOCK_PATTERNS.tableSeparator,
    );

    if (tableRowMatch) {
      const cells = tableRowMatch[1].split("|").map((cell) => cell.trim());

      if (!this.state.inTable) {
        // Start new table
        this.flushCurrentNode();
        this.state.inTable = true;
        this.state.tableHeaders = cells;
        this.state.currentNode = {
          type: "table",
          content: "",
          children: [
            {
              type: "table-row",
              content: "",
              children: cells.map((cell) => ({
                type: "table-cell",
                content: cell,
                isComplete: true,
                attributes: { header: "true" },
              })),
              isComplete: true,
              attributes: { header: "true" },
            },
          ],
          isComplete: false,
        };
      } else {
        // Add row to existing table
        if (this.state.currentNode?.type === "table") {
          this.state.currentNode.children!.push({
            type: "table-row",
            content: "",
            children: cells.map((cell) => ({
              type: "table-cell",
              content: cell,
              isComplete: true,
            })),
            isComplete: true,
          });
        }
      }
      return true;
    }

    if (tableSeparatorMatch && this.state.inTable) {
      // Table separator - continue table
      return true;
    }

    if (this.state.inTable && !tableRowMatch) {
      // End of table
      this.state.inTable = false;
      this.flushCurrentNode();
    }

    return false;
  }

  private handleList(line: string): boolean {
    const listItemMatch = line.match(
      StreamingMarkdownParser.BLOCK_PATTERNS.listItem,
    );
    const numberedListMatch = line.match(
      StreamingMarkdownParser.BLOCK_PATTERNS.numberedList,
    );
    const taskListMatch = line.match(
      StreamingMarkdownParser.BLOCK_PATTERNS.taskList,
    );

    if (taskListMatch) {
      const [, indent, , checked, content] = taskListMatch;
      this.handleListItem(
        "unordered",
        content,
        indent.length,
        true,
        checked.toLowerCase() === "x",
      );
      return true;
    }

    if (listItemMatch) {
      const [, indent, , content] = listItemMatch;
      this.handleListItem("unordered", content, indent.length);
      return true;
    }

    if (numberedListMatch) {
      const [, indent, , content] = numberedListMatch;
      this.handleListItem("ordered", content, indent.length);
      return true;
    }

    // If we were in a list and this line doesn't match, end the list
    if (this.state.listStack.length > 0) {
      this.state.listStack = [];
      this.flushCurrentNode();
    }

    return false;
  }

  private handleListItem(
    listType: "ordered" | "unordered",
    content: string,
    indentLevel: number,
    isTask: boolean = false,
    isChecked: boolean = false,
  ): void {
    const currentLevel = Math.floor(indentLevel / 2); // 2 spaces per level

    // Adjust list stack for current level
    this.adjustListStack(listType, currentLevel);

    // Create or update list
    if (!this.state.currentNode || this.state.currentNode.type !== "list") {
      this.flushCurrentNode();
      this.state.currentNode = {
        type: "list",
        content: "",
        attributes: {
          listType,
          ...(isTask && { taskList: "true" }),
        },
        children: [],
        isComplete: false,
      };
    }

    // Add list item
    const listItem: MarkdownNode = {
      type: "list-item",
      content,
      isComplete: true,
      ...(isTask && {
        attributes: {
          task: "true",
          checked: isChecked.toString(),
        },
      }),
    };

    this.state.currentNode.children!.push(listItem);
  }

  private adjustListStack(
    listType: "ordered" | "unordered",
    level: number,
  ): void {
    // Trim stack to current level
    this.state.listStack = this.state.listStack.slice(0, level + 1);

    // Ensure we have an entry for current level
    if (this.state.listStack.length <= level) {
      this.state.listStack.push({ type: listType, level });
    } else {
      this.state.listStack[level] = { type: listType, level };
    }
  }

  private handleParagraph(line: string): void {
    if (
      this.state.currentNode?.type === "paragraph" &&
      !this.state.currentNode.isComplete
    ) {
      this.state.currentNode.content += "\n" + line;
    } else {
      this.flushCurrentNode();
      this.state.currentNode = {
        type: "paragraph",
        content: line,
        isComplete: false,
        raw: line,
      };
    }
  }

  private flushCurrentNode(): void {
    if (this.state.currentNode) {
      this.state.currentNode.isComplete = true;
      this.state.nodes.push(this.state.currentNode);
      this.state.currentNode = null;
    }
  }

  private addNode(node: MarkdownNode): void {
    this.state.nodes.push(node);
  }

  private closeOpenSections(): void {
    // Close any open thinking sections
    if (this.state.inThinking && this.state.thinkingBuffer.trim()) {
      this.state.thinkingSections.push(this.state.thinkingBuffer.trim());
      this.state.inThinking = false;
      this.addError(
        "incomplete",
        "Thinking section was not properly closed",
        true,
      );
    }

    // Close any open code blocks
    if (this.state.inCodeBlock) {
      this.addNode({
        type: "code-block",
        content: this.state.codeBlockContent.join("\n"),
        attributes: { language: this.state.codeBlockLanguage },
        isComplete: true,
      });
      this.state.inCodeBlock = false;
      this.addError("incomplete", "Code block was not properly closed", true);
    }

    // Close any open tables
    if (this.state.inTable) {
      this.state.inTable = false;
    }
  }

  private markNodesComplete(nodes: MarkdownNode[]): void {
    nodes.forEach((node) => {
      node.isComplete = true;
      if (node.children) {
        this.markNodesComplete(node.children);
      }
    });
  }

  private addError(
    type: ParserError["type"],
    message: string,
    recoverable: boolean,
  ): void {
    this.state.errors.push({
      type,
      message,
      line: this.state.lineNumber,
      recoverable,
    });
  }

  private generateResult(isComplete: boolean): ParseResult {
    const thinking = this.extractThinking();

    // Include current node if it exists and streaming
    const nodesToReturn = isComplete
      ? [...this.state.nodes]
      : this.state.currentNode && !this.state.inCodeBlock
        ? [
            ...this.state.nodes,
            { ...this.state.currentNode, isComplete: false },
          ]
        : [...this.state.nodes];

    return {
      html: this.renderToHTML(nodesToReturn),
      nodes: nodesToReturn,
      isComplete,
      hasThinking: thinking.length > 0,
      thinking,
      currentThinking: this.state.inThinking
        ? this.state.thinkingBuffer
        : undefined,
      errors: [...this.state.errors],
      stats: {
        totalNodes: nodesToReturn.length,
        processedChars: this.state.lastProcessedLength,
        parsingTime: performance.now() - this.startTime,
      },
    };
  }

  private extractThinking(): string[] {
    const thinking = [...this.state.thinkingSections];

    // Add current thinking if in progress
    if (this.state.inThinking && this.state.thinkingBuffer.trim()) {
      thinking.push(this.state.thinkingBuffer.trim());
    }

    return thinking;
  }

  private renderToHTML(nodes: MarkdownNode[]): string {
    return nodes.map((node) => this.renderNodeToHTML(node)).join("");
  }

  private renderNodeToHTML(node: MarkdownNode): string {
    const processedContent = this.processInlineMarkdown(node.content);

    switch (node.type) {
      case "heading": {
        const level = Math.min(
          6,
          Math.max(1, parseInt(node.attributes?.level || "1")),
        );
        return `<h${level}>${processedContent}</h${level}>`;
      }

      case "paragraph":
        return `<p>${processedContent}</p>`;

      case "code-block": {
        const language = node.attributes?.language || "";
        const escapedContent = this.escapeHtml(node.content);
        return `<pre><code class="language-${language}">${escapedContent}</code></pre>`;
      }

      case "list": {
        const listType = node.attributes?.listType === "ordered" ? "ol" : "ul";
        const isTaskList = node.attributes?.taskList === "true";
        const items =
          node.children
            ?.map((child) => this.renderNodeToHTML(child))
            .join("") || "";
        const className = isTaskList ? ' class="task-list"' : "";
        return `<${listType}${className}>${items}</${listType}>`;
      }

      case "list-item": {
        const isTask = node.attributes?.task === "true";
        const isChecked = node.attributes?.checked === "true";

        if (isTask) {
          const checkedAttr = isChecked ? " checked" : "";
          return `<li class="task-list-item"><input type="checkbox"${checkedAttr} disabled> ${processedContent}</li>`;
        }
        return `<li>${processedContent}</li>`;
      }

      case "blockquote":
        return `<blockquote>${processedContent}</blockquote>`;

      case "table": {
        const rows =
          node.children
            ?.map((child) => this.renderNodeToHTML(child))
            .join("") || "";
        return `<table>${rows}</table>`;
      }

      case "table-row": {
        const isHeader = node.attributes?.header === "true";
        const cells =
          node.children
            ?.map((child) => this.renderNodeToHTML(child))
            .join("") || "";
        return isHeader
          ? `<thead><tr>${cells}</tr></thead>`
          : `<tr>${cells}</tr>`;
      }

      case "table-cell": {
        const isHeader = node.attributes?.header === "true";
        const tag = isHeader ? "th" : "td";
        return `<${tag}>${processedContent}</${tag}>`;
      }

      case "hr":
        return "<hr>";

      default:
        return `<div>${processedContent}</div>`;
    }
  }

  private processInlineMarkdown(text: string): string {
    if (!text) return "";

    let processed = text;

    // Process in order of specificity to avoid conflicts
    processed = processed.replace(
      StreamingMarkdownParser.INLINE_PATTERNS.inlineCode,
      "<code>$1</code>",
    );
    processed = processed.replace(
      StreamingMarkdownParser.INLINE_PATTERNS.link,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    );
    processed = processed.replace(
      StreamingMarkdownParser.INLINE_PATTERNS.boldDouble,
      "<strong>$1</strong>",
    );
    processed = processed.replace(
      StreamingMarkdownParser.INLINE_PATTERNS.italicAsterisk,
      "<em>$1</em>",
    );
    processed = processed.replace(
      StreamingMarkdownParser.INLINE_PATTERNS.strikethrough,
      "<del>$1</del>",
    );
    processed = processed.replace(
      StreamingMarkdownParser.INLINE_PATTERNS.inlineMath,
      '<span class="math-inline">$1</span>',
    );

    return processed;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
}

// Utility functions
export function createStreamingMarkdownParser(): StreamingMarkdownParser {
  return new StreamingMarkdownParser();
}

export function parseMarkdownStream(chunks: string[]): ParseResult {
  const parser = createStreamingMarkdownParser();

  for (const chunk of chunks) {
    parser.parseChunk(chunk);
  }

  return parser.finalize();
}

export function parseMarkdown(content: string): ParseResult {
  const parser = createStreamingMarkdownParser();
  parser.parseChunk(content);
  return parser.finalize();
}

// Performance-optimized version for large content
export function parseMarkdownBatched(
  content: string,
  batchSize: number = 1024,
): ParseResult {
  const parser = createStreamingMarkdownParser();

  for (let i = 0; i < content.length; i += batchSize) {
    const chunk = content.slice(i, i + batchSize);
    parser.parseChunk(chunk);
  }

  return parser.finalize();
}
