/**
 * Chat Streaming Composable
 *
 * Handles streaming functionality including response processing,
 * chunk handling, and streaming state management
 */

import { createSignal, batch } from "solid-js";
import { StreamingMarkdownParser, createStreamingMarkdownParser } from "../utils/StreamingMarkdownParser";
import type { ChatMessage, ChatRequest, StreamChunk, ToolCall } from "../types";

export interface UseChatStreamingOptions {
  /** Custom fetch function */
  fetchFn?: typeof fetch;
  /** Authentication headers */
  authHeaders?: Record<string, string>;
  /** Chat service endpoint */
  endpoint?: string;
}

export interface UseChatStreamingReturn {
  isStreaming: () => boolean;
  isThinking: () => boolean;
  currentResponse: () => string;
  currentThinking: () => string;
  streamController: () => AbortController | null;
  streamingParser: () => StreamingMarkdownParser | null;
  sendMessage: (content: string, requestOptions?: Partial<ChatRequest>) => Promise<void>;
  streamResponse: (request: ChatRequest) => Promise<void>;
  processStreamChunk: (chunk: StreamChunk, parser: StreamingMarkdownParser, messageId: string) => Promise<void>;
  finalizeStreaming: (messageId: string) => Promise<void>;
  cancelStreaming: () => void;
  retryLastMessage: () => Promise<void>;
}

export function useChatStreaming(
  options: UseChatStreamingOptions = {},
  messageHandlers: {
    addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => ChatMessage;
    updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
    messages: () => ChatMessage[];
  }
): UseChatStreamingReturn {
  const { fetchFn = fetch, authHeaders = {}, endpoint = "/api/chat" } = options;

  // Streaming state
  const [isStreaming, setIsStreaming] = createSignal(false);
  const [isThinking, setIsThinking] = createSignal(false);
  const [streamController, setStreamController] = createSignal<AbortController | null>(null);
  const [streamingParser, setStreamingParser] = createSignal<StreamingMarkdownParser | null>(null);
  const [currentResponse, setCurrentResponse] = createSignal("");
  const [currentThinking, setCurrentThinking] = createSignal("");

  // Generate unique tool call ID
  const generateToolCallId = (): string => {
    return `tool-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Send a message
  const sendMessage = async (content: string, requestOptions: Partial<ChatRequest> = {}) => {
    if (isStreaming()) {
      throw new Error("Cannot send message while streaming");
    }

    if (!content.trim()) {
      throw new Error("Message content cannot be empty");
    }

    // Add user message
    messageHandlers.addMessage({
      role: "user",
      content: content.trim(),
    });

    // Prepare request
    const request: ChatRequest = {
      message: content.trim(),
      conversationHistory: messageHandlers.messages(),
      stream: true,
      ...requestOptions,
    };

    try {
      await streamResponse(request);
    } catch (error) {
      console.error("Failed to send message:", error);

      // Add error message
      messageHandlers.addMessage({
        role: "assistant",
        content: "I apologize, but I encountered an error processing your message. Please try again.",
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
    });

    // Create streaming parser
    const parser = createStreamingMarkdownParser();
    setStreamingParser(parser);

    // Create assistant message
    const assistantMessage = messageHandlers.addMessage({
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
        // eslint-disable-next-line no-constant-condition
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
      await finalizeStreaming(assistantMessage.id);
    }
  };

  // Process a single stream chunk
  const processStreamChunk = async (chunk: StreamChunk, parser: StreamingMarkdownParser, messageId: string) => {
    switch (chunk.type) {
      case "start":
        batch(() => {
          setIsStreaming(true);
        });
        break;

      case "thinking":
        if (chunk.content) {
          const newThinking = currentThinking() + chunk.content;
          batch(() => {
            setIsThinking(true);
            setCurrentThinking(newThinking);
          });

          messageHandlers.updateMessage(messageId, {
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

          messageHandlers.updateMessage(messageId, {
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
          console.error("Stream error:", chunk.error);
        }
        break;
    }
  };

  // Handle tool call execution
  const handleToolCall = async (toolExecution: NonNullable<StreamChunk["toolExecution"]>, messageId: string) => {
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

    messageHandlers.updateMessage(messageId, {
      toolCalls: [toolCall],
    });
  };

  // Update tool call progress
  const updateToolCallProgress = (toolExecution: NonNullable<StreamChunk["toolExecution"]>, messageId: string) => {
    const message = messageHandlers.messages().find(m => m.id === messageId);
    if (!message?.toolCalls) return;

    const updatedToolCalls = message.toolCalls.map(tc =>
      tc.name === toolExecution.toolName
        ? {
            ...tc,
            progress: toolExecution.progress,
            message: toolExecution.message,
            status: toolExecution.status,
          }
        : tc
    );

    messageHandlers.updateMessage(messageId, {
      toolCalls: updatedToolCalls,
    });
  };

  // Handle tool result
  const handleToolResult = (toolExecution: NonNullable<StreamChunk["toolExecution"]>, messageId: string) => {
    const message = messageHandlers.messages().find(m => m.id === messageId);
    if (!message?.toolCalls) return;

    const updatedToolCalls = message.toolCalls.map(tc =>
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
        : tc
    );

    messageHandlers.updateMessage(messageId, {
      toolCalls: updatedToolCalls,
    });
  };

  // Finalize streaming
  const finalizeStreaming = async (messageId: string) => {
    const parser = streamingParser();
    if (!parser) return;

    const finalResult = parser.finalize();

    batch(() => {
      setIsStreaming(false);
      setIsThinking(false);
      setStreamController(null);
      setStreamingParser(null);
    });

    // Update final message
    messageHandlers.updateMessage(messageId, {
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
      });
    }
  };

  // Retry last message
  const retryLastMessage = async () => {
    const msgs = messageHandlers.messages();
    const lastUserMessage = [...msgs].reverse().find(m => m.role === "user");

    if (!lastUserMessage) {
      throw new Error("No user message to retry");
    }

    await sendMessage(lastUserMessage.content);
  };

  return {
    isStreaming,
    isThinking,
    currentResponse,
    currentThinking,
    streamController,
    streamingParser,
    sendMessage,
    streamResponse,
    processStreamChunk,
    finalizeStreaming,
    cancelStreaming,
    retryLastMessage,
  };
}
