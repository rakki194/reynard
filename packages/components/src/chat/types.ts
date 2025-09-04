/**
 * Type definitions for the Reynard Chat System
 *
 * A comprehensive type system for streaming chat functionality with
 * markdown parsing, thinking sections, and tool integration.
 */

export interface MarkdownNode {
  /** Type of the markdown node */
  type:
    | "paragraph"
    | "heading"
    | "code-block"
    | "list"
    | "list-item"
    | "blockquote"
    | "table"
    | "table-row"
    | "table-cell"
    | "hr"
    | "link"
    | "image";
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
  /** Inline formatting markers */
  inlineFormatting?: {
    bold?: boolean;
    italic?: boolean;
    code?: boolean;
    strikethrough?: boolean;
  };
}

export interface StreamingParserState {
  /** Completed and partial nodes */
  nodes: MarkdownNode[];
  /** Current buffer of unparsed content */
  buffer: string;
  /** Currently building node */
  currentNode: MarkdownNode | null;
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
  /** Table state */
  inTable: boolean;
  tableHeaders: string[];
  /** Parser position tracking */
  lastProcessedLength: number;
  lineNumber: number;
  /** Error state */
  errors: ParserError[];
}

export interface ParserError {
  type: "syntax" | "malformed" | "incomplete";
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
  /** Parsing statistics */
  stats: {
    totalNodes: number;
    processedChars: number;
    parsingTime: number;
  };
}

export interface ToolParameter {
  type: "string" | "number" | "boolean" | "object" | "array";
  description: string;
  required?: boolean;
  enum?: string[];
  default?: any;
  pattern?: string;
  minimum?: number;
  maximum?: number;
}

export interface Tool {
  name: string;
  description: string;
  parameters: Record<string, ToolParameter>;
  category?: string;
  version?: string;
  deprecated?: boolean;
}

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  /** Execution progress (0-100) */
  progress?: number;
  /** Status message */
  message?: string;
  /** Intermediate results */
  intermediateData?: Record<string, any>;
  /** Error information */
  error?: {
    type: string;
    message: string;
    code?: string;
    retryable: boolean;
    details?: any;
  };
  /** Execution timing */
  timing?: {
    startTime: number;
    endTime?: number;
    duration?: number;
  };
  /** Tool result */
  result?: any;
}

export type MessageRole = "user" | "assistant" | "system" | "tool";

export interface ChatMessage {
  /** Unique message identifier */
  id: string;
  /** Message role */
  role: MessageRole;
  /** Message content */
  content: string;
  /** Message timestamp */
  timestamp: number;
  /** Tool calls associated with this message */
  toolCalls?: ToolCall[];
  /** If this is a tool response, the tool call ID */
  toolCallId?: string;
  /** Tool name for tool messages */
  toolName?: string;
  /** Streaming state */
  streaming?: {
    isStreaming: boolean;
    isThinking: boolean;
    currentContent: string;
    currentThinking: string;
    chunks: string[];
  };
  /** Message metadata */
  metadata?: {
    model?: string;
    temperature?: number;
    tokensUsed?: number;
    processingTime?: number;
    context?: Record<string, any>;
  };
  /** Error state */
  error?: {
    type: string;
    message: string;
    recoverable: boolean;
  };
}

export interface ChatRequest {
  /** User message content */
  message: string;
  /** Model to use for generation */
  model?: string;
  /** Previous conversation history */
  conversationHistory?: ChatMessage[];
  /** Additional context */
  context?: Record<string, any>;
  /** Available tools */
  tools?: Tool[];
  /** Whether to stream the response */
  stream?: boolean;
  /** Generation parameters */
  parameters?: {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stop?: string[];
  };
}

export interface StreamChunk {
  /** Chunk type */
  type:
    | "start"
    | "thinking"
    | "content"
    | "tool_call"
    | "tool_progress"
    | "tool_result"
    | "complete"
    | "error";
  /** Content for this chunk */
  content?: string;
  /** Complete response so far */
  fullResponse?: string;
  /** Complete thinking so far */
  fullThinking?: string;
  /** Current thinking content */
  currentThinking?: string;
  /** Error information */
  error?: {
    type: string;
    message: string;
    code?: string;
    retryable: boolean;
  };
  /** Tool execution data */
  toolExecution?: {
    toolName: string;
    callId: string;
    parameters?: Record<string, any>;
    status: ToolCall["status"];
    progress?: number;
    message?: string;
    result?: any;
    error?: ToolCall["error"];
  };
  /** Whether streaming is complete */
  done?: boolean;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

export interface ChatState {
  /** Current conversation messages */
  messages: ChatMessage[];
  /** Current streaming message being built */
  currentMessage?: ChatMessage;
  /** Whether currently streaming */
  isStreaming: boolean;
  /** Whether assistant is thinking */
  isThinking: boolean;
  /** Available models */
  availableModels: string[];
  /** Currently selected model */
  selectedModel?: string;
  /** Available tools */
  availableTools: Tool[];
  /** Connection state */
  connectionState: "disconnected" | "connecting" | "connected" | "error";
  /** Error state */
  error?: {
    type: string;
    message: string;
    timestamp: number;
    recoverable: boolean;
  };
  /** Chat configuration */
  config: {
    enableThinking: boolean;
    enableTools: boolean;
    autoScroll: boolean;
    showTimestamps: boolean;
    showTokenCounts: boolean;
    maxHistoryLength: number;
  };
}

export interface ChatActions {
  /** Send a new message */
  sendMessage: (
    content: string,
    options?: Partial<ChatRequest>,
  ) => Promise<void>;
  /** Cancel current streaming */
  cancelStreaming: () => void;
  /** Clear conversation */
  clearConversation: () => void;
  /** Retry last message */
  retryLastMessage: () => Promise<void>;
  /** Update configuration */
  updateConfig: (config: Partial<ChatState["config"]>) => void;
  /** Connect to chat service */
  connect: () => Promise<void>;
  /** Disconnect from chat service */
  disconnect: () => void;
  /** Export conversation */
  exportConversation: (format: "json" | "markdown" | "txt") => string;
  /** Import conversation */
  importConversation: (data: string, format: "json") => void;
}

export interface UseChatReturn {
  /** Current conversation messages */
  messages: () => ChatMessage[];
  /** Currently streaming message (if any) */
  currentMessage: () => ChatMessage | undefined;
  /** Whether the chat is currently streaming */
  isStreaming: () => boolean;
  /** Whether the assistant is currently thinking */
  isThinking: () => boolean;
  /** Available models for selection */
  availableModels: () => string[];
  /** Currently selected model */
  selectedModel: () => string | undefined;
  /** Available tools */
  availableTools: () => Tool[];
  /** Connection state */
  connectionState: () => "disconnected" | "connecting" | "connected" | "error";
  /** Current error (if any) */
  error: () =>
    | {
        type: string;
        message: string;
        timestamp: number;
        recoverable: boolean;
      }
    | undefined;
  /** Chat configuration */
  config: () => {
    enableThinking: boolean;
    enableTools: boolean;
    autoScroll: boolean;
    showTimestamps: boolean;
    showTokenCounts: boolean;
    maxHistoryLength: number;
  };
  /** Actions for controlling the chat */
  actions: ChatActions;
}

// Component Props Types

export interface ChatMessageProps {
  /** Message to display */
  message: ChatMessage;
  /** Whether this is the most recent message */
  isLatest?: boolean;
  /** Whether to show timestamp */
  showTimestamp?: boolean;
  /** Whether to show token count */
  showTokenCount?: boolean;
  /** Custom avatar component */
  avatar?: any;
  /** Callback for tool call actions */
  onToolAction?: (action: string, toolCall: ToolCall) => void;
  /** Custom message renderer */
  customRenderer?: (content: string, message: ChatMessage) => any;
}

export interface ChatContainerProps {
  /** Initial messages */
  initialMessages?: ChatMessage[];
  /** Available models */
  models?: string[];
  /** Initial model selection */
  initialModel?: string;
  /** Available tools */
  tools?: Tool[];
  /** Chat endpoint URL */
  endpoint?: string;
  /** Authentication headers */
  authHeaders?: Record<string, string>;
  /** Configuration options */
  config?: Partial<ChatState["config"]>;
  /** Custom message components */
  messageComponents?: {
    user?: any;
    assistant?: any;
    system?: any;
    tool?: any;
  };
  /** Event callbacks */
  onMessageSent?: (message: ChatMessage) => void;
  onMessageReceived?: (message: ChatMessage) => void;
  onError?: (error: any) => void;
  onStreamingStart?: () => void;
  onStreamingEnd?: () => void;
  /** Styling props */
  height?: string;
  maxHeight?: string;
  className?: string;
  variant?: "default" | "compact" | "detailed";
}

export interface MessageInputProps {
  /** Placeholder text */
  placeholder?: string;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Whether currently streaming */
  isStreaming?: boolean;
  /** Maximum input length */
  maxLength?: number;
  /** Show character counter */
  showCounter?: boolean;
  /** Enable multiline input */
  multiline?: boolean;
  /** Auto-resize textarea */
  autoResize?: boolean;
  /** Submit callback */
  onSubmit?: (content: string) => void;
  /** Content change callback */
  onChange?: (content: string) => void;
  /** Custom submit button */
  submitButton?: any;
  /** Input variant */
  variant?: "default" | "compact";
}

export interface ThinkingIndicatorProps {
  /** Current thinking content */
  content?: string;
  /** Whether thinking is active */
  isActive?: boolean;
  /** Whether to show content */
  showContent?: boolean;
  /** Animation variant */
  variant?: "dots" | "pulse" | "typing";
  /** Custom thinking label */
  label?: string;
}

export interface MarkdownRendererProps {
  /** Markdown content to render */
  content: string;
  /** Whether content is streaming */
  streaming?: boolean;
  /** Custom component overrides */
  components?: Record<string, any>;
  /** Code syntax highlighting theme */
  codeTheme?: string;
  /** Enable LaTeX math rendering */
  enableMath?: boolean;
  /** Enable mermaid diagrams */
  enableDiagrams?: boolean;
  /** Custom link click handler */
  onLinkClick?: (url: string, event: Event) => void;
  /** Image loading configuration */
  imageConfig?: {
    lazy?: boolean;
    placeholder?: string;
    errorFallback?: string;
  };
}
