/**
 * Peer-to-Peer Chat Types for User-to-User Messaging
 * 
 * Extends the base chat types to support direct messaging between users
 * while sharing core infrastructure with assistant chat.
 */

import type { 
  ChatMessage, 
  ChatState, 
  ChatActions, 
  StreamChunk, 
  ParseResult,
  Tool
} from '../types';

// User identity and presence
export interface ChatUser {
  /** Unique user identifier */
  id: string;
  /** Display name */
  name: string;
  /** Avatar URL or emoji */
  avatar?: string;
  /** Current online status */
  status: 'online' | 'away' | 'busy' | 'offline';
  /** Last seen timestamp */
  lastSeen?: number;
  /** User metadata */
  metadata?: {
    timezone?: string;
    language?: string;
    role?: string;
    customFields?: Record<string, any>;
  };
}

// Room/Channel management
export interface ChatRoom {
  /** Unique room identifier */
  id: string;
  /** Room name/title */
  name: string;
  /** Room type */
  type: 'direct' | 'group' | 'public' | 'private';
  /** Room description */
  description?: string;
  /** Room participants */
  participants: ChatUser[];
  /** Room metadata */
  metadata?: {
    createdAt: number;
    createdBy: string;
    topic?: string;
    settings?: RoomSettings;
  };
  /** Unread message count */
  unreadCount?: number;
  /** Last message preview */
  lastMessage?: ChatMessage;
  /** Whether current user is typing */
  isTyping?: boolean;
  /** Users currently typing */
  typingUsers?: ChatUser[];
}

export interface RoomSettings {
  /** Whether messages are encrypted */
  encrypted?: boolean;
  /** Message retention period (in days) */
  retentionDays?: number;
  /** Whether to allow file uploads */
  allowFileUploads?: boolean;
  /** Maximum file size (in bytes) */
  maxFileSize?: number;
  /** Whether to show read receipts */
  showReadReceipts?: boolean;
  /** Whether to allow reactions */
  allowReactions?: boolean;
  /** Custom room settings */
  custom?: Record<string, any>;
}

// Enhanced message types for P2P
export interface P2PChatMessage extends ChatMessage {
  /** Message sender (for group chats) */
  sender?: ChatUser;
  /** Message recipient (for direct messages) */
  recipient?: ChatUser;
  /** Room/channel ID */
  roomId: string;
  /** Message thread ID (for threaded conversations) */
  threadId?: string;
  /** Message reply to another message */
  replyTo?: string;
  /** Message reactions */
  reactions?: MessageReaction[];
  /** Message read receipts */
  readBy?: MessageReadReceipt[];
  /** Message attachments */
  attachments?: MessageAttachment[];
  /** Message priority */
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  /** Whether message is pinned */
  isPinned?: boolean;
  /** Message edit history */
  editHistory?: MessageEdit[];
  /** Message delivery status */
  deliveryStatus?: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface MessageReaction {
  /** Reaction emoji */
  emoji: string;
  /** Users who reacted */
  users: ChatUser[];
  /** Reaction count */
  count: number;
}

export interface MessageReadReceipt {
  /** User who read the message */
  user: ChatUser;
  /** Read timestamp */
  readAt: number;
}

export interface MessageAttachment {
  /** Attachment ID */
  id: string;
  /** File name */
  name: string;
  /** File type/MIME type */
  type: string;
  /** File size in bytes */
  size: number;
  /** Download URL */
  url: string;
  /** Thumbnail URL (for images/videos) */
  thumbnailUrl?: string;
  /** Upload progress (0-100) */
  uploadProgress?: number;
  /** Upload status */
  uploadStatus?: 'uploading' | 'completed' | 'failed';
}

export interface MessageEdit {
  /** Edit timestamp */
  editedAt: number;
  /** Previous content */
  previousContent: string;
  /** Edit reason */
  reason?: string;
}

// Typing indicators
export interface TypingIndicator {
  /** Room ID */
  roomId: string;
  /** User who is typing */
  user: ChatUser;
  /** Typing started timestamp */
  startedAt: number;
  /** Typing timeout (auto-clear after this time) */
  timeout?: number;
}

// Real-time events
export type P2PChatEvent = 
  | UserJoinedEvent
  | UserLeftEvent
  | UserStatusChangedEvent
  | MessageSentEvent
  | MessageEditedEvent
  | MessageDeletedEvent
  | MessageReactionEvent
  | TypingStartEvent
  | TypingStopEvent
  | RoomCreatedEvent
  | RoomUpdatedEvent
  | ReadReceiptEvent;

export interface UserJoinedEvent {
  type: 'user_joined';
  roomId: string;
  user: ChatUser;
  timestamp: number;
}

export interface UserLeftEvent {
  type: 'user_left';
  roomId: string;
  user: ChatUser;
  timestamp: number;
}

export interface UserStatusChangedEvent {
  type: 'user_status_changed';
  user: ChatUser;
  previousStatus: ChatUser['status'];
  timestamp: number;
}

export interface MessageSentEvent {
  type: 'message_sent';
  message: P2PChatMessage;
  timestamp: number;
}

export interface MessageEditedEvent {
  type: 'message_edited';
  message: P2PChatMessage;
  previousContent: string;
  timestamp: number;
}

export interface MessageDeletedEvent {
  type: 'message_deleted';
  messageId: string;
  roomId: string;
  deletedBy: ChatUser;
  timestamp: number;
}

export interface MessageReactionEvent {
  type: 'message_reaction';
  messageId: string;
  roomId: string;
  reaction: MessageReaction;
  user: ChatUser;
  action: 'added' | 'removed';
  timestamp: number;
}

export interface TypingStartEvent {
  type: 'typing_start';
  roomId: string;
  user: ChatUser;
  timestamp: number;
}

export interface TypingStopEvent {
  type: 'typing_stop';
  roomId: string;
  user: ChatUser;
  timestamp: number;
}

export interface RoomCreatedEvent {
  type: 'room_created';
  room: ChatRoom;
  createdBy: ChatUser;
  timestamp: number;
}

export interface RoomUpdatedEvent {
  type: 'room_updated';
  room: ChatRoom;
  updatedBy: ChatUser;
  changes: Partial<ChatRoom>;
  timestamp: number;
}

export interface ReadReceiptEvent {
  type: 'read_receipt';
  messageId: string;
  roomId: string;
  user: ChatUser;
  timestamp: number;
}

// P2P Chat State extending base ChatState
export interface P2PChatState extends Omit<ChatState, 'messages'> {
  /** Current user */
  currentUser?: ChatUser;
  /** Available rooms/channels */
  rooms: ChatRoom[];
  /** Currently active room */
  activeRoom?: ChatRoom;
  /** Messages by room ID */
  messagesByRoom: Record<string, P2PChatMessage[]>;
  /** Online users */
  onlineUsers: ChatUser[];
  /** Typing indicators by room ID */
  typingIndicators: Record<string, TypingIndicator[]>;
  /** Connection to P2P service */
  p2pConnection: {
    status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
    lastConnected?: number;
    reconnectAttempts: number;
    protocol?: 'websocket' | 'webrtc' | 'sse';
  };
  /** File upload state */
  uploads: Record<string, MessageAttachment>;
}

// P2P Chat Actions extending base ChatActions
export interface P2PChatActions extends ChatActions {
  // Room management
  /** Create a new room */
  createRoom: (name: string, type: ChatRoom['type'], participants?: ChatUser[]) => Promise<ChatRoom>;
  /** Join an existing room */
  joinRoom: (roomId: string) => Promise<void>;
  /** Leave a room */
  leaveRoom: (roomId: string) => Promise<void>;
  /** Update room settings */
  updateRoom: (roomId: string, updates: Partial<ChatRoom>) => Promise<void>;
  /** Get room messages */
  getRoomMessages: (roomId: string, limit?: number, before?: string) => Promise<P2PChatMessage[]>;
  /** Switch to a different room */
  switchRoom: (roomId: string) => void;

  // Message management
  /** Send message to specific room */
  sendMessageToRoom: (roomId: string, content: string, options?: {
    replyTo?: string;
    threadId?: string;
    priority?: P2PChatMessage['priority'];
  }) => Promise<void>;
  /** Edit a message */
  editMessage: (messageId: string, newContent: string, reason?: string) => Promise<void>;
  /** Delete a message */
  deleteMessage: (messageId: string) => Promise<void>;
  /** React to a message */
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  /** Mark message as read */
  markMessageAsRead: (messageId: string) => Promise<void>;
  /** Pin/unpin a message */
  pinMessage: (messageId: string, pin: boolean) => Promise<void>;

  // Typing indicators
  /** Start typing indicator */
  startTyping: (roomId: string) => void;
  /** Stop typing indicator */
  stopTyping: (roomId: string) => void;

  // User management
  /** Update user status via WebSocket */
  updateUserStatusViaWebSocket: (status: ChatUser['status']) => Promise<void>;
  /** Get user profile */
  getUserProfile: (userId: string) => Promise<ChatUser>;
  /** Block/unblock user */
  blockUser: (userId: string, block: boolean) => Promise<void>;
  /** Invite user to room */
  inviteUser: (roomId: string, userId: string) => Promise<void>;

  // File handling
  /** Upload file */
  uploadFile: (file: File, roomId: string, messageId?: string) => Promise<MessageAttachment>;
  /** Download file */
  downloadFile: (attachmentId: string) => Promise<Blob>;

  // Search and history
  /** Search messages */
  searchMessages: (query: string, roomId?: string) => Promise<P2PChatMessage[]>;
  /** Get message history */
  getMessageHistory: (roomId: string, options?: {
    before?: number;
    after?: number;
    limit?: number;
  }) => Promise<P2PChatMessage[]>;

  // Presence and notifications
  /** Set user presence */
  setPresence: (status: ChatUser['status'], message?: string) => Promise<void>;
  /** Get room presence */
  getRoomPresence: (roomId: string) => Promise<ChatUser[]>;
  /** Configure notifications */
  configureNotifications: (settings: {
    enabled: boolean;
    mentions: boolean;
    directMessages: boolean;
    sounds: boolean;
  }) => Promise<void>;
}

// Combined P2P Chat composable return type
export interface UseP2PChatReturn {
  /** Current conversation messages for active room */
  messages: () => P2PChatMessage[];
  /** Currently streaming message (if any) */
  currentMessage: () => P2PChatMessage | undefined;
  /** Whether the chat is currently streaming */
  isStreaming: () => boolean;
  /** Whether the assistant is currently thinking */
  isThinking: () => boolean;
  /** Available models for selection */
  availableModels: () => string[];
  /** Currently selected model */
  selectedModel: () => string | undefined;
  /** Available tools */
  availableTools: () => Tool[];
  /** Connection state */
  connectionState: () => 'disconnected' | 'connecting' | 'connected' | 'error';
  /** Current error (if any) */
  error: () => {
    type: string;
    message: string;
    timestamp: number;
    recoverable: boolean;
  } | undefined;
  /** Chat configuration */
  config: () => {
    enableThinking: boolean;
    enableTools: boolean;
    autoScroll: boolean;
    showTimestamps: boolean;
    showTokenCounts: boolean;
    maxHistoryLength: number;
  };
  
  // P2P-specific state
  /** Current user */
  currentUser: () => ChatUser;
  /** Available rooms/channels */
  rooms: () => ChatRoom[];
  /** Currently active room */
  activeRoom: () => ChatRoom | undefined;
  /** Messages by room ID */
  messagesByRoom: () => Record<string, P2PChatMessage[]>;
  /** Online users */
  onlineUsers: () => ChatUser[];
  /** Typing indicators by room ID */
  typingIndicators: () => Record<string, TypingIndicator[]>;
  /** Connection to P2P service */
  p2pConnection: () => {
    status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
    lastConnected?: number;
    reconnectAttempts: number;
    protocol?: 'websocket' | 'webrtc' | 'sse';
  };
  /** File upload state */
  uploads: () => Record<string, MessageAttachment>;
  
  /** Actions for controlling the chat */
  actions: P2PChatActions;
}

// P2P Chat component props
export interface P2PChatContainerProps {
  /** Current user */
  currentUser: ChatUser;
  /** WebSocket/SSE endpoint for real-time communication */
  realtimeEndpoint: string;
  /** REST API endpoint */
  apiEndpoint?: string;
  /** Authentication headers */
  authHeaders?: Record<string, string>;
  /** Initial room to join */
  initialRoomId?: string;
  /** Available rooms */
  initialRooms?: ChatRoom[];
  /** Chat configuration */
  config?: {
    enableFileUploads?: boolean;
    enableReactions?: boolean;
    enableTypingIndicators?: boolean;
    enableReadReceipts?: boolean;
    enableThreads?: boolean;
    maxFileSize?: number;
    allowedFileTypes?: string[];
    messageRetention?: number;
  };
  /** UI customization */
  ui?: {
    showUserList?: boolean;
    showRoomList?: boolean;
    compact?: boolean;
    theme?: 'light' | 'dark' | 'auto';
  };
  /** Event callbacks */
  onRoomJoined?: (room: ChatRoom) => void;
  onRoomLeft?: (room: ChatRoom) => void;
  onMessageReceived?: (message: P2PChatMessage) => void;
  onUserStatusChanged?: (user: ChatUser) => void;
  onError?: (error: any) => void;
}

export interface P2PMessageProps {
  /** Message to display */
  message: P2PChatMessage;
  /** Current user for context */
  currentUser: ChatUser;
  /** Whether to show sender info */
  showSender?: boolean;
  /** Whether to show avatar */
  showAvatar?: boolean;
  /** Whether to show timestamp */
  showTimestamp?: boolean;
  /** Whether to show reactions */
  showReactions?: boolean;
  /** Whether to show read receipts */
  showReadReceipts?: boolean;
  /** Message actions callback */
  onMessageAction?: (action: string, message: P2PChatMessage) => void;
  /** Reaction callback */
  onReaction?: (emoji: string) => void;
}

export interface RoomListProps {
  /** Available rooms */
  rooms: ChatRoom[];
  /** Currently active room */
  activeRoom?: ChatRoom;
  /** Current user */
  currentUser: ChatUser;
  /** Room selection callback */
  onRoomSelect?: (room: ChatRoom) => void;
  /** Room creation callback */
  onCreateRoom?: () => void;
  /** Room search query */
  searchQuery?: string;
  /** Search callback */
  onSearch?: (query: string) => void;
  /** Compact display mode */
  compact?: boolean;
}

export interface UserListProps {
  /** Users to display */
  users: ChatUser[];
  /** Current user */
  currentUser: ChatUser;
  /** User selection callback */
  onUserSelect?: (user: ChatUser) => void;
  /** Show status indicators */
  showStatus?: boolean;
  /** Show user actions */
  showActions?: boolean;
  /** Compact display mode */
  compact?: boolean;
}
