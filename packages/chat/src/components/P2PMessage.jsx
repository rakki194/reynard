/**
 * P2P Message Component for User-to-User Chat
 *
 * Extends the base ChatMessage component with P2P-specific features like
 * read receipts, reactions, replies, and file attachments.
 */
import { Show, For, createMemo, createSignal } from "solid-js";
import { MarkdownRenderer } from "./MarkdownRenderer";
export const P2PMessage = (props) => {
    const [showReactions, setShowReactions] = createSignal(false);
    const [showMoreActions, setShowMoreActions] = createSignal(false);
    // Check if message is from current user
    const isOwnMessage = createMemo(() => {
        return props.message.sender?.id === props.currentUser.id;
    });
    // Format timestamp relative to now
    const formatTimestamp = (timestamp) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1)
            return "Just now";
        if (minutes < 60)
            return `${minutes}m ago`;
        if (hours < 24)
            return `${hours}h ago`;
        if (days < 7)
            return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    };
    // Get message delivery status icon
    const getDeliveryStatusIcon = () => {
        if (!isOwnMessage())
            return null;
        switch (props.message.deliveryStatus) {
            case "sent":
                return "✓";
            case "delivered":
                return "✓✓";
            case "read":
                return "✓✓";
            case "failed":
                return "❌";
            default:
                return null;
        }
    };
    // Get popular reaction emojis
    const getReactionCounts = createMemo(() => {
        const reactions = props.message.reactions || [];
        const counts = new Map();
        reactions.forEach((reaction) => {
            counts.set(reaction.emoji, reaction.count);
        });
        return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
    });
    // Handle quick reactions
    const handleQuickReaction = (emoji) => {
        props.onReaction?.(emoji);
    };
    // Handle message actions
    const handleAction = (action) => {
        props.onMessageAction?.(action, props.message);
    };
    // Get progress class for upload bar
    const getProgressClass = (progress) => {
        const roundedProgress = Math.round(progress / 10) * 10;
        return `reynard-p2p-message__upload-bar--progress-${roundedProgress}`;
    };
    return (<div class={`reynard-p2p-message ${isOwnMessage() ? "reynard-p2p-message--own" : "reynard-p2p-message--other"}`} data-message-id={props.message.id}>
      {/* Reply indicator */}
      <Show when={props.message.replyTo}>
        <div class="reynard-p2p-message__reply-indicator">
          <span class="reynard-p2p-message__reply-line"/>
          <span class="reynard-p2p-message__reply-text">
            Replying to a message
          </span>
        </div>
      </Show>

      <div class="reynard-p2p-message__container">
        {/* Avatar (for others' messages) */}
        <Show when={props.showAvatar && !isOwnMessage() && props.message.sender}>
          <div class="reynard-p2p-message__avatar">
            {props.message.sender.avatar ||
            props.message.sender.name.charAt(0)}
          </div>
        </Show>

        <div class="reynard-p2p-message__content">
          {/* Message header */}
          <Show when={props.showSender && !isOwnMessage()}>
            <div class="reynard-p2p-message__header">
              <span class="reynard-p2p-message__sender">
                {props.message.sender?.name || "Unknown User"}
              </span>
              <Show when={props.showTimestamp}>
                <time class="reynard-p2p-message__timestamp" datetime={new Date(props.message.timestamp).toISOString()} title={new Date(props.message.timestamp).toLocaleString()}>
                  {formatTimestamp(props.message.timestamp)}
                </time>
              </Show>
            </div>
          </Show>

          {/* Message body */}
          <div class="reynard-p2p-message__body">
            {/* Text content */}
            <Show when={props.message.content}>
              <div class="reynard-p2p-message__text">
                <MarkdownRenderer content={props.message.content} streaming={!!props.message.streaming?.isStreaming} enableMath={true} enableDiagrams={false}/>
              </div>
            </Show>

            {/* File attachments */}
            <Show when={props.message.attachments &&
            props.message.attachments.length > 0}>
              <div class="reynard-p2p-message__attachments">
                <For each={props.message.attachments}>
                  {(attachment) => (<div class="reynard-p2p-message__attachment">
                      <Show when={attachment.type.startsWith("image/")} fallback={<div class="reynard-p2p-message__file">
                            <div class="reynard-p2p-message__file-icon">📎</div>
                            <div class="reynard-p2p-message__file-info">
                              <div class="reynard-p2p-message__file-name">
                                {attachment.name}
                              </div>
                              <div class="reynard-p2p-message__file-size">
                                {(attachment.size / 1024 / 1024).toFixed(1)} MB
                              </div>
                            </div>
                            <Show when={attachment.uploadStatus === "uploading"}>
                              <div class="reynard-p2p-message__upload-progress">
                                <div class={`reynard-p2p-message__upload-bar ${getProgressClass(attachment.uploadProgress || 0)}`}/>
                              </div>
                            </Show>
                          </div>}>
                        <img src={attachment.thumbnailUrl || attachment.url} alt={attachment.name} class="reynard-p2p-message__image" loading="lazy"/>
                      </Show>
                    </div>)}
                </For>
              </div>
            </Show>

            {/* Message actions */}
            <div class="reynard-p2p-message__actions">
              <Show when={props.showReactions}>
                <button class="reynard-p2p-message__action reynard-p2p-message__action--react" onClick={() => setShowReactions(!showReactions())} aria-label="React to message">
                  😊
                </button>
              </Show>

              <button class="reynard-p2p-message__action reynard-p2p-message__action--reply" onClick={() => handleAction("reply")} aria-label="Reply to message">
                ↩️
              </button>

              <Show when={isOwnMessage()}>
                <button class="reynard-p2p-message__action reynard-p2p-message__action--edit" onClick={() => handleAction("edit")} aria-label="Edit message">
                  ✏️
                </button>

                <button class="reynard-p2p-message__action reynard-p2p-message__action--delete" onClick={() => handleAction("delete")} aria-label="Delete message">
                  🗑️
                </button>
              </Show>

              <button class="reynard-p2p-message__action reynard-p2p-message__action--more" onClick={() => setShowMoreActions(!showMoreActions())} aria-label="More actions">
                ⋯
              </button>
            </div>

            {/* Quick reactions */}
            <Show when={showReactions()}>
              <div class="reynard-p2p-message__quick-reactions">
                <For each={[
            "thumbs-up",
            "heart",
            "emoji-laugh",
            "emoji-surprised",
            "emoji-sad",
            "emoji-angry",
        ]}>
                  {(reaction) => (<button class="reynard-p2p-message__quick-reaction" onClick={() => handleQuickReaction(reaction)}>
                      {/* TODO: Fix icon rendering */}
                      <span>{reaction}</span>
                    </button>)}
                </For>
              </div>
            </Show>

            {/* More actions menu */}
            <Show when={showMoreActions()}>
              <div class="reynard-p2p-message__more-actions">
                <button onClick={() => handleAction("copy")}>Copy text</button>
                <button onClick={() => handleAction("forward")}>Forward</button>
                <Show when={!isOwnMessage()}>
                  <button onClick={() => handleAction("report")}>Report</button>
                </Show>
                <Show when={props.message.isPinned}>
                  <button onClick={() => handleAction("unpin")}>Unpin</button>
                </Show>
                <Show when={!props.message.isPinned}>
                  <button onClick={() => handleAction("pin")}>
                    Pin message
                  </button>
                </Show>
              </div>
            </Show>
          </div>

          {/* Message footer */}
          <div class="reynard-p2p-message__footer">
            {/* Reactions */}
            <Show when={getReactionCounts().length > 0}>
              <div class="reynard-p2p-message__reactions">
                <For each={getReactionCounts()}>
                  {([emoji, count]) => (<button class="reynard-p2p-message__reaction" onClick={() => handleQuickReaction(emoji)}>
                      <span class="reynard-p2p-message__reaction-emoji">
                        {emoji}
                      </span>
                      <span class="reynard-p2p-message__reaction-count">
                        {count}
                      </span>
                    </button>)}
                </For>
              </div>
            </Show>

            {/* Read receipts and delivery status */}
            <div class="reynard-p2p-message__status">
              <Show when={isOwnMessage() && props.showTimestamp}>
                <time class="reynard-p2p-message__timestamp reynard-p2p-message__timestamp--own" datetime={new Date(props.message.timestamp).toISOString()}>
                  {formatTimestamp(props.message.timestamp)}
                </time>
              </Show>

              <Show when={isOwnMessage()}>
                <span class="reynard-p2p-message__delivery-status" title={`Message ${props.message.deliveryStatus || "sent"}`}>
                  {getDeliveryStatusIcon()}
                </span>
              </Show>

              <Show when={props.showReadReceipts &&
            props.message.readBy &&
            props.message.readBy.length > 0}>
                <div class="reynard-p2p-message__read-receipts">
                  <For each={props.message.readBy?.slice(0, 3) || []}>
                    {(receipt) => (<div class="reynard-p2p-message__read-receipt" title={`Read by ${receipt.user.name} at ${new Date(receipt.readAt).toLocaleString()}`}>
                        {receipt.user.avatar || receipt.user.name.charAt(0)}
                      </div>)}
                  </For>
                  <Show when={props.message.readBy && props.message.readBy.length > 3}>
                    <span class="reynard-p2p-message__read-count">
                      +{(props.message.readBy?.length || 0) - 3}
                    </span>
                  </Show>
                </div>
              </Show>
            </div>
          </div>

          {/* Edit indicator */}
          <Show when={props.message.editHistory && props.message.editHistory.length > 0}>
            <div class="reynard-p2p-message__edited">
              <span class="reynard-p2p-message__edited-indicator">
                (edited)
              </span>
            </div>
          </Show>

          {/* Priority indicator */}
          <Show when={props.message.priority && props.message.priority !== "normal"}>
            <div class={`reynard-p2p-message__priority reynard-p2p-message__priority--${props.message.priority}`}>
              <span class="reynard-p2p-message__priority-icon">
                {props.message.priority === "urgent"
            ? "🚨"
            : props.message.priority === "high"
                ? "❗"
                : ""}
              </span>
              <span class="reynard-p2p-message__priority-text">
                {props.message.priority?.toUpperCase()}
              </span>
            </div>
          </Show>
        </div>

        {/* Avatar (for own messages) */}
        <Show when={props.showAvatar && isOwnMessage()}>
          <div class="reynard-p2p-message__avatar reynard-p2p-message__avatar--own">
            {props.currentUser.avatar || props.currentUser.name.charAt(0)}
          </div>
        </Show>
      </div>
    </div>);
};
