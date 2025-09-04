/**
 * Main chat composable for Reynard Chat System
 *
 * Provides comprehensive state management and streaming functionality
 * for chat applications with markdown parsing, thinking sections,
 * and tool integration.
 */

import {
  createSignal,
  createEffect,
  createResource,
  batch,
  onCleanup,
  createMemo,
  onMount,
} from "solid-js";
import type { Accessor, Resource } from "solid-js";
import {
  StreamingMarkdownParser,
  createStreamingMarkdownParser,
} from "../utils/StreamingMarkdownParser";
import type {
  ChatState,
  ChatActions,
  ChatMessage,
  ChatRequest,
  StreamChunk,
  UseChatReturn,
  Tool,
  ToolCall,
  ParseResult,
} from "../types";

export interface UseChatOptions {
  /** Chat service endpoint */
  endpoint?: string;
  /** Authentication headers */
  authHeaders?: Record<string, string>;
  /** Initial configuration */
  config?: Partial<ChatState["config"]>;
  /** Available tools */
  tools?: Tool[];
  /** Initial messages */
  initialMessages?: ChatMessage[];
  /** Auto-connect on mount */
  autoConnect?: boolean;
  /** Custom fetch function */
  fetchFn?: typeof fetch;
  /** Reconnection options */
  reconnection?: {
    enabled: boolean;
    maxAttempts: number;
    delay: number;
    backoff: number;
  };
}

const DEFAULT_CONFIG: ChatState["config"] = {
  enableThinking: true,
  enableTools: true,
  autoScroll: true,
  showTimestamps: true,
  showTokenCounts: false,
  maxHistoryLength: 100,
};

const DEFAULT_RECONNECTION = {
  enabled: true,
  maxAttempts: 3,
  delay: 1000,
  backoff: 2,
};

export function useChat(options: UseChatOptions = {}): UseChatReturn {
  const {
    endpoint = "/api/chat",
    authHeaders = {},
    config: userConfig = {},
    tools = [],
    initialMessages = [],
    autoConnect = true,
    fetchFn = fetch,
    reconnection = DEFAULT_RECONNECTION,
  } = options;

  // Core state
  const [messages, setMessages] = createSignal<ChatMessage[]>(initialMessages);
  const [currentMessage, setCurrentMessage] = createSignal<
    ChatMessage | undefined
  >();
  const [isStreaming, setIsStreaming] = createSignal(false);
  const [isThinking, setIsThinking] = createSignal(false);
  const [availableModels, setAvailableModels] = createSignal<string[]>([]);
  const [selectedModel, setSelectedModel] = createSignal<string>();
  const [availableTools, setAvailableTools] = createSignal<Tool[]>(tools);
  const [connectionState, setConnectionState] =
    createSignal<ChatState["connectionState"]>("disconnected");
  const [error, setError] = createSignal<ChatState["error"]>();
  const [config, setConfig] = createSignal<ChatState["config"]>({
    ...DEFAULT_CONFIG,
    ...userConfig,
  });

  // Streaming state
  const [streamController, setStreamController] =
    createSignal<AbortController | null>(null);
  const [streamingParser, setStreamingParser] =
    createSignal<StreamingMarkdownParser | null>(null);
  const [currentResponse, setCurrentResponse] = createSignal("");
  const [currentThinking, setCurrentThinking] = createSignal("");

  // Reconnection state
  const [reconnectionAttempts, setReconnectionAttempts] = createSignal(0);
  const [isReconnecting, setIsReconnecting] = createSignal(false);

  // Computed values
  const totalMessages = createMemo(() => messages().length);
  const lastMessage = createMemo(() => {
    const msgs = messages();
    return msgs[msgs.length - 1];
  });

  const hasError = createMemo(() => !!error());
  const isConnected = createMemo(() => connectionState() === "connected");

  // Resource for checking connection
  const [connectionCheck] = createResource(
    () => endpoint,
    async (url) => {
      try {
        const response = await fetchFn(`${url}/health`, {
          headers: authHeaders,
        });
        return response.ok;
      } catch {
        return false;
      }
    },
  );

  // Generate unique message ID
  const generateMessageId = (): string => {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Generate unique tool call ID
  const generateToolCallId = (): string => {
    return `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Add a new message to the conversation
  const addMessage = (
    message: Omit<ChatMessage, "id" | "timestamp">,
  ): ChatMessage => {
    const newMessage: ChatMessage = {
      id: generateMessageId(),
      timestamp: Date.now(),
      ...message,
    };

    batch(() => {
      setMessages((prev) => {
        const updated = [...prev, newMessage];
        const maxLength = config().maxHistoryLength;
        return updated.length > maxLength ? updated.slice(-maxLength) : updated;
      });
    });

    return newMessage;
  };

  // Update an existing message
  const updateMessage = (id: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === id ? { ...msg, ...updates } : msg)),
    );
  };

  // Clear conversation
  const clearConversation = () => {
    batch(() => {
      setMessages([]);
      setCurrentMessage(undefined);
      setCurrentResponse("");
      setCurrentThinking("");
      setError(undefined);
    });
  };

  // Send a message
  const sendMessage = async (
    content: string,
    requestOptions: Partial<ChatRequest> = {},
  ) => {
    if (isStreaming()) {
      throw new Error("Cannot send message while streaming");
    }

    if (!content.trim()) {
      throw new Error("Message content cannot be empty");
    }

    // Add user message
    const userMessage = addMessage({
      role: "user",
      content: content.trim(),
    });

    // Prepare request
    const request: ChatRequest = {
      message: content.trim(),
      model: selectedModel(),
      conversationHistory: messages(),
      tools: config().enableTools ? availableTools() : [],
      stream: true,
      ...requestOptions,
    };

    try {
      await streamResponse(request);
    } catch (error) {
      console.error("Failed to send message:", error);
      setError({
        type: "request_failed",
        message:
          error instanceof Error ? error.message : "Failed to send message",
        timestamp: Date.now(),
        recoverable: true,
      });

      // Add error message
      addMessage({
        role: "assistant",
        content:
          "I apologize, but I encountered an error processing your message. Please try again.",
        error: {
          type: "request_failed",
          message: error instanceof Error ? error.message : "Unknown error",
          recoverable: true,
        },
      });
    }
  };

  // Stream response from the API
  const streamResponse = async (request: ChatRequest) => {
    // Create abort controller for this request
    const controller = new AbortController();
    setStreamController(controller);

    // Initialize streaming state
    batch(() => {
      setIsStreaming(true);
      setIsThinking(false);
      setCurrentResponse("");
      setCurrentThinking("");
      setError(undefined);
    });

    // Create streaming parser
    const parser = createStreamingMarkdownParser();
    setStreamingParser(parser);

    // Create assistant message
    const assistantMessage = addMessage({
      role: "assistant",
      content: "",
      streaming: {
        isStreaming: true,
        isThinking: false,
        currentContent: "",
        currentThinking: "",
        chunks: [],
      },
    });

    setCurrentMessage(assistantMessage);

    try {
      const response = await fetchFn(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Response body is not readable");
      }

      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.trim() === "") continue;

            try {
              const data: StreamChunk = JSON.parse(line.replace(/^data: /, ""));
              await processStreamChunk(data, parser, assistantMessage.id);
            } catch (parseError) {
              console.warn("Failed to parse stream chunk:", line, parseError);
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        // Request was cancelled
        return;
      }
      throw error;
    } finally {
      // Finalize streaming
      await finalizeStreaming(parser, assistantMessage.id);
    }
  };

  // Process a single stream chunk
  const processStreamChunk = async (
    chunk: StreamChunk,
    parser: StreamingMarkdownParser,
    messageId: string,
  ) => {
    switch (chunk.type) {
      case "start":
        batch(() => {
          setIsStreaming(true);
          setConnectionState("connected");
        });
        break;

      case "thinking":
        if (chunk.content) {
          const newThinking = currentThinking() + chunk.content;
          batch(() => {
            setIsThinking(true);
            setCurrentThinking(newThinking);
          });

          updateMessage(messageId, {
            streaming: {
              isStreaming: true,
              isThinking: true,
              currentContent: currentResponse(),
              currentThinking: newThinking,
              chunks: [],
            },
          });
        }
        break;

      case "content":
        if (chunk.content) {
          const parseResult = parser.parseChunk(chunk.content);
          const newResponse = currentResponse() + chunk.content;

          batch(() => {
            setCurrentResponse(newResponse);
            setIsThinking(false);
          });

          updateMessage(messageId, {
            content: parseResult.html,
            streaming: {
              isStreaming: true,
              isThinking: false,
              currentContent: newResponse,
              currentThinking: currentThinking(),
              chunks: [],
            },
          });
        }
        break;

      case "tool_call":
        if (chunk.toolExecution) {
          await handleToolCall(chunk.toolExecution, messageId);
        }
        break;

      case "tool_progress":
        if (chunk.toolExecution) {
          updateToolCallProgress(chunk.toolExecution, messageId);
        }
        break;

      case "tool_result":
        if (chunk.toolExecution) {
          handleToolResult(chunk.toolExecution, messageId);
        }
        break;

      case "complete":
        // Streaming complete - will be handled in finalize
        break;

      case "error":
        if (chunk.error) {
          setError({
            type: chunk.error.type,
            message: chunk.error.message,
            timestamp: Date.now(),
            recoverable: chunk.error.retryable || false,
          });
        }
        break;
    }
  };

  // Handle tool call execution
  const handleToolCall = async (
    toolExecution: NonNullable<StreamChunk["toolExecution"]>,
    messageId: string,
  ) => {
    const toolCall: ToolCall = {
      id: generateToolCallId(),
      name: toolExecution.toolName,
      arguments: toolExecution.parameters || {},
      status: "running",
      progress: toolExecution.progress,
      message: toolExecution.message,
      timing: {
        startTime: Date.now(),
      },
    };

    updateMessage(messageId, {
      toolCalls: [toolCall],
    });
  };

  // Update tool call progress
  const updateToolCallProgress = (
    toolExecution: NonNullable<StreamChunk["toolExecution"]>,
    messageId: string,
  ) => {
    const message = messages().find((m) => m.id === messageId);
    if (!message?.toolCalls) return;

    const updatedToolCalls = message.toolCalls.map((tc) =>
      tc.name === toolExecution.toolName
        ? {
            ...tc,
            progress: toolExecution.progress,
            message: toolExecution.message,
            status: toolExecution.status,
          }
        : tc,
    );

    updateMessage(messageId, {
      toolCalls: updatedToolCalls,
    });
  };

  // Handle tool result
  const handleToolResult = (
    toolExecution: NonNullable<StreamChunk["toolExecution"]>,
    messageId: string,
  ) => {
    const message = messages().find((m) => m.id === messageId);
    if (!message?.toolCalls) return;

    const updatedToolCalls = message.toolCalls.map((tc) =>
      tc.name === toolExecution.toolName
        ? {
            ...tc,
            status: toolExecution.status,
            result: toolExecution.result,
            error: toolExecution.error,
            timing: {
              ...tc.timing!,
              endTime: Date.now(),
              duration: Date.now() - tc.timing!.startTime,
            },
          }
        : tc,
    );

    updateMessage(messageId, {
      toolCalls: updatedToolCalls,
    });
  };

  // Finalize streaming
  const finalizeStreaming = async (
    parser: StreamingMarkdownParser,
    messageId: string,
  ) => {
    const finalResult = parser.finalize();

    batch(() => {
      setIsStreaming(false);
      setIsThinking(false);
      setStreamController(null);
      setStreamingParser(null);
      setCurrentMessage(undefined);
    });

    // Update final message
    updateMessage(messageId, {
      content: finalResult.html,
      streaming: undefined,
      metadata: {
        tokensUsed: 0, // TODO: Get from API
        processingTime: finalResult.stats.parsingTime,
      },
    });
  };

  // Cancel current streaming
  const cancelStreaming = () => {
    const controller = streamController();
    if (controller) {
      controller.abort();
      batch(() => {
        setIsStreaming(false);
        setIsThinking(false);
        setStreamController(null);
        setStreamingParser(null);
        setCurrentMessage(undefined);
      });
    }
  };

  // Retry last message
  const retryLastMessage = async () => {
    const msgs = messages();
    const lastUserMessage = [...msgs].reverse().find((m) => m.role === "user");

    if (!lastUserMessage) {
      throw new Error("No user message to retry");
    }

    await sendMessage(lastUserMessage.content);
  };

  // Update configuration
  const updateConfig = (newConfig: Partial<ChatState["config"]>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  // Connect to chat service
  const connect = async () => {
    setConnectionState("connecting");

    try {
      const isHealthy = await connectionCheck();
      setConnectionState(isHealthy ? "connected" : "error");
      setReconnectionAttempts(0);
    } catch (error) {
      setConnectionState("error");

      if (
        reconnection.enabled &&
        reconnectionAttempts() < reconnection.maxAttempts
      ) {
        setTimeout(
          () => {
            setReconnectionAttempts((prev) => prev + 1);
            connect();
          },
          reconnection.delay *
            Math.pow(reconnection.backoff, reconnectionAttempts()),
        );
      }
    }
  };

  // Disconnect from chat service
  const disconnect = () => {
    cancelStreaming();
    setConnectionState("disconnected");
  };

  // Export conversation
  const exportConversation = (format: "json" | "markdown" | "txt"): string => {
    const msgs = messages();

    switch (format) {
      case "json":
        return JSON.stringify(msgs, null, 2);

      case "markdown":
        return msgs
          .map((msg) => {
            const timestamp = new Date(msg.timestamp).toLocaleString();
            const role = msg.role === "user" ? "**User**" : "**Assistant**";
            return `## ${role} (${timestamp})\n\n${msg.content}\n\n---\n`;
          })
          .join("\n");

      case "txt":
        return msgs
          .map((msg) => {
            const timestamp = new Date(msg.timestamp).toLocaleString();
            return `[${timestamp}] ${msg.role.toUpperCase()}: ${msg.content}`;
          })
          .join("\n\n");

      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  };

  // Import conversation
  const importConversation = (data: string, format: "json") => {
    switch (format) {
      case "json":
        try {
          const importedMessages = JSON.parse(data) as ChatMessage[];
          setMessages(importedMessages);
        } catch (error) {
          throw new Error("Invalid JSON format");
        }
        break;

      default:
        throw new Error(`Unsupported import format: ${format}`);
    }
  };

  // Auto-connect on mount
  onMount(() => {
    if (autoConnect) {
      connect();
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    cancelStreaming();
  });

  // Actions object
  const actions: ChatActions = {
    sendMessage,
    cancelStreaming,
    clearConversation,
    retryLastMessage,
    updateConfig,
    connect,
    disconnect,
    exportConversation,
    importConversation,
  };

  // Return chat state and actions
  return {
    messages,
    currentMessage,
    isStreaming,
    isThinking,
    availableModels,
    selectedModel,
    availableTools,
    connectionState,
    error,
    config,
    actions,
  };
}
