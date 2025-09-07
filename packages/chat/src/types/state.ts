/**
 * Chat state and actions types for the Reynard Chat System
 */

import type { ChatMessage, Tool } from "./tools";

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
    options?: Partial<import("./tools").ChatRequest>,
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
