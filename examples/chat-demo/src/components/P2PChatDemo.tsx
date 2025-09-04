import { Component, createSignal, onMount } from "solid-js";
import { P2PChatContainer, type ChatUser } from "@reynard/components";

interface P2PChatDemoProps {
  currentUser: ChatUser;
}

export const P2PChatDemo: Component<P2PChatDemoProps> = (props) => {
  const [config, setConfig] = createSignal({
    enableFileUploads: true,
    enableReactions: true,
    enableTypingIndicators: true,
    enableReadReceipts: true,
    enableThreads: false,
    maxFileSize: 10 * 1024 * 1024, // 10MB
  });

  const [uiConfig, setUiConfig] = createSignal({
    showUserList: true,
    showRoomList: true,
    compact: false,
    theme: "auto" as const,
  });

  const [connectionStatus, setConnectionStatus] = createSignal<
    "disconnected" | "connecting" | "connected"
  >("connecting");
  const [stats, setStats] = createSignal({
    rooms: 0,
    onlineUsers: 0,
    totalMessages: 0,
  });

  // Mock initial rooms for the demo
  const initialRooms = [
    {
      id: "room-general",
      name: "General",
      type: "public" as const,
      description: "General discussion for everyone",
      participants: [
        props.currentUser,
        {
          id: "user-2",
          name: "Alice Smith",
          status: "online" as const,
          avatar: "👩",
        },
        {
          id: "user-3",
          name: "Bob Johnson",
          status: "away" as const,
          avatar: "👨",
        },
        {
          id: "user-4",
          name: "Carol Davis",
          status: "online" as const,
          avatar: "👩‍💼",
        },
      ],
      unreadCount: 2,
      lastMessage: {
        id: "msg-1",
        role: "user" as const,
        content: "Hey everyone! How's the project going?",
        timestamp: Date.now() - 300000, // 5 minutes ago
        roomId: "room-general",
        sender: {
          id: "user-2",
          name: "Alice Smith",
          status: "online" as const,
        },
      },
    },
    {
      id: "room-dev",
      name: "Development",
      type: "private" as const,
      description: "Development team discussions",
      participants: [
        props.currentUser,
        {
          id: "user-2",
          name: "Alice Smith",
          status: "online" as const,
          avatar: "👩",
        },
        {
          id: "user-5",
          name: "Dev Lead",
          status: "busy" as const,
          avatar: "👨‍💻",
        },
      ],
      unreadCount: 0,
      lastMessage: {
        id: "msg-2",
        role: "user" as const,
        content: "The new chat system is looking great! 🚀",
        timestamp: Date.now() - 600000, // 10 minutes ago
        roomId: "room-dev",
        sender: { id: "user-5", name: "Dev Lead", status: "busy" as const },
      },
    },
    {
      id: "dm-alice",
      name: "Alice Smith",
      type: "direct" as const,
      participants: [
        props.currentUser,
        {
          id: "user-2",
          name: "Alice Smith",
          status: "online" as const,
          avatar: "👩",
        },
      ],
      unreadCount: 1,
      lastMessage: {
        id: "msg-3",
        role: "user" as const,
        content: "Can we sync up about the Reynard demo?",
        timestamp: Date.now() - 120000, // 2 minutes ago
        roomId: "dm-alice",
        sender: {
          id: "user-2",
          name: "Alice Smith",
          status: "online" as const,
        },
      },
    },
  ];

  onMount(() => {
    // Simulate connection and stats updates
    setTimeout(() => {
      setConnectionStatus("connected");
      setStats({
        rooms: initialRooms.length,
        onlineUsers: 4,
        totalMessages: 127,
      });
    }, 1500);
  });

  return (
    <div class="demo-container">
      <div class="demo-header">
        <div class="demo-title">
          <h2>👥 Team Chat (P2P)</h2>
          <p>
            Real-time user messaging with rooms, presence indicators, file
            sharing, reactions, and advanced collaboration features.
          </p>
        </div>

        <div class="demo-controls">
          {/* Feature Toggles */}
          <div class="control-group">
            <label class="control-label">Chat Features</label>
            <div class="toggle-group">
              <label class="toggle-item">
                <input
                  type="checkbox"
                  checked={config().enableReactions}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      enableReactions: e.target.checked,
                    }))
                  }
                />
                <span class="toggle-label">😊 Reactions</span>
              </label>

              <label class="toggle-item">
                <input
                  type="checkbox"
                  checked={config().enableTypingIndicators}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      enableTypingIndicators: e.target.checked,
                    }))
                  }
                />
                <span class="toggle-label">✏️ Typing Indicators</span>
              </label>

              <label class="toggle-item">
                <input
                  type="checkbox"
                  checked={config().enableReadReceipts}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      enableReadReceipts: e.target.checked,
                    }))
                  }
                />
                <span class="toggle-label">✓ Read Receipts</span>
              </label>

              <label class="toggle-item">
                <input
                  type="checkbox"
                  checked={config().enableFileUploads}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      enableFileUploads: e.target.checked,
                    }))
                  }
                />
                <span class="toggle-label">📎 File Uploads</span>
              </label>
            </div>
          </div>

          {/* UI Configuration */}
          <div class="control-group">
            <label class="control-label">Interface</label>
            <div class="toggle-group">
              <label class="toggle-item">
                <input
                  type="checkbox"
                  checked={uiConfig().showRoomList}
                  onChange={(e) =>
                    setUiConfig((prev) => ({
                      ...prev,
                      showRoomList: e.target.checked,
                    }))
                  }
                />
                <span class="toggle-label">📁 Room List</span>
              </label>

              <label class="toggle-item">
                <input
                  type="checkbox"
                  checked={uiConfig().showUserList}
                  onChange={(e) =>
                    setUiConfig((prev) => ({
                      ...prev,
                      showUserList: e.target.checked,
                    }))
                  }
                />
                <span class="toggle-label">👥 User List</span>
              </label>

              <label class="toggle-item">
                <input
                  type="checkbox"
                  checked={uiConfig().compact}
                  onChange={(e) =>
                    setUiConfig((prev) => ({
                      ...prev,
                      compact: e.target.checked,
                    }))
                  }
                />
                <span class="toggle-label">📱 Compact Mode</span>
              </label>
            </div>
          </div>

          {/* Stats Display */}
          <div class="stats-display">
            <div class="stat-item">
              <div class="stat-value">{stats().rooms}</div>
              <div class="stat-label">Rooms</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{stats().onlineUsers}</div>
              <div class="stat-label">Online</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{stats().totalMessages}</div>
              <div class="stat-label">Messages</div>
            </div>
          </div>

          {/* Connection Status */}
          <div class="connection-status">
            <div class={`status-indicator ${connectionStatus()}`}>
              {connectionStatus() === "connected"
                ? "🟢"
                : connectionStatus() === "connecting"
                  ? "🟡"
                  : "🔴"}
            </div>
            <span class="status-text">
              {connectionStatus() === "connected"
                ? "Connected"
                : connectionStatus() === "connecting"
                  ? "Connecting..."
                  : "Disconnected"}
            </span>
          </div>
        </div>
      </div>

      <div class="demo-content">
        <div class="chat-container-wrapper">
          <P2PChatContainer
            currentUser={props.currentUser}
            realtimeEndpoint="ws://localhost:8080/chat"
            apiEndpoint="/api/chat"
            authHeaders={{
              Authorization: "Bearer demo-token-123",
              "X-Demo-Mode": "true",
            }}
            initialRooms={initialRooms}
            initialRoomId="room-general"
            config={config()}
            ui={uiConfig()}
            onRoomJoined={(room) => {
              console.log("Joined room:", room.name);
            }}
            onRoomLeft={(room) => {
              console.log("Left room:", room.name);
            }}
            onMessageReceived={(message) => {
              console.log("Message received:", message);
              // Update stats
              setStats((prev) => ({
                ...prev,
                totalMessages: prev.totalMessages + 1,
              }));
            }}
            onUserStatusChanged={(user) => {
              console.log("User status changed:", user);
            }}
            onError={(error) => {
              console.error("P2P Chat error:", error);
            }}
          />
        </div>

        {/* Feature Highlights */}
        <div class="feature-highlights">
          <h4>🎯 P2P Chat Features</h4>
          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon">💬</div>
              <div class="feature-title">Real-time Messaging</div>
              <div class="feature-description">
                Instant message delivery with WebSocket connections
              </div>
            </div>

            <div class="feature-card">
              <div class="feature-icon">🏠</div>
              <div class="feature-title">Room Management</div>
              <div class="feature-description">
                Public channels, private groups, and direct messages
              </div>
            </div>

            <div class="feature-card">
              <div class="feature-icon">👁️</div>
              <div class="feature-title">Presence & Status</div>
              <div class="feature-description">
                Online indicators and custom status messages
              </div>
            </div>

            <div class="feature-card">
              <div class="feature-icon">📎</div>
              <div class="feature-title">File Sharing</div>
              <div class="feature-description">
                Upload images, documents, and media with previews
              </div>
            </div>

            <div class="feature-card">
              <div class="feature-icon">😊</div>
              <div class="feature-title">Rich Interactions</div>
              <div class="feature-description">
                Emoji reactions, message threading, and mentions
              </div>
            </div>

            <div class="feature-card">
              <div class="feature-icon">🔍</div>
              <div class="feature-title">Search & History</div>
              <div class="feature-description">
                Full-text message search and conversation history
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
