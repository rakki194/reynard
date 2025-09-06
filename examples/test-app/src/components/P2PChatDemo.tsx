import { createSignal, For, Show, onCleanup } from "solid-js";
import { Button, Card } from "reynard-components";
import { MarkdownRenderer } from "reynard-chat";
import { getIcon } from "reynard-fluent-icons";

interface MockUser {
  id: string;
  name: string;
  avatar?: string | SVGElement | null;
  status: "online" | "away" | "busy" | "offline";
}

interface MockRoom {
  id: string;
  name: string;
  type: "group" | "direct";
  participants: MockUser[];
  lastMessage?: {
    content: string;
    timestamp: number;
    sender: MockUser;
  };
  unreadCount: number;
}

interface MockMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  roomId: string;
  sender: MockUser;
  timestamp: number;
  deliveryStatus: "sent" | "delivered" | "read";
  reactions?: Array<{
    emoji: string;
    users: MockUser[];
  }>;
  readBy?: Array<{
    user: MockUser;
    readAt: number;
  }>;
}

export function P2PChatDemo() {
  const [isConnected, setIsConnected] = createSignal(false);
  const [currentUser] = createSignal<MockUser>({
    id: "demo-user",
    name: "Demo User",
    avatar: getIcon("user"),
    status: "online",
  });

  const [mockRooms, setMockRooms] = createSignal<MockRoom[]>([
    {
      id: "general",
      name: "General Chat",
      type: "group",
      participants: [
        currentUser(),
        { id: "alice", name: "Alice", avatar: getIcon("user"), status: "online" },
        { id: "bob", name: "Bob", avatar: getIcon("user"), status: "away" },
        { id: "charlie", name: "Charlie", avatar: getIcon("user"), status: "online" },
      ],
      unreadCount: 3,
    },
    {
      id: "ai-assistants",
      name: "AI Assistants",
      type: "group",
      participants: [
        currentUser(),
        { id: "reynard-ai", name: "Reynard AI", avatar: getIcon("brain"), status: "online" },
        { id: "claude-ai", name: "Claude AI", avatar: getIcon("brain"), status: "online" },
      ],
      unreadCount: 1,
    },
    {
      id: "direct-alice",
      name: "Alice",
      type: "direct",
      participants: [currentUser(), { id: "alice", name: "Alice", avatar: getIcon("user"), status: "online" }],
      unreadCount: 0,
    },
  ]);

  const [mockMessages, setMockMessages] = createSignal<Record<string, MockMessage[]>>({
    general: [
      {
        id: "1",
        role: "user",
        content: "Hey everyone! How's the project going?",
        roomId: "general",
        sender: { id: "alice", name: "Alice", avatar: getIcon("user"), status: "online" },
        timestamp: Date.now() - 300000,
        deliveryStatus: "read",
      },
      {
        id: "2",
        role: "user",
        content: "Making good progress! The new features are looking great.",
        roomId: "general",
        sender: { id: "bob", name: "Bob", avatar: getIcon("user"), status: "away" },
        timestamp: Date.now() - 240000,
        deliveryStatus: "read",
      },
      {
        id: "3",
        role: "user",
        content: "I've been working on the **streaming markdown** implementation. It's coming along nicely!",
        roomId: "general",
        sender: { id: "charlie", name: "Charlie", avatar: getIcon("user"), status: "online" },
        timestamp: Date.now() - 180000,
        deliveryStatus: "read",
        reactions: [
          { emoji: "👍", users: [currentUser(), { id: "alice", name: "Alice", avatar: getIcon("user"), status: "online" }] },
        ],
      },
    ],
    "ai-assistants": [
      {
        id: "4",
        role: "assistant",
        content: "Hello! I'm Reynard AI, your intelligent assistant. I can help with:\n\n- **Code generation**\n- **Documentation**\n- **Problem solving**\n- **Creative writing**\n\nHow can I assist you today?",
        roomId: "ai-assistants",
        sender: { id: "reynard-ai", name: "Reynard AI", avatar: getIcon("brain"), status: "online" },
        timestamp: Date.now() - 120000,
        deliveryStatus: "read",
      },
    ],
    "direct-alice": [
      {
        id: "5",
        role: "user",
        content: "Hi! Can you help me with the streaming text implementation?",
        roomId: "direct-alice",
        sender: { id: "alice", name: "Alice", avatar: getIcon("user"), status: "online" },
        timestamp: Date.now() - 60000,
        deliveryStatus: "read",
      },
      {
        id: "6",
        role: "user",
        content: "Sure! I'd be happy to help. What specific part are you working on?",
        roomId: "direct-alice",
        sender: currentUser(),
        timestamp: Date.now() - 30000,
        deliveryStatus: "read",
      },
    ],
  });

  const [activeRoom, setActiveRoom] = createSignal<string>("general");
  const [isTyping, setIsTyping] = createSignal(false);
  const [typingUsers, setTypingUsers] = createSignal<MockUser[]>([]);

  // Mock WebSocket connection
  let mockWebSocket: any = null;
  let typingTimer: number | null = null;

  const connect = () => {
    setIsConnected(true);
    
    // Simulate WebSocket connection
    mockWebSocket = {
      send: (data: string) => {
        const message = JSON.parse(data);
        handleMockMessage(message);
      },
      close: () => {
        setIsConnected(false);
        mockWebSocket = null;
      },
    };

    // Simulate receiving messages
    setTimeout(() => {
      addMockMessage("general", {
        id: "7",
        role: "user",
        content: "Welcome to the demo! This is a **P2P chat** simulation.",
        roomId: "general",
        sender: { id: "system", name: "System", avatar: getIcon("settings"), status: "online" },
        timestamp: Date.now(),
        deliveryStatus: "sent",
      });
    }, 1000);
  };

  const disconnect = () => {
    if (mockWebSocket) {
      mockWebSocket.close();
    }
  };

  const handleMockMessage = (message: any) => {
    switch (message.type) {
      case "join_room":
        setActiveRoom(message.roomId);
        break;
      case "typing_start":
        if (message.roomId === activeRoom()) {
          const user = mockRooms()
            .find(r => r.id === message.roomId)
            ?.participants.find(p => p.id !== currentUser().id);
          if (user) {
            setTypingUsers(prev => [...prev.filter(u => u.id !== user.id), user]);
          }
        }
        break;
      case "typing_stop":
        if (message.roomId === activeRoom()) {
          setTypingUsers(prev => prev.filter(u => u.id !== message.userId));
        }
        break;
    }
  };

  const addMockMessage = (roomId: string, message: MockMessage) => {
    setMockMessages(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), message],
    }));

    // Update room's last message
    setMockRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, lastMessage: { content: message.content, timestamp: message.timestamp, sender: message.sender } }
        : room
    ));
  };

  const sendMessage = async (content: string) => {
    if (!isConnected()) return;

    const newMessage: MockMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      roomId: activeRoom(),
      sender: currentUser(),
      timestamp: Date.now(),
      deliveryStatus: "sent",
    };

    addMockMessage(activeRoom(), newMessage);

    // Simulate AI response in AI assistants room
    if (activeRoom() === "ai-assistants") {
      setTimeout(() => {
        const aiResponse: MockMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: `I understand you said: "${content}". This is a mock AI response demonstrating the P2P chat system with AI integration.`,
          roomId: activeRoom(),
          sender: { id: "reynard-ai", name: "Reynard AI", avatar: getIcon("brain"), status: "online" },
          timestamp: Date.now(),
          deliveryStatus: "sent",
        };
        addMockMessage(activeRoom(), aiResponse);
      }, 1000);
    }
  };

  const startTyping = () => {
    if (!isTyping()) {
      setIsTyping(true);
      if (mockWebSocket) {
        mockWebSocket.send(JSON.stringify({
          type: "typing_start",
          roomId: activeRoom(),
        }));
      }

      // Auto-stop typing after 3 seconds
      typingTimer = window.setTimeout(() => {
        stopTyping();
      }, 3000);
    }
  };

  const stopTyping = () => {
    if (isTyping()) {
      setIsTyping(false);
      if (mockWebSocket) {
        mockWebSocket.send(JSON.stringify({
          type: "typing_stop",
          roomId: activeRoom(),
        }));
      }
      if (typingTimer) {
        clearTimeout(typingTimer);
        typingTimer = null;
      }
    }
  };

  const switchRoom = (roomId: string) => {
    setActiveRoom(roomId);
    if (mockWebSocket) {
      mockWebSocket.send(JSON.stringify({
        type: "join_room",
        roomId,
      }));
    }
  };

  onCleanup(() => {
    if (typingTimer) {
      clearTimeout(typingTimer);
    }
    if (mockWebSocket) {
      mockWebSocket.close();
    }
  });

  return (
    <div class="p2p-chat-demo">
      <Card class="demo-section">
        <h3>P2P Chat System</h3>
        <p>Demonstrates peer-to-peer messaging with room management, user lists, and AI assistant integration.</p>
        
        <div class="p2p-controls">
          <Button 
            variant={isConnected() ? "danger" : "success"}
            onClick={isConnected() ? disconnect : connect}
          >
            {isConnected() ? "Disconnect" : "Connect to Demo"}
          </Button>
          <span class="connection-status">
            Status: {isConnected() ? "🟢 Connected" : "🔴 Disconnected"}
          </span>
        </div>
      </Card>

      <Show when={isConnected()}>
        <div class="p2p-demo-container">
          {/* Room List */}
          <Card class="room-list">
            <h4>Rooms</h4>
            <div class="room-items">
              <For each={mockRooms()}>
                {(room) => (
                  <div 
                    class={`room-item ${activeRoom() === room.id ? "active" : ""}`}
                    onClick={() => switchRoom(room.id)}
                  >
                    <div class="room-info">
                      <div class="room-name">{room.name}</div>
                      <div class="room-participants">
                        {room.participants.length} participants
                      </div>
                    </div>
                    <Show when={room.unreadCount > 0}>
                      <div class="unread-badge">{room.unreadCount}</div>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          </Card>

          {/* Chat Area */}
          <Card class="chat-area">
            <div class="chat-header">
              <h4>{mockRooms().find(r => r.id === activeRoom())?.name}</h4>
              <div class="participant-count">
                {mockRooms().find(r => r.id === activeRoom())?.participants.length} participants
              </div>
            </div>

            <div class="messages-container">
              <For each={mockMessages()[activeRoom()] || []}>
                {(message) => (
                  <div class={`message ${message.sender.id === currentUser().id ? "own" : "other"}`}>
                    <div class="message-avatar">
                      {typeof message.sender.avatar === 'string' 
                        ? message.sender.avatar 
                        : message.sender.avatar 
                          ? <span innerHTML={message.sender.avatar.outerHTML}></span>
                          : message.sender.name.charAt(0)}
                    </div>
                    <div class="message-content">
                      <div class="message-header">
                        <span class="sender-name">{message.sender.name}</span>
                        <span class="message-time">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div class="message-text">
                        <MarkdownRenderer 
                          content={message.content}
                          streaming={false}
                          enableMath={false}
                          enableDiagrams={false}
                        />
                      </div>
                      <Show when={message.reactions && message.reactions.length > 0}>
                        <div class="message-reactions">
                          <For each={message.reactions}>
                            {(reaction) => (
                              <span class="reaction">
                                {reaction.emoji} {reaction.users.length}
                              </span>
                            )}
                          </For>
                        </div>
                      </Show>
                    </div>
                  </div>
                )}
              </For>

              {/* Typing Indicators */}
              <Show when={typingUsers().length > 0}>
                <div class="typing-indicator">
                  <div class="typing-avatars">
                    <For each={typingUsers()}>
                      {(user) => (
                        <div class="typing-avatar">
                          {typeof user.avatar === 'string' 
                            ? user.avatar 
                            : user.avatar 
                              ? <span innerHTML={user.avatar.outerHTML}></span>
                              : user.name.charAt(0)}
                        </div>
                      )}
                    </For>
                  </div>
                  <div class="typing-text">
                    {typingUsers().length === 1
                      ? `${typingUsers()[0].name} is typing...`
                      : `${typingUsers().length} people are typing...`}
                  </div>
                  <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </Show>
            </div>

            <div class="message-input-area">
              <div class="input-container">
                <input 
                  type="text" 
                  placeholder="Type a message..."
                  class="message-input"
                  onInput={(e) => {
                    const value = e.currentTarget.value;
                    if (value.trim()) {
                      startTyping();
                    } else {
                      stopTyping();
                    }
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      sendMessage(e.currentTarget.value);
                      e.currentTarget.value = "";
                      stopTyping();
                    }
                  }}
                />
                <Button 
                  onClick={() => {
                    const input = document.querySelector('.message-input') as HTMLInputElement;
                    if (input?.value.trim()) {
                      sendMessage(input.value);
                      input.value = "";
                      stopTyping();
                    }
                  }}
                >
                  Send
                </Button>
              </div>
            </div>
          </Card>

          {/* User List */}
          <Card class="user-list">
            <h4>Participants</h4>
            <div class="user-items">
              <For each={mockRooms().find(r => r.id === activeRoom())?.participants || []}>
                {(user) => (
                  <div class="user-item">
                    <div class="user-avatar">
                      {typeof user.avatar === 'string' 
                        ? user.avatar 
                        : user.avatar 
                          ? <span innerHTML={user.avatar.outerHTML}></span>
                          : user.name.charAt(0)}
                    </div>
                    <div class="user-info">
                      <div class="user-name">{user.name}</div>
                      <div class={`user-status ${user.status}`}>
                        {user.status === "online" ? "🟢" : 
                         user.status === "away" ? "🟡" : 
                         user.status === "busy" ? "🔴" : "⚪"} {user.status}
                      </div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Card>
        </div>
      </Show>
    </div>
  );
}
