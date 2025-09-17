/**
 * ChatMessage Component for Reynard Chat System
 *
 * Displays individual chat messages with comprehensive support for:
 * - Streaming content with markdown rendering
 * - Thinking sections with expandable UI
 * - Tool calls with progress indicators
 * - Rich formatting and theming
 * - Accessibility and keyboard navigation
 */
import { Show, For, createMemo, createSignal } from "solid-js";
import { Dynamic } from "solid-js/web";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { ToolCallDisplay } from "./ToolCallDisplay";
export const ChatMessage = (props) => {
    const [showThinking, setShowThinking] = createSignal(false);
    const [showDetails, setShowDetails] = createSignal(false);
    // Format timestamp for display
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        if (isToday) {
            return date.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
            });
        }
        else {
            return date.toLocaleDateString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        }
    };
    // Get role-specific styling classes
    const getRoleClasses = () => {
        const base = "reynard-chat-message";
        const role = `${base}--${props.message.role}`;
        const streaming = props.message.streaming?.isStreaming
            ? `${base}--streaming`
            : "";
        const error = props.message.error ? `${base}--error` : "";
        const latest = props.isLatest ? `${base}--latest` : "";
        return [base, role, streaming, error, latest].filter(Boolean).join(" ");
    };
    // Get avatar component or emoji based on role
    const getAvatar = () => {
        if (props.avatar) {
            return props.avatar;
        }
        switch (props.message.role) {
            case "user":
                return "👤";
            case "assistant":
                return "🦊";
            case "system":
                return "⚙️";
            case "tool":
                return "🔧";
            default:
                return "💬";
        }
    };
    // Get role display name
    const getRoleName = () => {
        switch (props.message.role) {
            case "user":
                return "You";
            case "assistant":
                return "Assistant";
            case "system":
                return "System";
            case "tool":
                return props.message.toolName || "Tool";
            default:
                return props.message.role;
        }
    };
    // Check if message has thinking content
    const hasThinking = createMemo(() => {
        return (props.message.streaming?.currentThinking ||
            (props.message.content && props.message.content.includes("<think>")));
    });
    // Extract thinking content
    const getThinkingContent = createMemo(() => {
        if (props.message.streaming?.currentThinking) {
            return props.message.streaming.currentThinking;
        }
        // Extract from HTML content if finalized
        const thinkingMatch = props.message.content.match(/<think>(.*?)<\/think>/s);
        return thinkingMatch ? thinkingMatch[1] : "";
    });
    // Get current content for display
    const getDisplayContent = createMemo(() => {
        if (props.message.streaming?.isStreaming) {
            return props.message.streaming.currentContent;
        }
        return props.message.content;
    });
    // Get custom rendered content
    const getCustomContent = createMemo(() => {
        if (props.customRenderer) {
            return props.customRenderer(props.message.content, props.message);
        }
        return null;
    });
    // Token count display
    const getTokenCount = createMemo(() => {
        if (!props.showTokenCount || !props.message.metadata?.tokensUsed) {
            return null;
        }
        return props.message.metadata.tokensUsed;
    });
    // Processing time display
    const getProcessingTime = createMemo(() => {
        if (!props.message.metadata?.processingTime) {
            return null;
        }
        return Math.round(props.message.metadata.processingTime);
    });
    return (<div class={getRoleClasses()} data-message-id={props.message.id}>
      {/* Message Header */}
      <div class="reynard-chat-message__header">
        <div class="reynard-chat-message__avatar">
          <Dynamic component={() => getAvatar()}/>
        </div>

        <div class="reynard-chat-message__meta">
          <span class="reynard-chat-message__role">{getRoleName()}</span>

          <Show when={props.showTimestamp}>
            <time class="reynard-chat-message__timestamp" datetime={new Date(props.message.timestamp).toISOString()}>
              {formatTimestamp(props.message.timestamp)}
            </time>
          </Show>

          <Show when={getTokenCount()}>
            <span class="reynard-chat-message__tokens">
              {getTokenCount()} tokens
            </span>
          </Show>

          <Show when={getProcessingTime()}>
            <span class="reynard-chat-message__processing-time">
              {getProcessingTime()}ms
            </span>
          </Show>

          {/* Streaming indicator */}
          <Show when={props.message.streaming?.isStreaming}>
            <span class="reynard-chat-message__streaming-indicator">
              <span class="reynard-chat-message__typing-dots">
                <span />
                <span />
                <span />
              </span>
            </span>
          </Show>
        </div>

        {/* Actions */}
        <div class="reynard-chat-message__actions">
          <Show when={hasThinking()}>
            <button class="reynard-chat-message__thinking-toggle" onClick={() => setShowThinking(!showThinking())} attr:aria-expanded={showThinking() ? "true" : "false"} aria-label={showThinking() ? "Hide thinking" : "Show thinking"}>
              💭
            </button>
          </Show>

          <button class="reynard-chat-message__details-toggle" onClick={() => setShowDetails(!showDetails())} attr:aria-expanded={showDetails() ? "true" : "false"} aria-label={showDetails() ? "Hide details" : "Show details"}>
            ⋯
          </button>
        </div>
      </div>

      {/* Thinking Section */}
      <Show when={hasThinking() &&
            (showThinking() || props.message.streaming?.isThinking)}>
        <div class="reynard-chat-message__thinking">
          <ThinkingIndicator content={getThinkingContent()} isActive={!!props.message.streaming?.isThinking} showContent={showThinking()} variant="pulse" label="Thinking..."/>
        </div>
      </Show>

      {/* Main Content */}
      <div class="reynard-chat-message__content">
        <Show when={getCustomContent()} fallback={<Show when={getDisplayContent()} fallback={<Show when={props.message.streaming?.isStreaming}>
                  <div class="reynard-chat-message__placeholder">
                    <span class="reynard-chat-message__typing-indicator">
                      Preparing response...
                    </span>
                  </div>
                </Show>}>
              <MarkdownRenderer content={getDisplayContent()} streaming={!!props.message.streaming?.isStreaming} enableMath={true} enableDiagrams={true} codeTheme="github-dark"/>
            </Show>}>
          {getCustomContent()}
        </Show>
      </div>

      {/* Tool Calls */}
      <Show when={props.message.toolCalls && props.message.toolCalls.length > 0}>
        <div class="reynard-chat-message__tools">
          <For each={props.message.toolCalls}>
            {(toolCall) => (<ToolCallDisplay toolCall={toolCall} onAction={props.onToolAction}/>)}
          </For>
        </div>
      </Show>

      {/* Error Display */}
      <Show when={props.message.error}>
        <div class="reynard-chat-message__error">
          <div class="reynard-chat-message__error-icon">⚠️</div>
          <div class="reynard-chat-message__error-content">
            <div class="reynard-chat-message__error-message">
              {props.message.error.message}
            </div>
            <Show when={props.message.error.recoverable}>
              <button class="reynard-chat-message__error-retry" onClick={() => {
            // Emit retry event or handle via callback
            console.log("Retry message:", props.message.id);
        }}>
                Retry
              </button>
            </Show>
          </div>
        </div>
      </Show>

      {/* Details Panel */}
      <Show when={showDetails()}>
        <div class="reynard-chat-message__details">
          <div class="reynard-chat-message__details-grid">
            <div class="reynard-chat-message__details-item">
              <label>Message ID:</label>
              <code>{props.message.id}</code>
            </div>

            <Show when={props.message.metadata?.model}>
              <div class="reynard-chat-message__details-item">
                <label>Model:</label>
                <span>{props.message.metadata.model}</span>
              </div>
            </Show>

            <Show when={props.message.metadata?.temperature}>
              <div class="reynard-chat-message__details-item">
                <label>Temperature:</label>
                <span>{props.message.metadata.temperature}</span>
              </div>
            </Show>

            <div class="reynard-chat-message__details-item">
              <label>Timestamp:</label>
              <time datetime={new Date(props.message.timestamp).toISOString()}>
                {new Date(props.message.timestamp).toLocaleString()}
              </time>
            </div>

            <Show when={props.message.metadata?.context}>
              <div class="reynard-chat-message__details-item reynard-chat-message__details-item--full">
                <label>Context:</label>
                <pre class="reynard-chat-message__details-context">
                  {JSON.stringify(props.message.metadata.context, null, 2)}
                </pre>
              </div>
            </Show>
          </div>
        </div>
      </Show>
    </div>);
};
