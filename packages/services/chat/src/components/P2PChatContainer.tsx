/**
 * P2P Chat Container for User-to-User Messaging
 *
 * Extends the base ChatContainer with peer-to-peer functionality including
 * room management, user lists, typing indicators, and file sharing.
 */
import { Show, For, createEffect, createSignal, onCleanup, createMemo } from "solid-js";
import { useP2PChat } from "../composables/useP2PChat";
import { MessageInput } from "./MessageInput";
import { RoomList } from "./RoomList";
import { UserList } from "./UserList";
import { P2PMessage } from "./P2PMessage";
export const P2PChatContainer = props => {
  const [sidebarOpen, setSidebarOpen] = createSignal(true);
  const [userListOpen, setUserListOpen] = createSignal(props.ui?.showUserList ?? true);
  const [searchQuery, setSearchQuery] = createSignal("");
  let messagesContainerRef;
  let isUserScrolling = false;
  let scrollTimeout;
  // Initialize P2P chat
  const p2pChat = useP2PChat({
    currentUser: props.currentUser,
    realtimeEndpoint: props.realtimeEndpoint,
    apiEndpoint: props.apiEndpoint,
    authHeaders: props.authHeaders,
    initialRoomId: props.initialRoomId,
    initialRooms: props.initialRooms,
    config: props.config,
  });
  // Auto-scroll management
  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef && !isUserScrolling) {
      messagesContainerRef.scrollTo({
        top: messagesContainerRef.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };
  const handleScroll = () => {
    if (!messagesContainerRef) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
    isUserScrolling = !isAtBottom;
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    scrollTimeout = window.setTimeout(() => {
      isUserScrolling = false;
    }, 150);
  };
  // Auto-scroll when messages change
  createEffect(() => {
    const messages = p2pChat.messages();
    if (messages.length > 0 && !isUserScrolling) {
      setTimeout(() => scrollToBottom(true), 10);
    }
  });
  // Handle room selection
  const handleRoomSelect = room => {
    p2pChat.actions.switchRoom(room.id);
    props.onRoomJoined?.(room);
  };
  // Handle message sending
  const handleMessageSubmit = async content => {
    const activeRoom = p2pChat.activeRoom();
    if (!activeRoom) return;
    try {
      await p2pChat.actions.sendMessageToRoom(activeRoom.id, content);
    } catch (error) {
      console.error("Failed to send message:", error);
      props.onError?.(error);
    }
  };
  // Handle typing indicators
  const handleInputChange = content => {
    const activeRoom = p2pChat.activeRoom();
    if (!activeRoom) return;
    if (content.trim()) {
      p2pChat.actions.startTyping(activeRoom.id);
    } else {
      p2pChat.actions.stopTyping(activeRoom.id);
    }
  };
  // Filter rooms based on search
  const filteredRooms = createMemo(() => {
    const query = searchQuery().toLowerCase();
    if (!query) return p2pChat.rooms();
    return p2pChat
      .rooms()
      .filter(
        room =>
          room.name.toLowerCase().includes(query) || room.participants.some(p => p.name.toLowerCase().includes(query))
      );
  });
  // Get current room participants
  const currentRoomParticipants = createMemo(() => {
    const room = p2pChat.activeRoom();
    return room ? room.participants : [];
  });
  // Get typing users for current room
  const typingUsers = createMemo(() => {
    const room = p2pChat.activeRoom();
    if (!room) return [];
    const indicators = p2pChat.typingIndicators()[room.id] || [];
    return indicators.filter(t => t.user.id !== props.currentUser.id).map(t => t.user);
  });
  // Connection status display
  const getConnectionStatus = () => {
    const status = p2pChat.p2pConnection().status;
    switch (status) {
      case "connected":
        return { icon: "🟢", text: "Connected" };
      case "connecting":
        return { icon: "🟡", text: "Connecting..." };
      case "reconnecting":
        return { icon: "🟠", text: "Reconnecting..." };
      case "disconnected":
        return { icon: "🔴", text: "Disconnected" };
      case "error":
        return { icon: "❌", text: "Connection Error" };
      default:
        return { icon: "⚪", text: "Unknown" };
    }
  };
  // Cleanup on unmount
  onCleanup(() => {
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
  });
  return (
    <div class={`reynard-p2p-chat-container ${props.ui?.compact ? "reynard-p2p-chat-container--compact" : ""}`}>
      {/* Sidebar */}
      <Show when={sidebarOpen() && (props.ui?.showRoomList ?? true)}>
        <div class="reynard-p2p-chat-sidebar">
          {/* Connection Status */}
          <div class="reynard-p2p-chat-status">
            <span class="reynard-p2p-chat-status__indicator">{getConnectionStatus().icon}</span>
            <span class="reynard-p2p-chat-status__text">{getConnectionStatus().text}</span>
            <button
              class="reynard-p2p-chat-status__toggle"
              onClick={() => setSidebarOpen(!sidebarOpen())}
              aria-label="Toggle sidebar"
            >
              ←
            </button>
          </div>

          {/* Room List */}
          <RoomList
            rooms={filteredRooms()}
            activeRoom={p2pChat.activeRoom()}
            currentUser={props.currentUser}
            onRoomSelect={handleRoomSelect}
            onCreateRoom={() => {
              // TODO: Implement room creation modal
              console.log("Create room");
            }}
            searchQuery={searchQuery()}
            onSearch={setSearchQuery}
            compact={props.ui?.compact}
          />
        </div>
      </Show>

      {/* Main Chat Area */}
      <div class="reynard-p2p-chat-main">
        {/* Chat Header */}
        <Show when={p2pChat.activeRoom()}>
          <div class="reynard-p2p-chat-header">
            <Show when={!sidebarOpen()}>
              <button
                class="reynard-p2p-chat-header__sidebar-toggle"
                onClick={() => setSidebarOpen(true)}
                aria-label="Show sidebar"
              >
                ☰
              </button>
            </Show>

            <div class="reynard-p2p-chat-header__info">
              <h2 class="reynard-p2p-chat-header__title">{p2pChat.activeRoom().name}</h2>
              <span class="reynard-p2p-chat-header__participants">{currentRoomParticipants().length} participants</span>
            </div>

            <div class="reynard-p2p-chat-header__actions">
              <Show when={props.ui?.showUserList ?? true}>
                <button
                  class="reynard-p2p-chat-header__user-toggle"
                  onClick={() => setUserListOpen(!userListOpen())}
                  aria-label="Toggle user list"
                >
                  👥
                </button>
              </Show>
            </div>
          </div>
        </Show>

        {/* Messages Area */}
        <div class="reynard-p2p-chat-content">
          <Show
            when={p2pChat.activeRoom()}
            fallback={
              <div class="reynard-p2p-chat-empty">
                <div class="reynard-p2p-chat-empty__icon">💬</div>
                <div class="reynard-p2p-chat-empty__text">Select a room to start chatting</div>
              </div>
            }
          >
            <div ref={messagesContainerRef} class="reynard-p2p-chat-messages" onScroll={handleScroll}>
              <For each={p2pChat.messages()}>
                {message => (
                  <P2PMessage
                    message={message}
                    currentUser={props.currentUser}
                    showSender={true}
                    showAvatar={!props.ui?.compact}
                    showTimestamp={true}
                    showReactions={props.config?.enableReactions}
                    showReadReceipts={props.config?.enableReadReceipts}
                    onMessageAction={(action, msg) => {
                      console.log("Message action:", action, msg);
                      // Handle message actions (edit, delete, reply, etc.)
                    }}
                    onReaction={emoji => {
                      if (props.config?.enableReactions) {
                        p2pChat.actions.reactToMessage(message.id, emoji);
                      }
                    }}
                  />
                )}
              </For>

              {/* Typing Indicators */}
              <Show when={typingUsers().length > 0}>
                <div class="reynard-p2p-chat-typing">
                  <div class="reynard-p2p-chat-typing__avatars">
                    <For each={typingUsers()}>
                      {user => <div class="reynard-p2p-chat-typing__avatar">{user.avatar || user.name.charAt(0)}</div>}
                    </For>
                  </div>
                  <div class="reynard-p2p-chat-typing__text">
                    {typingUsers().length === 1
                      ? `${typingUsers()[0].name} is typing...`
                      : `${typingUsers().length} people are typing...`}
                  </div>
                  <div class="reynard-p2p-chat-typing__dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </Show>
            </div>

            {/* Message Input */}
            <div class="reynard-p2p-chat-input">
              <MessageInput
                placeholder="Type a message..."
                disabled={p2pChat.p2pConnection().status !== "connected"}
                multiline={true}
                autoResize={true}
                maxLength={4000}
                onSubmit={handleMessageSubmit}
                onChange={handleInputChange}
                variant={props.ui?.compact ? "compact" : "default"}
              />
            </div>
          </Show>
        </div>
      </div>

      {/* User List */}
      <Show when={userListOpen() && p2pChat.activeRoom() && (props.ui?.showUserList ?? true)}>
        <div class="reynard-p2p-chat-userlist">
          <UserList
            users={currentRoomParticipants()}
            currentUser={props.currentUser}
            onUserSelect={user => {
              console.log("User selected:", user);
              // TODO: Handle user selection (profile, DM, etc.)
            }}
            showStatus={true}
            showActions={false}
            compact={props.ui?.compact}
          />
        </div>
      </Show>
    </div>
  );
};
