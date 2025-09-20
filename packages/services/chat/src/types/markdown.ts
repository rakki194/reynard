/**
 * Markdown parsing and rendering types for the Reynard Chat System
 */

export interface MarkdownNode {
  /** Type of the markdown node */
  type:
    | "paragraph"
    | "heading"
    | "code-block"
    | "code"
    | "list"
    | "list-item"
    | "blockquote"
    | "table"
    | "table-row"
    | "table-cell"
    | "hr"
    | "horizontalRule"
    | "link"
    | "image"
    | "math"
    | "html"
    | "thinking";
  /** Text content of the node */
  content: string;
  /** Child nodes for complex structures */
  children?: MarkdownNode[];
  /** Additional attributes (level for headings, language for code blocks, etc.) */
  attributes?: Record<string, string>;
  /** Whether this node is complete (not being streamed) */
  isComplete: boolean;
  /** Optional raw markdown source */
  raw?: string;
  /** Line number where this node was found */
  line?: number;
  /** Inline formatting markers */
  inlineFormatting?: {
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
    strikethrough?: boolean;
  };
  /** Heading level (for heading nodes) */
  level?: number;
  /** List type (for list nodes) */
  listType?: "ordered" | "unordered" | "task";
  /** List items (for list nodes) */
  items?: Array<{ content: string; checked?: boolean }>;
  /** Table headers (for table nodes) */
  headers?: Array<{ content: string; alignment?: string }>;
  /** Table rows (for table nodes) */
  rows?: Array<{ content: string; alignment?: string }>[];
  /** Image source URL (for image nodes) */
  src?: string;
  /** Link URL (for link nodes) */
  url?: string;
  /** Alt text (for image nodes) */
  alt?: string;
  /** Link text (for link nodes) */
  text?: string;
  /** Language (for code nodes) */
  language?: string;
  /** Whether this is an inline node */
  inline?: boolean;
}

export interface StreamingParserState {
  /** Completed and partial nodes */
  nodes: MarkdownNode[];
  /** Current buffer of unparsed content */
  buffer: string;
  /** Currently building node */
  currentNode: MarkdownNode | null;
  /** Current line number */
  currentLine: number;
  /** Code block state */
  inCodeBlock: boolean;
  codeBlockLanguage: string;
  codeBlockContent: string[];
  /** Thinking section state */
  inThinking: boolean;
  thinkingBuffer: string;
  thinkingSections: string[];
  /** List state */
  listStack: Array<{ type: "ordered" | "unordered"; level: number }>;
  inList: boolean;
  listType: "ordered" | "unordered" | "task";
  listLevel: number;
  listItems: Array<{ content: string; checked?: boolean }>;
  /** Blockquote state */
  inBlockquote: boolean;
  blockquoteContent: string[];
  /** Math block state */
  inMathBlock: boolean;
  mathBlockContent: string[];
  /** HTML block state */
  inHtmlBlock: boolean;
  htmlBlockContent: string[];
  /** Table state */
  inTable: boolean;
  tableHeaders: Array<{ content: string; alignment?: string }>;
  tableRows: Array<{ content: string; alignment?: string }>[];
  /** Parser position tracking */
  lastProcessedLength: number;
  lineNumber: number;
  /** Error and warning state */
  errors: ParserError[];
  warnings: string[];
}

export interface ParserError {
  type: "syntax" | "malformed" | "incomplete" | "table_error";
  message: string;
  line?: number;
  column?: number;
  recoverable: boolean;
}

export interface ParseResult {
  /** Rendered HTML content */
  html: string;
  /** Parsed node tree */
  nodes: MarkdownNode[];
  /** Whether parsing is complete */
  isComplete: boolean;
  /** Whether content has thinking sections */
  hasThinking: boolean;
  /** Extracted thinking content */
  thinking: string[];
  /** Current thinking in progress */
  currentThinking?: string;
  /** Parse errors encountered */
  errors: ParserError[];
  /** Parse warnings */
  warnings?: string[];
  /** Parsing statistics */
  stats: {
    totalNodes: number;
    processedChars: number;
    parsingTime: number;
    lineCount: number;
  };
  /** Parsing duration */
  duration?: number;
}
