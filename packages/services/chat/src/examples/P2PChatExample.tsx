/**
 * P2P Chat Example
 *
 * Demonstrates how to use the P2P chat system for user-to-user messaging
 * with both assistant chat and peer-to-peer functionality.
 */
import { createSignal, For } from "solid-js";
import { ChatContainer } from "../components";
import { P2PChatContainer, useP2PChat } from "../p2p";
import "./P2PChatExample.css";
// Example: Basic P2P Chat
export const BasicP2PChat = () => {
  const currentUser = {
    id: "user-123",
    name: "John Doe",
    status: "online",
    avatar: "👤",
  };
  return (
    <div class="p2p-chat-container">
      <P2PChatContainer
        currentUser={currentUser}
        realtimeEndpoint="wss://your-websocket-server.com/chat"
        apiEndpoint="/api/chat"
        authHeaders={{
          Authorization: "Bearer your-auth-token",
        }}
        config={{
          enableFileUploads: true,
          enableReactions: true,
          enableTypingIndicators: true,
          enableReadReceipts: true,
          maxFileSize: 10 * 1024 * 1024, // 10MB
        }}
        ui={{
          showUserList: true,
          showRoomList: true,
          compact: false,
        }}
        onRoomJoined={room => console.log("Joined room:", room.name)}
        onMessageReceived={message => console.log("New message:", message.content)}
        onError={error => console.error("Chat error:", error)}
      />
    </div>
  );
};
// Example: Side-by-side Assistant and P2P Chat
export const DualChatExample = () => {
  const [activeTab, setActiveTab] = createSignal("assistant");
  const currentUser = {
    id: "user-123",
    name: "John Doe",
    status: "online",
    avatar: "👤",
  };
  return (
    <div class="p2p-chat-container-column">
      {/* Tab Navigation */}
      <div class="p2p-tab-navigation">
        <button
          class={`p2p-tab-button ${activeTab() === "assistant" ? "p2p-tab-button-active" : "p2p-tab-button-inactive"}`}
          onClick={() => setActiveTab("assistant")}
        >
          🦊 AI Assistant
        </button>
        <button
          class={`p2p-tab-button ${activeTab() === "p2p" ? "p2p-tab-button-active" : "p2p-tab-button-inactive"}`}
          onClick={() => setActiveTab("p2p")}
        >
          👥 Team Chat
        </button>
      </div>

      {/* Chat Content */}
      <div class="p2p-chat-content">
        {activeTab() === "assistant" ? (
          <ChatContainer
            endpoint="/api/assistant"
            height="100%"
            config={{
              enableThinking: true,
              enableTools: true,
              showTimestamps: true,
            }}
          />
        ) : (
          <P2PChatContainer
            currentUser={currentUser}
            realtimeEndpoint="wss://your-websocket-server.com/chat"
            apiEndpoint="/api/chat"
          />
        )}
      </div>
    </div>
  );
};
// Example: Custom P2P Chat with Hooks
export const CustomP2PChat = () => {
  const currentUser = {
    id: "user-123",
    name: "John Doe",
    status: "online",
  };
  const p2pChat = useP2PChat({
    currentUser,
    realtimeEndpoint: "wss://your-websocket-server.com/chat",
    apiEndpoint: "/api/chat",
    autoConnect: true,
    config: {
      enableFileUploads: true,
      enableReactions: true,
      enableTypingIndicators: true,
    },
  });
  const handleSendMessage = async content => {
    const activeRoom = p2pChat.activeRoom();
    if (activeRoom) {
      await p2pChat.actions.sendMessageToRoom(activeRoom.id, content);
    }
  };
  const handleCreateDirectMessage = async userId => {
    const room = await p2pChat.actions.createRoom(`DM with ${userId}`, "direct", [
      { id: userId, name: "Other User", status: "online" },
    ]);
    p2pChat.actions.switchRoom(room.id);
  };
  return (
    <div class="p2p-chat-container-flex">
      {/* Custom Room List */}
      <div class="p2p-room-list">
        <h3>Rooms ({p2pChat.rooms().length})</h3>
        <div>
          <For each={p2pChat.rooms()}>
            {room => (
              <div
                class={`p2p-room-item ${p2pChat.activeRoom()?.id === room.id ? "p2p-room-item-active" : "p2p-room-item-inactive"}`}
                onClick={() => p2pChat.actions.switchRoom(room.id)}
              >
                <strong>{room.name}</strong>
                {room.unreadCount && room.unreadCount > 0 && <span class="p2p-unread-badge">{room.unreadCount}</span>}
              </div>
            )}
          </For>
        </div>

        <button onClick={() => handleCreateDirectMessage("other-user-id")} class="p2p-start-dm-button">
          Start DM
        </button>
      </div>

      {/* Custom Chat Area */}
      <div class="p2p-chat-area">
        {/* Messages */}
        <div class="p2p-messages-container">
          <For each={p2pChat.messages()}>
            {message => (
              <div
                class={`p2p-message ${message.sender?.id === currentUser.id ? "p2p-message-own" : "p2p-message-other"}`}
              >
                <div class="p2p-message-sender">{message.sender?.name || "Unknown"}</div>
                <div>{message.content}</div>
                <div class="p2p-message-timestamp">{new Date(message.timestamp).toLocaleTimeString()}</div>
              </div>
            )}
          </For>
        </div>

        {/* Input */}
        <div class="p2p-input-container">
          <input
            type="text"
            placeholder="Type a message..."
            class="p2p-message-input"
            onKeyDown={e => {
              if (e.key === "Enter") {
                const target = e.target;
                if (target.value.trim()) {
                  handleSendMessage(target.value.trim());
                  target.value = "";
                }
              }
            }}
          />
        </div>
      </div>

      {/* Connection Status */}
      <div
        class={`p2p-connection-status ${p2pChat.p2pConnection().status === "connected" ? "p2p-connection-connected" : "p2p-connection-disconnected"}`}
      >
        {p2pChat.p2pConnection().status}
      </div>
    </div>
  );
};
// Example: Real-time Features Demo
export const RealtimeFeaturesDemo = () => {
  const currentUser = {
    id: "user-123",
    name: "John Doe",
    status: "online",
  };
  const p2pChat = useP2PChat({
    currentUser,
    realtimeEndpoint: "wss://your-websocket-server.com/chat",
    config: {
      enableTypingIndicators: true,
      enableReactions: true,
      enableReadReceipts: true,
    },
  });
  return (
    <div class="p2p-demo-container">
      <h2>Real-time Features Demo</h2>

      {/* Status Controls */}
      <div class="p2p-demo-section">
        <label class="p2p-demo-label">Status: </label>
        <select
          class="p2p-demo-select"
          aria-label="Select user status"
          value={currentUser.status}
          onChange={e => {
            const newStatus = e.target.value;
            p2pChat.actions.updateUserStatusViaWebSocket(newStatus);
          }}
        >
          <option value="online">Online</option>
          <option value="away">Away</option>
          <option value="busy">Busy</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      {/* Typing Indicators */}
      <div class="p2p-demo-section">
        <h3>Typing Indicators</h3>
        <button
          class="p2p-demo-button"
          onClick={() => {
            const activeRoom = p2pChat.activeRoom();
            if (activeRoom) {
              p2pChat.actions.startTyping(activeRoom.id);
              setTimeout(() => {
                p2pChat.actions.stopTyping(activeRoom.id);
              }, 3000);
            }
          }}
        >
          Simulate Typing (3s)
        </button>
      </div>

      {/* File Upload */}
      <div class="p2p-demo-section">
        <h3>File Upload</h3>
        <input
          type="file"
          class="p2p-demo-file-input"
          aria-label="Select file to upload"
          onChange={async e => {
            const file = e.target.files?.[0];
            const activeRoom = p2pChat.activeRoom();
            if (file && activeRoom) {
              try {
                const attachment = await p2pChat.actions.uploadFile(file, activeRoom.id);
                console.log("File uploaded:", attachment);
              } catch (error) {
                console.error("Upload failed:", error);
              }
            }
          }}
        />
      </div>

      {/* Search */}
      <div class="p2p-demo-section">
        <h3>Message Search</h3>
        <input
          type="text"
          placeholder="Search messages..."
          class="p2p-demo-input"
          onInput={async e => {
            const query = e.target.value;
            if (query.length > 2) {
              const results = await p2pChat.actions.searchMessages(query);
              console.log("Search results:", results);
            }
          }}
        />
      </div>

      {/* Export/Import */}
      <div>
        <h3>Export/Import</h3>
        <button
          class="p2p-demo-button"
          onClick={() => {
            const json = p2pChat.actions.exportConversation("json");
            const blob = new Blob([json], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "chat-export.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export Chat
        </button>
      </div>
    </div>
  );
};
