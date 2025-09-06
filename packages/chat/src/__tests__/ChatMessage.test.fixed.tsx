/**
 * Fixed tests for ChatMessage component
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import { ChatMessage } from "../components/ChatMessage";
import type { ChatMessage as ChatMessageType } from "../types";

// Mock components to avoid cross-test contamination
vi.mock("../components/MarkdownRenderer", () => ({
  MarkdownRenderer: (props: any) => (
    <div data-testid="markdown-renderer">{props.content}</div>
  ),
}));

vi.mock("../components/ThinkingIndicator", () => ({
  ThinkingIndicator: (props: any) => (
    <div data-testid="thinking-indicator">{props.content}</div>
  ),
}));

vi.mock("../components/ToolCallDisplay", () => ({
  ToolCallDisplay: (props: any) => (
    <div data-testid="tool-call">{props.toolCall.name}</div>
  ),
}));

describe("ChatMessage", () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  const createMockMessage = (
    overrides: Partial<ChatMessageType> = {},
  ): ChatMessageType => ({
    id: "msg-1",
    role: "user",
    content: "Test message",
    timestamp: Date.now(),
    ...overrides,
  });

  it("should render user message correctly", () => {
    const message = createMockMessage({
      role: "user",
      content: "Hello there!",
    });

    render(() => <ChatMessage message={message} />);

    expect(screen.getByText("You")).toBeInTheDocument();
    expect(screen.getByText("Hello there!")).toBeInTheDocument();
    expect(screen.getByTestId("markdown-renderer")).toBeInTheDocument();
  });

  it("should render assistant message correctly", () => {
    cleanup();
    const message = createMockMessage({
      role: "assistant",
      content: "Hello back!",
    });

    render(() => <ChatMessage message={message} />);

    expect(screen.getByText("Assistant")).toBeInTheDocument();
    expect(screen.getByText("Hello back!")).toBeInTheDocument();
  });

  it("should render system message correctly", () => {
    cleanup();
    const message = createMockMessage({
      role: "system",
      content: "System notification",
    });

    render(() => <ChatMessage message={message} />);

    expect(screen.getByText("System")).toBeInTheDocument();
    expect(screen.getByText("System notification")).toBeInTheDocument();
  });

  it("should render tool message correctly", () => {
    cleanup();
    const message = createMockMessage({
      role: "tool",
      content: "Tool result",
      toolName: "calculator",
    });

    render(() => <ChatMessage message={message} />);

    expect(screen.getByText("calculator")).toBeInTheDocument();
    expect(screen.getByText("Tool result")).toBeInTheDocument();
  });

  it("should show timestamp when enabled", () => {
    cleanup();
    const message = createMockMessage({ timestamp: 1640995200000 }); // Jan 1, 2022

    render(() => <ChatMessage message={message} showTimestamp={true} />);

    const timestamp = screen.getByRole("time");
    expect(timestamp).toBeInTheDocument();
    expect(timestamp).toHaveAttribute("datetime");
  });

  it("should hide timestamp when disabled", () => {
    cleanup();
    const message = createMockMessage();

    render(() => <ChatMessage message={message} showTimestamp={false} />);

    expect(screen.queryByRole("time")).not.toBeInTheDocument();
  });

  it("should show token count when enabled", () => {
    cleanup();
    const message = createMockMessage({
      metadata: { tokensUsed: 42 },
    });

    render(() => <ChatMessage message={message} showTokenCount={true} />);

    expect(screen.getByText("42 tokens")).toBeInTheDocument();
  });

  it("should show streaming indicator for streaming messages", () => {
    cleanup();
    const message = createMockMessage({
      streaming: {
        isStreaming: true,
        isThinking: false,
        currentContent: "Partial content",
        currentThinking: "",
        chunks: [],
      },
    });

    render(() => <ChatMessage message={message} />);

    expect(screen.getByTestId("markdown-renderer")).toBeInTheDocument();
    // Should show streaming indicator in header
    const streamingDots = document.querySelector(
      ".reynard-chat-message__typing-dots",
    );
    expect(streamingDots).toBeInTheDocument();
  });

  it("should show thinking indicator when thinking", () => {
    cleanup();
    const message = createMockMessage({
      streaming: {
        isStreaming: true,
        isThinking: true,
        currentContent: "",
        currentThinking: "Thinking about this...",
        chunks: [],
      },
    });

    render(() => <ChatMessage message={message} />);

    expect(screen.getByTestId("thinking-indicator")).toBeInTheDocument();
  });

  it("should toggle thinking section visibility", async () => {
    cleanup();
    const message = createMockMessage({
      content: "Response with <think>hidden thinking</think> content",
    });

    render(() => <ChatMessage message={message} />);

    const thinkingToggle = screen.getByRole("button", { name: /thinking/i });
    expect(thinkingToggle).toBeInTheDocument();

    fireEvent.click(thinkingToggle);

    expect(screen.getByTestId("thinking-indicator")).toBeInTheDocument();
  });

  it("should toggle details panel", async () => {
    cleanup();
    const message = createMockMessage({
      metadata: {
        model: "gpt-4",
        temperature: 0.7,
        tokensUsed: 42,
      },
    });

    render(() => <ChatMessage message={message} />);

    const detailsToggle = screen.getByRole("button", { name: /details/i });
    fireEvent.click(detailsToggle);

    expect(screen.getByText("Message ID:")).toBeInTheDocument();
    expect(screen.getByText("gpt-4")).toBeInTheDocument();
    expect(screen.getByText("0.7")).toBeInTheDocument();
  });

  it("should render tool calls", () => {
    cleanup();
    const message = createMockMessage({
      toolCalls: [
        {
          id: "tool-1",
          name: "calculator",
          arguments: { expression: "2 + 2" },
          status: "completed" as const,
          result: 4,
        },
      ],
    });

    render(() => <ChatMessage message={message} />);

    expect(screen.getByTestId("tool-call")).toBeInTheDocument();
    expect(screen.getByText("calculator")).toBeInTheDocument();
  });

  it("should render error state", () => {
    cleanup();
    const message = createMockMessage({
      error: {
        type: "api_error",
        message: "Failed to process message",
        recoverable: true,
      },
    });

    render(() => <ChatMessage message={message} />);

    expect(screen.getByText("Failed to process message")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("should not show retry button for non-recoverable errors", () => {
    cleanup();
    const message = createMockMessage({
      error: {
        type: "fatal_error",
        message: "Fatal error occurred",
        recoverable: false,
      },
    });

    render(() => <ChatMessage message={message} />);

    expect(screen.getByText("Fatal error occurred")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /retry/i }),
    ).not.toBeInTheDocument();
  });

  it("should use custom renderer when provided", () => {
    cleanup();
    const customRenderer = vi.fn(() => (
      <div data-testid="custom-content">Custom rendered content</div>
    ));
    const message = createMockMessage({ content: "Original content" });

    render(() => (
      <ChatMessage message={message} customRenderer={customRenderer} />
    ));

    expect(screen.getByTestId("custom-content")).toBeInTheDocument();
    expect(customRenderer).toHaveBeenCalledWith("Original content", message);
    // Custom renderer should replace markdown renderer
    expect(screen.queryAllByTestId("markdown-renderer")).toHaveLength(0);
  });

  it("should apply correct CSS classes for different roles", () => {
    cleanup();
    render(() => <ChatMessage message={createMockMessage({ role: "user" })} />);
    expect(
      document.querySelector(".reynard-chat-message--user"),
    ).toBeInTheDocument();

    cleanup();
    render(() => (
      <ChatMessage message={createMockMessage({ role: "assistant" })} />
    ));
    expect(
      document.querySelector(".reynard-chat-message--assistant"),
    ).toBeInTheDocument();
  });

  it("should apply streaming class when streaming", () => {
    cleanup();
    const message = createMockMessage({
      streaming: {
        isStreaming: true,
        isThinking: false,
        currentContent: "Streaming...",
        currentThinking: "",
        chunks: [],
      },
    });

    render(() => <ChatMessage message={message} />);

    expect(
      document.querySelector(".reynard-chat-message--streaming"),
    ).toBeInTheDocument();
  });

  it("should apply latest class when isLatest is true", () => {
    cleanup();
    const message = createMockMessage();

    render(() => <ChatMessage message={message} isLatest={true} />);

    expect(
      document.querySelector(".reynard-chat-message--latest"),
    ).toBeInTheDocument();
  });

  it("should show placeholder when streaming without content", () => {
    cleanup();
    const message = createMockMessage({
      content: "",
      streaming: {
        isStreaming: true,
        isThinking: false,
        currentContent: "",
        currentThinking: "",
        chunks: [],
      },
    });

    render(() => <ChatMessage message={message} />);

    expect(screen.getByText("Preparing response...")).toBeInTheDocument();
  });

  it("should format processing time correctly", () => {
    cleanup();
    const message = createMockMessage({
      metadata: {
        processingTime: 1234.5,
      },
    });

    render(() => <ChatMessage message={message} />);

    expect(screen.getByText("1235ms")).toBeInTheDocument();
  });

  it("should use custom avatar when provided", () => {
    cleanup();
    const CustomAvatar = () => <div data-testid="custom-avatar">CA</div>;
    const message = createMockMessage();

    render(() => <ChatMessage message={message} avatar={CustomAvatar} />);

    expect(screen.getByTestId("custom-avatar")).toBeInTheDocument();
  });
});
