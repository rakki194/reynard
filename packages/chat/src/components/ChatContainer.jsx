/**
 * ChatContainer Component for Reynard Chat System
 *
 * Main container component that orchestrates the entire chat experience
 * with message display, input handling, and state management.
 */
import { Show, For, createEffect, createSignal, onCleanup, splitProps, createMemo } from "solid-js";
import { useChat } from "../composables/useChat";
import { ChatMessage } from "./ChatMessage";
import { MessageInput } from "./MessageInput";
export const ChatContainer = props => {
    const [local] = splitProps(props, [
        "endpoint",
        "authHeaders",
        "config",
        "tools",
        "initialMessages",
        "variant",
        "height",
        "maxHeight",
        "className",
        "messageComponents",
        "onMessageSent",
        "onMessageReceived",
        "onStreamingStart",
        "onStreamingEnd",
        "onError",
    ]);
    const [autoScrollEnabled, setAutoScrollEnabled] = createSignal(true);
    let messagesContainerRef;
    let isUserScrolling = false;
    let scrollTimeout;
    // Initialize chat composable
    const chat = createMemo(() => useChat({
        endpoint: props.endpoint,
        authHeaders: props.authHeaders,
        config: props.config,
        tools: props.tools,
        initialMessages: props.initialMessages,
        autoConnect: true,
    }));
    // Auto-scroll to bottom when new messages arrive
    const scrollToBottom = (smooth = true) => {
        if (messagesContainerRef && autoScrollEnabled()) {
            messagesContainerRef.scrollTo({
                top: messagesContainerRef.scrollHeight,
                behavior: smooth ? "smooth" : "auto",
            });
        }
    };
    // Handle scroll events to detect user scrolling
    const handleScroll = () => {
        if (!messagesContainerRef)
            return;
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef;
        const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50; // 50px threshold
        // Update auto-scroll based on scroll position
        setAutoScrollEnabled(isAtBottom);
        // Mark as user scrolling
        isUserScrolling = true;
        // Clear existing timeout
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
        // Reset user scrolling flag after a delay
        scrollTimeout = window.setTimeout(() => {
            isUserScrolling = false;
        }, 150);
    };
    // Auto-scroll effect
    createEffect(() => {
        const messages = chat().messages();
        const isStreaming = chat().isStreaming();
        if (messages.length > 0 && !isUserScrolling) {
            // Small delay to ensure DOM is updated
            setTimeout(() => scrollToBottom(true), 10);
        }
        if (isStreaming && !isUserScrolling) {
            // More frequent scrolling during streaming
            setTimeout(() => scrollToBottom(false), 50);
        }
    });
    // Handle message submission
    const handleMessageSubmit = async (content) => {
        try {
            await chat().actions.sendMessage(content);
            local.onMessageSent?.(chat().messages()[chat().messages().length - 1]);
        }
        catch (error) {
            console.error("Failed to send message:", error);
            local.onError?.(error instanceof Error ? error : new Error(String(error)));
        }
    };
    // Handle streaming events
    createEffect(() => {
        if (chat().isStreaming()) {
            local.onStreamingStart?.();
        }
        else {
            local.onStreamingEnd?.();
        }
    });
    // Handle new messages
    createEffect(() => {
        const lastMessage = chat().messages()[chat().messages().length - 1];
        if (lastMessage && lastMessage.role === "assistant") {
            local.onMessageReceived?.(lastMessage);
        }
    });
    // Handle errors
    createEffect(() => {
        const error = chat().error();
        if (error) {
            local.onError?.(new Error(error.message));
        }
    });
    // Get container classes
    const getContainerClasses = () => {
        const base = "reynard-chat-container";
        const variant = `${base}--${local.variant || "default"}`;
        const streaming = chat().isStreaming() ? `${base}--streaming` : "";
        const connected = chat().connectionState() === "connected" ? `${base}--connected` : "";
        // Height classes
        let heightClass = "";
        if (local.height) {
            if (typeof local.height === "string") {
                if (local.height === "100%" || local.height === "100vh") {
                    heightClass = local.height === "100vh" ? `${base}--height-screen` : `${base}--height-full`;
                }
                else if (local.height.endsWith("px")) {
                    const heightValue = parseInt(local.height);
                    if (heightValue <= 400)
                        heightClass = `${base}--height-400`;
                    else if (heightValue <= 500)
                        heightClass = `${base}--height-500`;
                    else if (heightValue <= 600)
                        heightClass = `${base}--height-600`;
                    else if (heightValue <= 700)
                        heightClass = `${base}--height-700`;
                    else
                        heightClass = `${base}--height-800`;
                }
            }
        }
        // Max-height classes
        let maxHeightClass = "";
        if (local.maxHeight) {
            if (typeof local.maxHeight === "string") {
                if (local.maxHeight === "none") {
                    maxHeightClass = `${base}--max-height-none`;
                }
                else if (local.maxHeight.endsWith("px")) {
                    const maxHeightValue = parseInt(local.maxHeight);
                    if (maxHeightValue <= 400)
                        maxHeightClass = `${base}--max-height-400`;
                    else if (maxHeightValue <= 500)
                        maxHeightClass = `${base}--max-height-500`;
                    else if (maxHeightValue <= 600)
                        maxHeightClass = `${base}--max-height-600`;
                    else if (maxHeightValue <= 700)
                        maxHeightClass = `${base}--max-height-700`;
                    else
                        maxHeightClass = `${base}--max-height-800`;
                }
            }
        }
        return [base, variant, streaming, connected, heightClass, maxHeightClass].filter(Boolean).join(" ");
    };
    // Cleanup on unmount
    onCleanup(() => {
        if (scrollTimeout) {
            clearTimeout(scrollTimeout);
        }
    });
    return (<div class={`${getContainerClasses()} ${local.className || ""}`}>
      {/* Connection Status */}
      <Show when={chat().connectionState() !== "connected"}>
        <div class="reynard-chat-container__status">
          <div class="reynard-chat-container__status-indicator">
            {chat().connectionState() === "connecting" ? "🔄" : "⚠️"}
          </div>
          <span class="reynard-chat-container__status-text">
            {chat().connectionState() === "connecting" ? "Connecting..." : "Connection Error"}
          </span>
          <Show when={chat().connectionState() === "error"}>
            <button class="reynard-chat-container__retry-button" onClick={() => chat().actions.connect()}>
              Retry
            </button>
          </Show>
        </div>
      </Show>

      {/* Messages Area */}
      <div ref={messagesContainerRef} class="reynard-chat-container__messages" onScroll={handleScroll}>
        <Show when={chat().messages().length > 0} fallback={<div class="reynard-chat-container__empty">
              <div class="reynard-chat-container__empty-icon">💬</div>
              <div class="reynard-chat-container__empty-text">Start a conversation</div>
            </div>}>
          <For each={chat().messages()}>
            {(message, index) => {
            const MessageComponent = local.messageComponents?.[message.role] || ChatMessage;
            return (<MessageComponent message={message} isLatest={index() === chat().messages().length - 1} showTimestamp={local.config?.showTimestamps} showTokenCount={local.config?.showTokenCounts} onToolAction={(action, toolCall) => {
                    console.log("Tool action:", action, toolCall);
                    // Handle tool actions here
                }}/>);
        }}
          </For>
        </Show>

        {/* Streaming Indicator */}
        <Show when={chat().isStreaming() && !chat().currentMessage()}>
          <div class="reynard-chat-container__streaming-placeholder">
            <div class="reynard-chat-container__typing-indicator">
              <div class="reynard-chat-container__typing-dots">
                <span />
                <span />
                <span />
              </div>
              <span class="reynard-chat-container__typing-text">Assistant is typing...</span>
            </div>
          </div>
        </Show>
      </div>

      {/* Scroll to Bottom Button */}
      <Show when={!autoScrollEnabled()}>
        <button class="reynard-chat-container__scroll-button" onClick={() => {
            setAutoScrollEnabled(true);
            scrollToBottom(true);
        }} aria-label="Scroll to bottom">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="m6 9 6 6 6-6"/>
          </svg>
          <span class="reynard-chat-container__scroll-text">New messages</span>
        </button>
      </Show>

      {/* Input Area */}
      <div class="reynard-chat-container__input">
        <MessageInput placeholder="Type your message..." disabled={chat().connectionState() !== "connected"} isStreaming={chat().isStreaming()} multiline={true} autoResize={true} showCounter={false} maxLength={4000} onSubmit={handleMessageSubmit} variant={local.variant === "compact" ? "compact" : "default"}/>
      </div>

      {/* Footer */}
      <div class="reynard-chat-container__footer">
        <div class="reynard-chat-container__footer-info">
          <Show when={chat().messages().length > 0}>
            <span class="reynard-chat-container__message-count">{chat().messages().length} messages</span>
          </Show>

          <Show when={chat().error()}>
            <div class="reynard-chat-container__error">
              <span class="reynard-chat-container__error-icon">⚠️</span>
              <span class="reynard-chat-container__error-text">{chat().error().message}</span>
              <Show when={chat().error().recoverable}>
                <button class="reynard-chat-container__error-retry" onClick={() => chat().actions.retryLastMessage()}>
                  Retry
                </button>
              </Show>
            </div>
          </Show>
        </div>

        <div class="reynard-chat-container__footer-actions">
          <button class="reynard-chat-container__clear-button" onClick={() => {
            if (confirm("Clear conversation?")) {
                chat().actions.clearConversation();
            }
        }} title="Clear conversation">
            🗑️
          </button>

          <button class="reynard-chat-container__export-button" onClick={() => {
            const data = chat().actions.exportConversation("json");
            const blob = new Blob([data], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `chat-${new Date().toISOString().split("T")[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }} title="Export conversation">
            📥
          </button>
        </div>
      </div>
    </div>);
};
