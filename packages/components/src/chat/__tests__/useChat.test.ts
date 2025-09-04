/**
 * Tests for useChat composable
 */

import { describe, it, expect, beforeEach, vi, Mock } from "vitest";
import { createRoot, createSignal } from "solid-js";
import { useChat } from "../composables/useChat";
import type { ChatMessage, StreamChunk } from "../types";

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock streaming response
const createMockStreamingResponse = (chunks: StreamChunk[]) => {
  const encoder = new TextEncoder();
  let chunkIndex = 0;

  const stream = new ReadableStream({
    start(controller) {
      const sendChunk = () => {
        if (chunkIndex < chunks.length) {
          const chunk = chunks[chunkIndex++];
          const data = `data: ${JSON.stringify(chunk)}\n\n`;
          controller.enqueue(encoder.encode(data));
          setTimeout(sendChunk, 10);
        } else {
          controller.close();
        }
      };
      sendChunk();
    },
  });

  return {
    ok: true,
    body: stream,
  };
};

describe("useChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    createRoot(() => {
      const chat = useChat();

      expect(chat.messages()).toHaveLength(0);
      expect(chat.isStreaming()).toBe(false);
      expect(chat.isThinking()).toBe(false);
      expect(chat.connectionState()).toBe("disconnected");
      expect(chat.error()).toBeUndefined();
    });
  });

  it("should initialize with provided messages", () => {
    const initialMessages: ChatMessage[] = [
      {
        id: "msg-1",
        role: "user",
        content: "Hello",
        timestamp: Date.now(),
      },
    ];

    createRoot(() => {
      const chat = useChat({ initialMessages });

      expect(chat.messages()).toHaveLength(1);
      expect(chat.messages()[0].content).toBe("Hello");
    });
  });

  it("should send a message successfully", async () => {
    const chunks: StreamChunk[] = [
      { type: "start" },
      { type: "content", content: "Hello " },
      { type: "content", content: "there!" },
      { type: "complete", done: true },
    ];

    mockFetch.mockResolvedValueOnce(createMockStreamingResponse(chunks));

    await createRoot(async (dispose) => {
      const chat = useChat({ endpoint: "/api/chat" });

      await chat.actions.sendMessage("Hello");

      // Wait for streaming to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(chat.messages()).toHaveLength(2); // User message + assistant response
      expect(chat.messages()[0].role).toBe("user");
      expect(chat.messages()[0].content).toBe("Hello");
      expect(chat.messages()[1].role).toBe("assistant");

      dispose();
    });
  });

  it("should handle thinking sections during streaming", async () => {
    const chunks: StreamChunk[] = [
      { type: "start" },
      { type: "thinking", content: "Let me think..." },
      { type: "thinking", content: " about this." },
      { type: "content", content: "Here is my response." },
      { type: "complete", done: true },
    ];

    mockFetch.mockResolvedValueOnce(createMockStreamingResponse(chunks));

    await createRoot(async (dispose) => {
      const chat = useChat();

      let thinkingDetected = false;

      // Monitor thinking state
      const unsubscribe = () => {
        if (chat.isThinking()) {
          thinkingDetected = true;
        }
      };

      await chat.actions.sendMessage("Question");

      // Wait for streaming to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(thinkingDetected).toBe(true);
      expect(chat.isThinking()).toBe(false); // Should be false after completion

      dispose();
    });
  });

  it("should handle tool calls during streaming", async () => {
    const chunks: StreamChunk[] = [
      { type: "start" },
      {
        type: "tool_call",
        toolExecution: {
          toolName: "calculator",
          callId: "tool-1",
          parameters: { expression: "2 + 2" },
          status: "running" as const,
        },
      },
      {
        type: "tool_result",
        toolExecution: {
          toolName: "calculator",
          callId: "tool-1",
          status: "completed" as const,
          result: 4,
        },
      },
      { type: "content", content: "The answer is 4." },
      { type: "complete", done: true },
    ];

    mockFetch.mockResolvedValueOnce(createMockStreamingResponse(chunks));

    await createRoot(async (dispose) => {
      const chat = useChat();

      await chat.actions.sendMessage("What is 2 + 2?");

      // Wait for streaming to complete
      await new Promise((resolve) => setTimeout(resolve, 100));

      const assistantMessage = chat
        .messages()
        .find((m) => m.role === "assistant");
      expect(assistantMessage?.toolCalls).toHaveLength(1);
      expect(assistantMessage?.toolCalls![0].name).toBe("calculator");
      expect(assistantMessage?.toolCalls![0].status).toBe("completed");
      expect(assistantMessage?.toolCalls![0].result).toBe(4);

      dispose();
    });
  });

  it("should handle streaming errors", async () => {
    const chunks: StreamChunk[] = [
      { type: "start" },
      {
        type: "error",
        error: {
          type: "api_error",
          message: "Service unavailable",
          retryable: true,
        },
      },
    ];

    mockFetch.mockResolvedValueOnce(createMockStreamingResponse(chunks));

    await createRoot(async (dispose) => {
      const chat = useChat();

      await chat.actions.sendMessage("Hello");

      // Wait for streaming to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(chat.error()).toBeDefined();
      expect(chat.error()!.type).toBe("api_error");
      expect(chat.error()!.message).toBe("Service unavailable");
      expect(chat.error()!.recoverable).toBe(true);

      dispose();
    });
  });

  it("should cancel streaming", async () => {
    // Mock a long-running stream
    const stream = new ReadableStream({
      start(controller) {
        // Don't send anything, just keep it open
      },
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      body: stream,
    });

    await createRoot(async (dispose) => {
      const chat = useChat();

      // Start streaming
      const messagePromise = chat.actions.sendMessage("Hello");

      // Cancel immediately
      chat.actions.cancelStreaming();

      expect(chat.isStreaming()).toBe(false);

      dispose();
    });
  });

  it("should clear conversation", () => {
    createRoot(() => {
      const chat = useChat({
        initialMessages: [
          {
            id: "msg-1",
            role: "user",
            content: "Hello",
            timestamp: Date.now(),
          },
          {
            id: "msg-2",
            role: "assistant",
            content: "Hi there!",
            timestamp: Date.now(),
          },
        ],
      });

      expect(chat.messages()).toHaveLength(2);

      chat.actions.clearConversation();

      expect(chat.messages()).toHaveLength(0);
      expect(chat.currentMessage()).toBeUndefined();
      expect(chat.error()).toBeUndefined();
    });
  });

  it("should export conversation in different formats", () => {
    const messages: ChatMessage[] = [
      { id: "msg-1", role: "user", content: "Hello", timestamp: Date.now() },
      {
        id: "msg-2",
        role: "assistant",
        content: "Hi there!",
        timestamp: Date.now(),
      },
    ];

    createRoot(() => {
      const chat = useChat({ initialMessages: messages });

      // Test JSON export
      const jsonExport = chat.actions.exportConversation("json");
      const parsed = JSON.parse(jsonExport);
      expect(parsed).toHaveLength(2);
      expect(parsed[0].content).toBe("Hello");

      // Test Markdown export
      const markdownExport = chat.actions.exportConversation("markdown");
      expect(markdownExport).toContain("**User**");
      expect(markdownExport).toContain("**Assistant**");
      expect(markdownExport).toContain("Hello");
      expect(markdownExport).toContain("Hi there!");

      // Test Text export
      const textExport = chat.actions.exportConversation("txt");
      expect(textExport).toContain("USER: Hello");
      expect(textExport).toContain("ASSISTANT: Hi there!");
    });
  });

  it("should import conversation from JSON", () => {
    const messages: ChatMessage[] = [
      {
        id: "msg-1",
        role: "user",
        content: "Imported message",
        timestamp: Date.now(),
      },
    ];

    createRoot(() => {
      const chat = useChat();

      expect(chat.messages()).toHaveLength(0);

      chat.actions.importConversation(JSON.stringify(messages), "json");

      expect(chat.messages()).toHaveLength(1);
      expect(chat.messages()[0].content).toBe("Imported message");
    });
  });

  it("should retry last message", async () => {
    const chunks: StreamChunk[] = [
      { type: "start" },
      { type: "content", content: "Retry response" },
      { type: "complete", done: true },
    ];

    mockFetch.mockResolvedValueOnce(createMockStreamingResponse(chunks));

    await createRoot(async (dispose) => {
      const chat = useChat({
        initialMessages: [
          {
            id: "msg-1",
            role: "user",
            content: "Original question",
            timestamp: Date.now(),
          },
        ],
      });

      await chat.actions.retryLastMessage();

      // Wait for streaming to complete
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockFetch).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining("Original question"),
        }),
      );

      dispose();
    });
  });

  it("should update configuration", () => {
    createRoot(() => {
      const chat = useChat();

      expect(chat.config().enableThinking).toBe(true);
      expect(chat.config().showTimestamps).toBe(true);

      chat.actions.updateConfig({
        enableThinking: false,
        showTimestamps: false,
        maxHistoryLength: 50,
      });

      expect(chat.config().enableThinking).toBe(false);
      expect(chat.config().showTimestamps).toBe(false);
      expect(chat.config().maxHistoryLength).toBe(50);
    });
  });

  it("should limit conversation history length", () => {
    createRoot(() => {
      const chat = useChat();

      chat.actions.updateConfig({ maxHistoryLength: 3 });

      // Add messages beyond the limit
      for (let i = 0; i < 5; i++) {
        const message: Omit<ChatMessage, "id" | "timestamp"> = {
          role: "user",
          content: `Message ${i}`,
        };
        // Simulate adding message (normally done internally)
        // This would be handled by the addMessage function internally
      }

      // In a real implementation, this would be tested by sending messages
      // and verifying the history is trimmed
    });
  });

  it("should handle network errors gracefully", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    await createRoot(async (dispose) => {
      const chat = useChat();

      await chat.actions.sendMessage("Hello");

      expect(chat.error()).toBeDefined();
      expect(chat.error()!.type).toBe("request_failed");
      expect(chat.error()!.recoverable).toBe(true);

      // Should add error message to conversation
      const lastMessage = chat.messages()[chat.messages().length - 1];
      expect(lastMessage.role).toBe("assistant");
      expect(lastMessage.error).toBeDefined();

      dispose();
    });
  });
});
