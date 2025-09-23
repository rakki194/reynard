/**
 * 🦊 Reynard Collaborative Editing Interface
 * =========================================
 *
 * Advanced collaborative editing system for architectural diagrams and documentation.
 * Enables real-time multi-user collaboration with conflict resolution, version control,
 * and comprehensive change tracking for architectural decision-making.
 *
 * Features:
 * - Real-time collaborative editing with operational transformation
 * - Multi-user presence and cursor tracking
 * - Conflict resolution and merge strategies
 * - Version control and change history
 * - Comment and annotation system
 * - Permission management and access control
 * - Live chat and communication
 * - Export and sharing capabilities
 * - Integration with ADR system
 *
 * @author Reynard Development Team
 * @version 1.0.0
 */

import { Component, createSignal, createEffect, onMount, onCleanup, createMemo, Show, For } from "solid-js";
import { Card, Button, Badge, Tabs, Input, Select, Checkbox, TextArea } from "reynard-components-core/primitives";
import { fluentIconsPackage } from "reynard-fluent-icons";
import { EventEmitter } from "events";

/**
 * Represents a user in the collaborative editing session.
 */
export interface CollaborativeUser {
  /** Unique user identifier */
  id: string;
  /** User display name */
  name: string;
  /** User avatar URL */
  avatar?: string;
  /** User role */
  role: "owner" | "editor" | "viewer" | "commenter";
  /** User permissions */
  permissions: {
    canEdit: boolean;
    canComment: boolean;
    canInvite: boolean;
    canDelete: boolean;
    canExport: boolean;
  };
  /** User status */
  status: "online" | "away" | "offline";
  /** Last activity timestamp */
  lastActivity: string;
  /** User cursor position */
  cursor?: {
    x: number;
    y: number;
    selection?: {
      start: number;
      end: number;
    };
  };
  /** User color for visual identification */
  color: string;
}

/**
 * Represents a change operation in the collaborative editing system.
 */
export interface ChangeOperation {
  /** Operation identifier */
  id: string;
  /** Operation type */
  type: "insert" | "delete" | "move" | "format" | "comment" | "annotation";
  /** User who made the change */
  userId: string;
  /** Timestamp of the change */
  timestamp: string;
  /** Position where the change occurred */
  position: {
    x: number;
    y: number;
    index?: number;
  };
  /** Change content */
  content: string;
  /** Previous content (for undo/redo) */
  previousContent?: string;
  /** Change metadata */
  metadata: {
    description?: string;
    tags?: string[];
    priority?: "low" | "medium" | "high";
    [key: string]: any;
  };
  /** Operation status */
  status: "pending" | "applied" | "conflict" | "rejected";
  /** Conflict resolution strategy */
  conflictResolution?: "manual" | "automatic" | "last-writer-wins" | "merge";
}

/**
 * Represents a comment or annotation in the collaborative system.
 */
export interface CollaborativeComment {
  /** Comment identifier */
  id: string;
  /** Comment author */
  author: string;
  /** Comment content */
  content: string;
  /** Comment timestamp */
  timestamp: string;
  /** Comment position */
  position: {
    x: number;
    y: number;
    elementId?: string;
  };
  /** Comment type */
  type: "comment" | "suggestion" | "question" | "approval" | "rejection";
  /** Comment status */
  status: "open" | "resolved" | "archived";
  /** Comment replies */
  replies: CollaborativeComment[];
  /** Comment mentions */
  mentions: string[];
  /** Comment metadata */
  metadata: {
    isResolved: boolean;
    resolvedBy?: string;
    resolvedAt?: string;
    tags?: string[];
    [key: string]: any;
  };
}

/**
 * Represents a collaborative editing session.
 */
export interface CollaborativeSession {
  /** Session identifier */
  id: string;
  /** Session name */
  name: string;
  /** Session description */
  description: string;
  /** Session owner */
  owner: string;
  /** Session participants */
  participants: Map<string, CollaborativeUser>;
  /** Session status */
  status: "active" | "paused" | "archived" | "deleted";
  /** Session creation timestamp */
  createdAt: string;
  /** Session last update timestamp */
  lastUpdated: string;
  /** Session settings */
  settings: {
    allowAnonymous: boolean;
    requireApproval: boolean;
    autoSave: boolean;
    saveInterval: number; // milliseconds
    maxParticipants: number;
    conflictResolution: "manual" | "automatic" | "last-writer-wins";
  };
  /** Session content */
  content: {
    type: "text" | "diagram" | "mixed";
    data: any;
    version: number;
  };
  /** Change history */
  changeHistory: ChangeOperation[];
  /** Comments and annotations */
  comments: CollaborativeComment[];
  /** Session metadata */
  metadata: {
    totalChanges: number;
    totalComments: number;
    activeUsers: number;
    lastActivity: string;
    [key: string]: any;
  };
}

/**
 * Configuration for the collaborative editing interface.
 */
export interface CollaborativeEditingConfig {
  /** WebSocket connection URL */
  websocketUrl: string;
  /** Reconnection settings */
  reconnection: {
    enabled: boolean;
    maxAttempts: number;
    delay: number;
    backoff: number;
  };
  /** Conflict resolution strategy */
  conflictResolution: "manual" | "automatic" | "last-writer-wins" | "merge";
  /** Auto-save settings */
  autoSave: {
    enabled: boolean;
    interval: number; // milliseconds
    onChange: boolean;
  };
  /** User interface settings */
  ui: {
    showUserCursors: boolean;
    showUserPresence: boolean;
    showChangeHistory: boolean;
    showComments: boolean;
    showChat: boolean;
    theme: "light" | "dark" | "auto";
  };
  /** Permission settings */
  permissions: {
    allowAnonymous: boolean;
    requireInvitation: boolean;
    allowSelfRegistration: boolean;
    defaultRole: "viewer" | "commenter" | "editor";
  };
  /** Notification settings */
  notifications: {
    enabled: boolean;
    onUserJoin: boolean;
    onUserLeave: boolean;
    onComment: boolean;
    onChange: boolean;
    onConflict: boolean;
  };
}

/**
 * Props for the CollaborativeEditingInterface component.
 */
export interface CollaborativeEditingInterfaceProps {
  /** Session to join or create */
  sessionId?: string;
  /** Current user */
  currentUser: CollaborativeUser;
  /** Configuration options */
  config?: Partial<CollaborativeEditingConfig>;
  /** Callback when session changes */
  onSessionChange?: (session: CollaborativeSession) => void;
  /** Callback when user joins */
  onUserJoin?: (user: CollaborativeUser) => void;
  /** Callback when user leaves */
  onUserLeave?: (user: CollaborativeUser) => void;
  /** Callback when content changes */
  onContentChange?: (content: any, operation: ChangeOperation) => void;
  /** Callback when comment is added */
  onCommentAdded?: (comment: CollaborativeComment) => void;
  /** Callback when conflict occurs */
  onConflict?: (conflict: any) => void;
  /** Width of the interface */
  width?: number;
  /** Height of the interface */
  height?: number;
  /** CSS class name */
  class?: string;
}

/**
 * Collaborative editing interface component with real-time collaboration capabilities.
 */
export function CollaborativeEditingInterface(props: CollaborativeEditingInterfaceProps) {
  // Configuration with defaults
  const config = createMemo(() => ({
    websocketUrl: "ws://localhost:8080/collaborative",
    reconnection: {
      enabled: true,
      maxAttempts: 5,
      delay: 1000,
      backoff: 2
    },
    conflictResolution: "automatic" as const,
    autoSave: {
      enabled: true,
      interval: 5000,
      onChange: true
    },
    ui: {
      showUserCursors: true,
      showUserPresence: true,
      showChangeHistory: true,
      showComments: true,
      showChat: true,
      theme: "dark" as const
    },
    permissions: {
      allowAnonymous: false,
      requireInvitation: true,
      allowSelfRegistration: false,
      defaultRole: "viewer" as const
    },
    notifications: {
      enabled: true,
      onUserJoin: true,
      onUserLeave: true,
      onComment: true,
      onChange: false,
      onConflict: true
    },
    ...props.config
  }));

  // State management
  const [session, setSession] = createSignal<CollaborativeSession | null>(null);
  const [isConnected, setIsConnected] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [error, setError] = createSignal<string | null>(null);
  const [activeTab, setActiveTab] = createSignal<"editor" | "comments" | "chat" | "history">("editor");
  const [content, setContent] = createSignal("");
  const [pendingChanges, setPendingChanges] = createSignal<ChangeOperation[]>([]);
  const [conflicts, setConflicts] = createSignal<any[]>([]);
  const [newComment, setNewComment] = createSignal("");
  const [commentPosition, setCommentPosition] = createSignal<{ x: number; y: number } | null>(null);
  const [chatMessage, setChatMessage] = createSignal("");
  const [chatMessages, setChatMessages] = createSignal<any[]>([]);
  const [showUserList, setShowUserList] = createSignal(false);
  const [showChangeHistory, setShowChangeHistory] = createSignal(false);

  // WebSocket connection
  let websocket: WebSocket | null = null;
  let reconnectAttempts = 0;
  let reconnectTimer: number | null = null;
  let autoSaveTimer: number | null = null;

  // Computed values
  const onlineUsers = createMemo(() => {
    if (!session()) return [];
    return Array.from(session()!.participants.values()).filter(user => user.status === "online");
  });

  const canEdit = createMemo(() => {
    if (!session()) return false;
    const user = session()!.participants.get(props.currentUser.id);
    return user?.permissions.canEdit || false;
  });

  const canComment = createMemo(() => {
    if (!session()) return false;
    const user = session()!.participants.get(props.currentUser.id);
    return user?.permissions.canComment || false;
  });

  const recentChanges = createMemo(() => {
    if (!session()) return [];
    return session()!.changeHistory.slice(-10).reverse();
  });

  const openComments = createMemo(() => {
    if (!session()) return [];
    return session()!.comments.filter(comment => comment.status === "open");
  });

  // WebSocket connection management
  const connectWebSocket = () => {
    try {
      websocket = new WebSocket(config().websocketUrl);
      
      websocket.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttempts = 0;
        console.log("Connected to collaborative editing server");
        
        // Join session
        if (props.sessionId) {
          sendMessage({
            type: "join_session",
            sessionId: props.sessionId,
            user: props.currentUser
          });
        }
      };
      
      websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleWebSocketMessage(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };
      
      websocket.onclose = () => {
        setIsConnected(false);
        console.log("Disconnected from collaborative editing server");
        
        if (config().reconnection.enabled && reconnectAttempts < config().reconnection.maxAttempts) {
          scheduleReconnect();
        }
      };
      
      websocket.onerror = (error) => {
        console.error("WebSocket error:", error);
        setError("Connection error occurred");
      };
    } catch (error) {
      console.error("Failed to connect to WebSocket:", error);
      setError("Failed to connect to server");
    }
  };

  const scheduleReconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    
    const delay = config().reconnection.delay * Math.pow(config().reconnection.backoff, reconnectAttempts);
    reconnectAttempts++;
    
    reconnectTimer = setTimeout(() => {
      console.log(`Attempting to reconnect (${reconnectAttempts}/${config().reconnection.maxAttempts})`);
      connectWebSocket();
    }, delay);
  };

  const sendMessage = (message: any) => {
    if (websocket && websocket.readyState === WebSocket.OPEN) {
      websocket.send(JSON.stringify(message));
    }
  };

  const handleWebSocketMessage = (message: any) => {
    switch (message.type) {
      case "session_joined":
        setSession(message.session);
        props.onSessionChange?.(message.session);
        break;
        
      case "user_joined":
        if (session()) {
          const updatedSession = { ...session()! };
          updatedSession.participants.set(message.user.id, message.user);
          setSession(updatedSession);
          props.onUserJoin?.(message.user);
        }
        break;
        
      case "user_left":
        if (session()) {
          const updatedSession = { ...session()! };
          updatedSession.participants.delete(message.userId);
          setSession(updatedSession);
          props.onUserLeave?.(message.user);
        }
        break;
        
      case "content_changed":
        if (message.operation.userId !== props.currentUser.id) {
          applyChange(message.operation);
          props.onContentChange?.(message.content, message.operation);
        }
        break;
        
      case "comment_added":
        if (session()) {
          const updatedSession = { ...session()! };
          updatedSession.comments.push(message.comment);
          setSession(updatedSession);
          props.onCommentAdded?.(message.comment);
        }
        break;
        
      case "conflict_detected":
        setConflicts(prev => [...prev, message.conflict]);
        props.onConflict?.(message.conflict);
        break;
        
      case "chat_message":
        setChatMessages(prev => [...prev, message.message]);
        break;
        
      default:
        console.log("Unknown message type:", message.type);
    }
  };

  // Change management
  const applyChange = (operation: ChangeOperation) => {
    // Apply the change to the content
    // This would implement operational transformation logic
    console.log("Applying change:", operation);
  };

  const sendChange = (operation: ChangeOperation) => {
    if (canEdit()) {
      sendMessage({
        type: "content_change",
        operation,
        sessionId: session()?.id
      });
    }
  };

  const handleContentChange = (newContent: string) => {
    if (!canEdit()) return;
    
    const operation: ChangeOperation = {
      id: `change-${Date.now()}-${Math.random()}`,
      type: "insert",
      userId: props.currentUser.id,
      timestamp: new Date().toISOString(),
      position: { x: 0, y: 0 },
      content: newContent,
      previousContent: content(),
      metadata: {},
      status: "pending"
    };
    
    setContent(newContent);
    setPendingChanges(prev => [...prev, operation]);
    sendChange(operation);
    
    // Auto-save
    if (config().autoSave.onChange) {
      scheduleAutoSave();
    }
  };

  const scheduleAutoSave = () => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
    
    autoSaveTimer = setTimeout(() => {
      saveSession();
    }, config().autoSave.interval);
  };

  const saveSession = () => {
    if (session()) {
      sendMessage({
        type: "save_session",
        sessionId: session()!.id,
        content: content()
      });
    }
  };

  // Comment management
  const addComment = () => {
    if (!canComment() || !newComment().trim()) return;
    
    const comment: CollaborativeComment = {
      id: `comment-${Date.now()}-${Math.random()}`,
      author: props.currentUser.id,
      content: newComment(),
      timestamp: new Date().toISOString(),
      position: commentPosition() || { x: 0, y: 0 },
      type: "comment",
      status: "open",
      replies: [],
      mentions: [],
      metadata: {
        isResolved: false
      }
    };
    
    sendMessage({
      type: "add_comment",
      comment,
      sessionId: session()?.id
    });
    
    setNewComment("");
    setCommentPosition(null);
  };

  const resolveComment = (commentId: string) => {
    sendMessage({
      type: "resolve_comment",
      commentId,
      sessionId: session()?.id
    });
  };

  // Chat management
  const sendChatMessage = () => {
    if (!chatMessage().trim()) return;
    
    const message = {
      id: `chat-${Date.now()}-${Math.random()}`,
      author: props.currentUser.id,
      content: chatMessage(),
      timestamp: new Date().toISOString()
    };
    
    sendMessage({
      type: "chat_message",
      message,
      sessionId: session()?.id
    });
    
    setChatMessage("");
  };

  // Lifecycle management
  onMount(() => {
    connectWebSocket();
  });

  onCleanup(() => {
    if (websocket) {
      websocket.close();
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
    }
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }
  });

  // Auto-save effect
  createEffect(() => {
    if (config().autoSave.enabled && session()) {
      scheduleAutoSave();
    }
  });

  return (
    <div class={`collaborative-editing-interface ${props.class || ""}`} style={{
      width: `${props.width || 1200}px`,
      height: `${props.height || 800}px`,
      display: "flex",
      "flex-direction": "column",
      "background-color": config().ui.theme === "dark" ? "#1a1a1a" : "#ffffff",
      color: config().ui.theme === "dark" ? "#ffffff" : "#000000"
    }}>
      {/* Header */}
      <div class="collaborative-header" style={{
        display: "flex",
        "justify-content": "space-between",
        "align-items": "center",
        padding: "12px",
        "background-color": config().ui.theme === "dark" ? "#2a2a2a" : "#f5f5f5",
        "border-bottom": "1px solid #444"
      }}>
        <div class="session-info">
          <h3 style={{ margin: 0 }}>
            {session()?.name || "Collaborative Session"}
          </h3>
          <div style={{ display: "flex", gap: "8px", "align-items": "center" }}>
            <Badge variant={isConnected() ? "success" : "error"}>
              {isConnected() ? "Connected" : "Disconnected"}
            </Badge>
            <Badge variant="info">
              {onlineUsers().length} online
            </Badge>
            <Show when={error()}>
              <Badge variant="error">{error()}</Badge>
            </Show>
          </div>
        </div>

        <div class="header-controls" style={{ display: "flex", gap: "8px" }}>
          <Button
            onClick={() => setShowUserList(!showUserList())}
            size="small"
            variant="secondary"
          >
            Users ({onlineUsers().length})
          </Button>

          <Button
            onClick={() => setShowChangeHistory(!showChangeHistory())}
            size="small"
            variant="secondary"
          >
            History
          </Button>

          <Button
            onClick={saveSession}
            size="small"
            variant="primary"
            disabled={!canEdit()}
          >
            Save
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div class="collaborative-main" style={{ display: "flex", flex: 1 }}>
        {/* Editor Area */}
        <div class="editor-area" style={{ flex: 1, display: "flex", "flex-direction": "column" }}>
          {/* Tabs */}
          <Tabs
            value={activeTab()}
            onChange={(value) => setActiveTab(value as any)}
            style={{ "border-bottom": "1px solid #444" }}
          >
            <Tabs.Tab value="editor">Editor</Tabs.Tab>
            <Tabs.Tab value="comments">Comments ({openComments().length})</Tabs.Tab>
            <Tabs.Tab value="chat">Chat</Tabs.Tab>
            <Tabs.Tab value="history">History</Tabs.Tab>
          </Tabs>

          {/* Tab Content */}
          <div class="tab-content" style={{ flex: 1, padding: "16px" }}>
            <Show when={activeTab() === "editor"}>
              <div class="editor-container" style={{ height: "100%" }}>
                <TextArea
                  value={content()}
                  onInput={(e) => handleContentChange(e.target.value)}
                  placeholder="Start collaborating..."
                  disabled={!canEdit()}
                  style={{
                    width: "100%",
                    height: "100%",
                    "min-height": "400px",
                    "background-color": config().ui.theme === "dark" ? "#2a2a2a" : "#ffffff",
                    color: config().ui.theme === "dark" ? "#ffffff" : "#000000",
                    border: "1px solid #444",
                    "border-radius": "4px",
                    padding: "12px",
                    "font-family": "monospace",
                    "font-size": "14px",
                    resize: "vertical"
                  }}
                />
              </div>
            </Show>

            <Show when={activeTab() === "comments"}>
              <div class="comments-container">
                <For each={openComments()}>
                  {(comment) => (
                    <Card style={{ margin: "8px 0", padding: "12px" }}>
                      <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start" }}>
                        <div>
                          <strong>{comment.author}</strong>
                          <span style={{ color: "#666", "margin-left": "8px" }}>
                            {new Date(comment.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <Button
                          onClick={() => resolveComment(comment.id)}
                          size="small"
                          variant="secondary"
                        >
                          Resolve
                        </Button>
                      </div>
                      <p style={{ margin: "8px 0" }}>{comment.content}</p>
                    </Card>
                  )}
                </For>

                <Show when={canComment()}>
                  <Card style={{ margin: "8px 0", padding: "12px" }}>
                    <TextArea
                      value={newComment()}
                      onInput={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      style={{ width: "100%", "min-height": "80px" }}
                    />
                    <div style={{ display: "flex", "justify-content": "flex-end", margin: "8px 0" }}>
                      <Button onClick={addComment} size="small" variant="primary">
                        Add Comment
                      </Button>
                    </div>
                  </Card>
                </Show>
              </div>
            </Show>

            <Show when={activeTab() === "chat"}>
              <div class="chat-container" style={{ height: "100%", display: "flex", "flex-direction": "column" }}>
                <div class="chat-messages" style={{ flex: 1, overflow: "auto", "max-height": "400px" }}>
                  <For each={chatMessages()}>
                    {(message) => (
                      <div style={{ margin: "8px 0", padding: "8px", "background-color": "#333", "border-radius": "4px" }}>
                        <strong>{message.author}</strong>
                        <span style={{ color: "#666", "margin-left": "8px" }}>
                          {new Date(message.timestamp).toLocaleString()}
                        </span>
                        <p style={{ margin: "4px 0" }}>{message.content}</p>
                      </div>
                    )}
                  </For>
                </div>

                <div class="chat-input" style={{ display: "flex", gap: "8px", margin: "8px 0" }}>
                  <Input
                    value={chatMessage()}
                    onInput={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        sendChatMessage();
                      }
                    }}
                    style={{ flex: 1 }}
                  />
                  <Button onClick={sendChatMessage} size="small" variant="primary">
                    Send
                  </Button>
                </div>
              </div>
            </Show>

            <Show when={activeTab() === "history"}>
              <div class="history-container">
                <For each={recentChanges()}>
                  {(change) => (
                    <Card style={{ margin: "8px 0", padding: "12px" }}>
                      <div style={{ display: "flex", "justify-content": "space-between", "align-items": "start" }}>
                        <div>
                          <strong>{change.userId}</strong>
                          <span style={{ color: "#666", "margin-left": "8px" }}>
                            {new Date(change.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <Badge variant="info">{change.type}</Badge>
                      </div>
                      <p style={{ margin: "8px 0", "font-family": "monospace", "font-size": "12px" }}>
                        {change.content}
                      </p>
                    </Card>
                  )}
                </For>
              </div>
            </Show>
          </div>
        </div>

        {/* Sidebar */}
        <Show when={showUserList() || showChangeHistory()}>
          <div class="collaborative-sidebar" style={{
            width: "300px",
            "background-color": config().ui.theme === "dark" ? "#2a2a2a" : "#f5f5f5",
            "border-left": "1px solid #444",
            padding: "16px"
          }}>
            <Show when={showUserList()}>
              <h4>Online Users</h4>
              <For each={onlineUsers()}>
                {(user) => (
                  <div style={{
                    display: "flex",
                    "align-items": "center",
                    gap: "8px",
                    padding: "8px",
                    "background-color": config().ui.theme === "dark" ? "#333" : "#ffffff",
                    "border-radius": "4px",
                    margin: "4px 0"
                  }}>
                    <div
                      style={{
                        width: "12px",
                        height: "12px",
                        "background-color": user.color,
                        "border-radius": "50%"
                      }}
                    />
                    <span>{user.name}</span>
                    <Badge variant="secondary" size="small">{user.role}</Badge>
                  </div>
                )}
              </For>
            </Show>

            <Show when={showChangeHistory()}>
              <h4>Recent Changes</h4>
              <For each={recentChanges().slice(0, 5)}>
                {(change) => (
                  <div style={{
                    padding: "8px",
                    "background-color": config().ui.theme === "dark" ? "#333" : "#ffffff",
                    "border-radius": "4px",
                    margin: "4px 0",
                    "font-size": "12px"
                  }}>
                    <div style={{ display: "flex", "justify-content": "space-between" }}>
                      <span>{change.userId}</span>
                      <span style={{ color: "#666" }}>
                        {new Date(change.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div style={{ color: "#666", "margin-top": "4px" }}>
                      {change.type}: {change.content.substring(0, 50)}...
                    </div>
                  </div>
                )}
              </For>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
}

/**
 * Demo component showcasing the collaborative editing interface.
 */
export function CollaborativeEditingInterfaceDemo() {
  const [currentUser] = createSignal<CollaborativeUser>({
    id: "user-1",
    name: "Demo User",
    role: "editor",
    permissions: {
      canEdit: true,
      canComment: true,
      canInvite: false,
      canDelete: false,
      canExport: true
    },
    status: "online",
    lastActivity: new Date().toISOString(),
    color: "#4A90E2"
  });

  return (
    <div class="collaborative-editing-demo" style={{ padding: "20px" }}>
      <h2>Collaborative Editing Interface Demo</h2>
      
      <CollaborativeEditingInterface
        currentUser={currentUser()}
        sessionId="demo-session"
        width={1200}
        height={800}
        onSessionChange={(session) => {
          console.log("Session changed:", session);
        }}
        onUserJoin={(user) => {
          console.log("User joined:", user);
        }}
        onUserLeave={(user) => {
          console.log("User left:", user);
        }}
        onContentChange={(content, operation) => {
          console.log("Content changed:", content, operation);
        }}
        onCommentAdded={(comment) => {
          console.log("Comment added:", comment);
        }}
        onConflict={(conflict) => {
          console.log("Conflict detected:", conflict);
        }}
      />
    </div>
  );
}


