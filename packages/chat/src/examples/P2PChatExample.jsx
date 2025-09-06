/**
 * P2P Chat Example
 *
 * Demonstrates how to use the P2P chat system for user-to-user messaging
 * with both assistant chat and peer-to-peer functionality.
 */
import { createSignal } from "solid-js";
import {
  P2PChatContainer,
  ChatContainer,
  useP2PChat,
} from "reynard-components";
// Example: Basic P2P Chat
export const BasicP2PChat = () => {
  const currentUser = {
    id: "user-123",
    name: "John Doe",
    status: "online",
    avatar: "👤",
  };
  return (
    <div style={{ height: "600px", width: "100%" }}>
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
        onRoomJoined={(room) => console.log("Joined room:", room.name)}
        onMessageReceived={(message) =>
          console.log("New message:", message.content)
        }
        onError={(error) => console.error("Chat error:", error)}
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
    <div
      style={{
        height: "600px",
        width: "100%",
        display: "flex",
        "flex-direction": "column",
      }}
    >
      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          "border-bottom": "1px solid #e2e8f0",
          background: "#f8fafc",
        }}
      >
        <button
          style={{
            padding: "12px 24px",
            border: "none",
            background: activeTab() === "assistant" ? "#3b82f6" : "transparent",
            color: activeTab() === "assistant" ? "white" : "#64748b",
            cursor: "pointer",
          }}
          onClick={() => setActiveTab("assistant")}
        >
          🦊 AI Assistant
        </button>
        <button
          style={{
            padding: "12px 24px",
            border: "none",
            background: activeTab() === "p2p" ? "#3b82f6" : "transparent",
            color: activeTab() === "p2p" ? "white" : "#64748b",
            cursor: "pointer",
          }}
          onClick={() => setActiveTab("p2p")}
        >
          👥 Team Chat
        </button>
      </div>

      {/* Chat Content */}
      <div style={{ flex: 1 }}>
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
            height="100%"
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
  const handleSendMessage = async (content) => {
    const activeRoom = p2pChat.activeRoom();
    if (activeRoom) {
      await p2pChat.actions.sendMessageToRoom(activeRoom.id, content);
    }
  };
  const handleCreateDirectMessage = async (userId) => {
    const room = await p2pChat.actions.createRoom(
      `DM with ${userId}`,
      "direct",
      [{ id: userId, name: "Other User", status: "online" }],
    );
    p2pChat.actions.switchRoom(room.id);
  };
  return (
    <div style={{ height: "600px", display: "flex" }}>
      {/* Custom Room List */}
      <div style={{ width: "250px", "border-right": "1px solid #e2e8f0" }}>
        <h3>Rooms ({p2pChat.rooms().length})</h3>
        <div>
          {p2pChat.rooms().map((room) => (
            <div
              key={room.id}
              style={{
                padding: "12px",
                cursor: "pointer",
                background:
                  p2pChat.activeRoom()?.id === room.id
                    ? "#e0e7ff"
                    : "transparent",
              }}
              onClick={() => p2pChat.actions.switchRoom(room.id)}
            >
              <strong>{room.name}</strong>
              {room.unreadCount && room.unreadCount > 0 && (
                <span
                  style={{
                    background: "#ef4444",
                    color: "white",
                    "border-radius": "50%",
                    padding: "2px 6px",
                    "font-size": "12px",
                    "margin-left": "8px",
                  }}
                >
                  {room.unreadCount}
                </span>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={() => handleCreateDirectMessage("other-user-id")}
          style={{
            width: "100%",
            padding: "12px",
            background: "#3b82f6",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Start DM
        </button>
      </div>

      {/* Custom Chat Area */}
      <div style={{ flex: 1, display: "flex", "flex-direction": "column" }}>
        {/* Messages */}
        <div style={{ flex: 1, padding: "16px", "overflow-y": "auto" }}>
          {p2pChat.messages().map((message) => (
            <div
              key={message.id}
              style={{
                "margin-bottom": "16px",
                padding: "12px",
                background:
                  message.sender?.id === currentUser.id ? "#dbeafe" : "#f3f4f6",
                "border-radius": "8px",
                "margin-left":
                  message.sender?.id === currentUser.id ? "20%" : "0",
                "margin-right":
                  message.sender?.id === currentUser.id ? "0" : "20%",
              }}
            >
              <div style={{ "font-weight": "bold", "margin-bottom": "4px" }}>
                {message.sender?.name || "Unknown"}
              </div>
              <div>{message.content}</div>
              <div
                style={{
                  "font-size": "12px",
                  color: "#6b7280",
                  "margin-top": "4px",
                }}
              >
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div style={{ padding: "16px", "border-top": "1px solid #e2e8f0" }}>
          <input
            type="text"
            placeholder="Type a message..."
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid #d1d5db",
              "border-radius": "6px",
            }}
            onKeyDown={(e) => {
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
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          padding: "8px 12px",
          background:
            p2pChat.p2pConnection().status === "connected"
              ? "#10b981"
              : "#ef4444",
          color: "white",
          "border-radius": "4px",
          "font-size": "12px",
        }}
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
    <div style={{ height: "600px", padding: "20px" }}>
      <h2>Real-time Features Demo</h2>

      {/* Status Controls */}
      <div style={{ "margin-bottom": "20px" }}>
        <label>Status: </label>
        <select
          value={currentUser.status}
          onChange={(e) => {
            const newStatus = e.target.value;
            p2pChat.actions.updateUserStatus(newStatus);
          }}
        >
          <option value="online">Online</option>
          <option value="away">Away</option>
          <option value="busy">Busy</option>
          <option value="offline">Offline</option>
        </select>
      </div>

      {/* Typing Indicators */}
      <div style={{ "margin-bottom": "20px" }}>
        <h3>Typing Indicators</h3>
        <button
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
      <div style={{ "margin-bottom": "20px" }}>
        <h3>File Upload</h3>
        <input
          type="file"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            const activeRoom = p2pChat.activeRoom();
            if (file && activeRoom) {
              try {
                const attachment = await p2pChat.actions.uploadFile(
                  file,
                  activeRoom.id,
                );
                console.log("File uploaded:", attachment);
              } catch (error) {
                console.error("Upload failed:", error);
              }
            }
          }}
        />
      </div>

      {/* Search */}
      <div style={{ "margin-bottom": "20px" }}>
        <h3>Message Search</h3>
        <input
          type="text"
          placeholder="Search messages..."
          onInput={async (e) => {
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
