/**
 * Room List Component for P2P Chat
 *
 * Displays available chat rooms/channels with search, creation,
 * and unread indicators.
 */
import { Show, For, createSignal } from "solid-js";
export const RoomList = props => {
    const [showCreateForm, setShowCreateForm] = createSignal(false);
    const [newRoomName, setNewRoomName] = createSignal("");
    // Format last message preview
    const formatLastMessage = (room) => {
        if (!room.lastMessage)
            return "No messages yet";
        const content = room.lastMessage.content;
        const sender = room.lastMessage.sender?.name || "Someone";
        if (content.length > 30) {
            return `${sender}: ${content.substring(0, 30)}...`;
        }
        return `${sender}: ${content}`;
    };
    // Format last message time
    const formatLastTime = (timestamp) => {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        if (minutes < 1)
            return "now";
        if (minutes < 60)
            return `${minutes}m`;
        if (hours < 24)
            return `${hours}h`;
        if (days < 7)
            return `${days}d`;
        return new Date(timestamp).toLocaleDateString();
    };
    // Get room type icon
    const getRoomIcon = (type) => {
        switch (type) {
            case "direct":
                return "💬";
            case "group":
                return "👥";
            case "public":
                return "🌐";
            case "private":
                return "🔒";
            default:
                return "📁";
        }
    };
    // Handle room creation
    const handleCreateRoom = () => {
        if (newRoomName().trim()) {
            // TODO: Create room logic would go here
            console.log("Creating room:", newRoomName());
            props.onCreateRoom?.();
            setNewRoomName("");
            setShowCreateForm(false);
        }
    };
    return (<div class={`reynard-room-list ${props.compact ? "reynard-room-list--compact" : ""}`}>
      {/* Header */}
      <div class="reynard-room-list__header">
        <h3 class="reynard-room-list__title">Rooms</h3>
        <button class="reynard-room-list__create-button" onClick={() => setShowCreateForm(!showCreateForm())} aria-label="Create new room">
          +
        </button>
      </div>

      {/* Search */}
      <div class="reynard-room-list__search">
        <input type="text" class="reynard-room-list__search-input" placeholder="Search rooms..." value={props.searchQuery || ""} onInput={e => props.onSearch?.(e.currentTarget.value)}/>
      </div>

      {/* Create Room Form */}
      <Show when={showCreateForm()}>
        <div class="reynard-room-list__create-form">
          <input type="text" class="reynard-room-list__create-input" placeholder="Room name..." value={newRoomName()} onInput={e => setNewRoomName(e.currentTarget.value)} onKeyDown={e => {
            if (e.key === "Enter") {
                handleCreateRoom();
            }
            else if (e.key === "Escape") {
                setShowCreateForm(false);
            }
        }}/>
          <div class="reynard-room-list__create-actions">
            <button class="reynard-room-list__create-confirm" onClick={handleCreateRoom} disabled={!newRoomName().trim()}>
              Create
            </button>
            <button class="reynard-room-list__create-cancel" onClick={() => {
            setShowCreateForm(false);
            setNewRoomName("");
        }}>
              Cancel
            </button>
          </div>
        </div>
      </Show>

      {/* Room List */}
      <div class="reynard-room-list__items">
        <Show when={props.rooms.length > 0} fallback={<div class="reynard-room-list__empty">
              <div class="reynard-room-list__empty-icon">🏠</div>
              <div class="reynard-room-list__empty-text">No rooms found</div>
            </div>}>
          <For each={props.rooms}>
            {room => (<div class={`reynard-room-list__item ${props.activeRoom?.id === room.id ? "reynard-room-list__item--active" : ""}`} onClick={() => props.onRoomSelect?.(room)}>
                {/* Room Avatar/Icon */}
                <div class="reynard-room-list__item-avatar">
                  <Show when={room.type === "direct" && room.participants.length === 2} fallback={<span class="reynard-room-list__item-icon">{getRoomIcon(room.type)}</span>}>
                    {/* Direct message - show other user's avatar */}
                    {(() => {
                const otherUser = room.participants.find(p => p.id !== props.currentUser.id);
                return (<span class="reynard-room-list__item-user-avatar">
                          {otherUser?.avatar || otherUser?.name.charAt(0) || "?"}
                        </span>);
            })()}
                  </Show>
                </div>

                {/* Room Info */}
                <div class="reynard-room-list__item-content">
                  <div class="reynard-room-list__item-header">
                    <h4 class="reynard-room-list__item-name">
                      <Show when={room.type === "direct" && room.participants.length === 2} fallback={room.name}>
                        {/* Direct message - show other user's name */}
                        {(() => {
                const otherUser = room.participants.find(p => p.id !== props.currentUser.id);
                return otherUser?.name || "Unknown User";
            })()}
                      </Show>
                    </h4>

                    <Show when={room.lastMessage}>
                      <time class="reynard-room-list__item-time">{formatLastTime(room.lastMessage.timestamp)}</time>
                    </Show>
                  </div>

                  <Show when={!props.compact}>
                    <div class="reynard-room-list__item-footer">
                      <div class="reynard-room-list__item-preview">{formatLastMessage(room)}</div>

                      <div class="reynard-room-list__item-indicators">
                        {/* Unread count */}
                        <Show when={room.unreadCount && room.unreadCount > 0}>
                          <span class="reynard-room-list__item-unread">
                            {room.unreadCount && room.unreadCount > 99 ? "99+" : room.unreadCount}
                          </span>
                        </Show>

                        {/* Typing indicator */}
                        <Show when={room.isTyping}>
                          <span class="reynard-room-list__item-typing">✏️</span>
                        </Show>

                        {/* Online indicator for direct messages */}
                        <Show when={room.type === "direct"}>
                          {(() => {
                const otherUser = room.participants.find(p => p.id !== props.currentUser.id);
                return (<Show when={otherUser?.status === "online"}>
                                <span class="reynard-room-list__item-online">🟢</span>
                              </Show>);
            })()}
                        </Show>
                      </div>
                    </div>
                  </Show>
                </div>

                {/* Room Actions */}
                <div class="reynard-room-list__item-actions">
                  <Show when={room.unreadCount && room.unreadCount > 0}>
                    <span class="reynard-room-list__item-unread-dot"></span>
                  </Show>
                </div>
              </div>)}
          </For>
        </Show>
      </div>

      {/* Footer */}
      <div class="reynard-room-list__footer">
        <div class="reynard-room-list__user-info">
          <div class="reynard-room-list__user-avatar">
            {props.currentUser.avatar || props.currentUser.name.charAt(0)}
          </div>
          <div class="reynard-room-list__user-details">
            <div class="reynard-room-list__user-name">{props.currentUser.name}</div>
            <div class={`reynard-room-list__user-status reynard-room-list__user-status--${props.currentUser.status}`}>
              {props.currentUser.status}
            </div>
          </div>
        </div>
      </div>
    </div>);
};
