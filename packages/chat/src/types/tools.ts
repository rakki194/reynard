/**
 * Tool and message types for the Reynard Chat System
 */

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
