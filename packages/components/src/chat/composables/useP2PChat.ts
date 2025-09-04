/**
 * P2P Chat Composable for User-to-User Messaging
 * 
 * Extends the base useChat composable to support peer-to-peer communication
 * while sharing core infrastructure and markdown parsing capabilities.
 */

import { 
  createSignal, 
  createEffect, 
  createResource, 
  batch, 
  onCleanup,
  createMemo,
  onMount
} from 'solid-js';
import type { Accessor, Resource } from 'solid-js';
import { useChat } from './useChat';
import type { 
  ChatUser,
  ChatRoom,
  P2PChatMessage,
  P2PChatState,
  P2PChatActions,
  P2PChatEvent,
  TypingIndicator,
  MessageAttachment,
  UseP2PChatReturn
} from '../types/p2p';

export interface UseP2PChatOptions {
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
  /** Auto-connect on mount */
  autoConnect?: boolean;
  /** Custom fetch function */
  fetchFn?: typeof fetch;
  /** Reconnection options */
  reconnection?: {
    enabled: boolean;
    maxAttempts: number;
    delay: number;
    backoff: number;
  };
  /** P2P configuration */
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
}

const DEFAULT_P2P_CONFIG = {
  enableFileUploads: true,
  enableReactions: true,
  enableTypingIndicators: true,
  enableReadReceipts: true,
  enableThreads: true,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['image/*', 'text/*', 'application/pdf'],
  messageRetention: 30, // 30 days
};

const DEFAULT_RECONNECTION = {
  enabled: true,
  maxAttempts: 5,
  delay: 1000,
  backoff: 2,
};

export function useP2PChat(options: UseP2PChatOptions): UseP2PChatReturn {
  const {
    currentUser,
    realtimeEndpoint,
    apiEndpoint = '/api/chat',
    authHeaders = {},
    initialRoomId,
    initialRooms = [],
    autoConnect = true,
    fetchFn = fetch,
    reconnection = DEFAULT_RECONNECTION,
    config = DEFAULT_P2P_CONFIG,
  } = options;

  // Extend base chat functionality
  const baseChat = useChat({
    endpoint: apiEndpoint,
    authHeaders,
    autoConnect: false, // We'll handle connection manually
    fetchFn,
    reconnection,
  });

  // P2P-specific state
  const [rooms, setRooms] = createSignal<ChatRoom[]>(initialRooms);
  const [activeRoom, setActiveRoom] = createSignal<ChatRoom | undefined>();
  const [messagesByRoom, setMessagesByRoom] = createSignal<Record<string, P2PChatMessage[]>>({});
  const [onlineUsers, setOnlineUsers] = createSignal<ChatUser[]>([]);
  const [typingIndicators, setTypingIndicators] = createSignal<Record<string, TypingIndicator[]>>({});
  const [uploads, setUploads] = createSignal<Record<string, MessageAttachment>>({});

  // Connection state
  const [p2pConnection, setP2pConnection] = createSignal<{
    status: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
    lastConnected: number | undefined;
    reconnectAttempts: number;
    protocol: 'websocket' | 'webrtc' | 'sse';
  }>({
    status: 'disconnected',
    lastConnected: undefined,
    reconnectAttempts: 0,
    protocol: 'websocket',
  });

  // WebSocket connection
  const [websocket, setWebSocket] = createSignal<WebSocket | null>(null);
  const [reconnectTimer, setReconnectTimer] = createSignal<number | null>(null);

  // Typing timer management
  const typingTimers = new Map<string, number>();

  // Generate unique message ID
  const generateMessageId = (): string => {
    return `p2p-msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Generate unique attachment ID
  const generateAttachmentId = (): string => {
    return `attachment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Connect to WebSocket
  const connectWebSocket = async () => {
    if (websocket()?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      setP2pConnection(prev => ({ ...prev, status: 'connecting' }));

      const ws = new WebSocket(realtimeEndpoint);
      
      ws.onopen = () => {
        batch(() => {
          setWebSocket(ws);
          setP2pConnection({
            status: 'connected',
            lastConnected: Date.now(),
            reconnectAttempts: 0,
            protocol: 'websocket',
          });
        });

        // Send authentication
        ws.send(JSON.stringify({
          type: 'auth',
          token: authHeaders.Authorization,
          user: currentUser,
        }));

        // Join initial room if specified
        if (initialRoomId) {
          joinRoom(initialRoomId);
        }
      };

      ws.onmessage = (event) => {
        try {
          const data: P2PChatEvent = JSON.parse(event.data);
          handleRealtimeEvent(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setWebSocket(null);
        setP2pConnection(prev => ({ ...prev, status: 'disconnected' }));
        
        if (reconnection.enabled && p2pConnection().reconnectAttempts < reconnection.maxAttempts) {
          scheduleReconnect();
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setP2pConnection(prev => ({ ...prev, status: 'error' }));
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setP2pConnection(prev => ({ ...prev, status: 'error' }));
    }
  };

  // Schedule reconnection
  const scheduleReconnect = () => {
    const attempts = p2pConnection().reconnectAttempts;
    const delay = reconnection.delay * Math.pow(reconnection.backoff, attempts);
    
    setP2pConnection(prev => ({ 
      ...prev, 
      status: 'reconnecting',
      reconnectAttempts: attempts + 1 
    }));

    const timer = window.setTimeout(() => {
      connectWebSocket();
    }, delay);

    setReconnectTimer(timer);
  };

  // Handle real-time events
  const handleRealtimeEvent = (event: P2PChatEvent) => {
    switch (event.type) {
      case 'message_sent':
        addMessageToRoom(event.message.roomId, event.message);
        break;

      case 'message_edited':
        updateMessageInRoom(event.message.roomId, event.message);
        break;

      case 'message_deleted':
        removeMessageFromRoom(event.roomId, event.messageId);
        break;

      case 'message_reaction':
        updateMessageReaction(event.roomId, event.messageId, event.reaction, event.action);
        break;

      case 'typing_start':
        addTypingIndicator(event.roomId, event.user);
        break;

      case 'typing_stop':
        removeTypingIndicator(event.roomId, event.user.id);
        break;

      case 'user_joined':
        addUserToRoom(event.roomId, event.user);
        break;

      case 'user_left':
        removeUserFromRoom(event.roomId, event.user.id);
        break;

      case 'user_status_changed':
        updateUserStatus(event.user);
        break;

      case 'room_created':
        addRoom(event.room);
        break;

      case 'room_updated':
        updateRoom(event.room);
        break;

      case 'read_receipt':
        updateMessageReadReceipt(event.roomId, event.messageId, event.user);
        break;
    }
  };

  // Room management functions
  const addRoom = (room: ChatRoom) => {
    setRooms(prev => [...prev.filter(r => r.id !== room.id), room]);
  };

  const updateRoom = (room: ChatRoom) => {
    setRooms(prev => prev.map(r => r.id === room.id ? room : r));
  };

  const addUserToRoom = (roomId: string, user: ChatUser) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, participants: [...room.participants.filter(p => p.id !== user.id), user] }
        : room
    ));
  };

  const removeUserFromRoom = (roomId: string, userId: string) => {
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, participants: room.participants.filter(p => p.id !== userId) }
        : room
    ));
  };

  const updateUserStatus = (user: ChatUser) => {
    setOnlineUsers(prev => prev.map(u => u.id === user.id ? user : u));
    setRooms(prev => prev.map(room => ({
      ...room,
      participants: room.participants.map(p => p.id === user.id ? user : p)
    })));
  };

  // Message management functions
  const addMessageToRoom = (roomId: string, message: P2PChatMessage) => {
    setMessagesByRoom(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []), message]
    }));

    // Update room's last message
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, lastMessage: message, unreadCount: (room.unreadCount || 0) + 1 }
        : room
    ));
  };

  const updateMessageInRoom = (roomId: string, message: P2PChatMessage) => {
    setMessagesByRoom(prev => ({
      ...prev,
      [roomId]: (prev[roomId] || []).map(m => m.id === message.id ? message : m)
    }));
  };

  const removeMessageFromRoom = (roomId: string, messageId: string) => {
    setMessagesByRoom(prev => ({
      ...prev,
      [roomId]: (prev[roomId] || []).filter(m => m.id !== messageId)
    }));
  };

  const updateMessageReaction = (roomId: string, messageId: string, reaction: any, action: 'added' | 'removed') => {
    setMessagesByRoom(prev => ({
      ...prev,
      [roomId]: (prev[roomId] || []).map(message => {
        if (message.id === messageId) {
          const reactions = message.reactions || [];
          if (action === 'added') {
            return { ...message, reactions: [...reactions, reaction] };
          } else {
            return { ...message, reactions: reactions.filter(r => r.emoji !== reaction.emoji) };
          }
        }
        return message;
      })
    }));
  };

  const updateMessageReadReceipt = (roomId: string, messageId: string, user: ChatUser) => {
    setMessagesByRoom(prev => ({
      ...prev,
      [roomId]: (prev[roomId] || []).map(message => {
        if (message.id === messageId) {
          const readBy = message.readBy || [];
          const readReceipt = { user, readAt: Date.now() };
          return { 
            ...message, 
            readBy: [...readBy.filter(r => r.user.id !== user.id), readReceipt] 
          };
        }
        return message;
      })
    }));
  };

  // Typing indicator management
  const addTypingIndicator = (roomId: string, user: ChatUser) => {
    const indicator: TypingIndicator = {
      roomId,
      user,
      startedAt: Date.now(),
    };

    setTypingIndicators(prev => ({
      ...prev,
      [roomId]: [...(prev[roomId] || []).filter(t => t.user.id !== user.id), indicator]
    }));

    // Auto-remove after 3 seconds
    setTimeout(() => {
      removeTypingIndicator(roomId, user.id);
    }, 3000);
  };

  const removeTypingIndicator = (roomId: string, userId: string) => {
    setTypingIndicators(prev => ({
      ...prev,
      [roomId]: (prev[roomId] || []).filter(t => t.user.id !== userId)
    }));
  };

  // Actions implementation
  const createRoom = async (name: string, type: ChatRoom['type'], participants: ChatUser[] = []): Promise<ChatRoom> => {
    const response = await fetchFn(`${apiEndpoint}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({
        name,
        type,
        participants: participants.map(p => p.id),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create room: ${response.statusText}`);
    }

    const room: ChatRoom = await response.json();
    addRoom(room);
    return room;
  };

  const joinRoom = async (roomId: string): Promise<void> => {
    const ws = websocket();
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'join_room',
        roomId,
      }));
    }

    // Fetch room messages
    const messages = await getRoomMessages(roomId);
    setMessagesByRoom(prev => ({
      ...prev,
      [roomId]: messages
    }));

    // Mark room as active
    const room = rooms().find(r => r.id === roomId);
    if (room) {
      setActiveRoom(room);
      // Clear unread count
      setRooms(prev => prev.map(r => 
        r.id === roomId ? { ...r, unreadCount: 0 } : r
      ));
    }
  };

  const leaveRoom = async (roomId: string): Promise<void> => {
    const ws = websocket();
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'leave_room',
        roomId,
      }));
    }

    if (activeRoom()?.id === roomId) {
      setActiveRoom(undefined);
    }
  };

  const updateRoomAction = async (roomId: string, updates: Partial<ChatRoom>): Promise<void> => {
    const response = await fetchFn(`${apiEndpoint}/rooms/${roomId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      throw new Error(`Failed to update room: ${response.statusText}`);
    }

    const updatedRoom: ChatRoom = await response.json();
    updateRoom(updatedRoom);
  };

  const getRoomMessages = async (roomId: string, limit: number = 50, before?: string): Promise<P2PChatMessage[]> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(before && { before }),
    });

    const response = await fetchFn(`${apiEndpoint}/rooms/${roomId}/messages?${params}`, {
      headers: authHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to get room messages: ${response.statusText}`);
    }

    return await response.json();
  };

  const switchRoom = (roomId: string) => {
    const room = rooms().find(r => r.id === roomId);
    if (room) {
      setActiveRoom(room);
      joinRoom(roomId);
    }
  };

  const sendMessageToRoom = async (roomId: string, content: string, options?: {
    replyTo?: string;
    threadId?: string;
    priority?: P2PChatMessage['priority'];
  }): Promise<void> => {
    const message: Omit<P2PChatMessage, 'id' | 'timestamp'> = {
      role: 'user',
      content,
      roomId,
      sender: currentUser,
      replyTo: options?.replyTo,
      threadId: options?.threadId,
      priority: options?.priority || 'normal',
      deliveryStatus: 'sent',
    };

    const response = await fetchFn(`${apiEndpoint}/rooms/${roomId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.statusText}`);
    }

    const sentMessage: P2PChatMessage = await response.json();
    // Message will be added via WebSocket event
  };

  const editMessage = async (messageId: string, newContent: string, reason?: string): Promise<void> => {
    const response = await fetchFn(`${apiEndpoint}/messages/${messageId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({
        content: newContent,
        reason,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to edit message: ${response.statusText}`);
    }
  };

  const deleteMessage = async (messageId: string): Promise<void> => {
    const response = await fetchFn(`${apiEndpoint}/messages/${messageId}`, {
      method: 'DELETE',
      headers: authHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete message: ${response.statusText}`);
    }
  };

  const reactToMessage = async (messageId: string, emoji: string): Promise<void> => {
    const response = await fetchFn(`${apiEndpoint}/messages/${messageId}/reactions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders,
      },
      body: JSON.stringify({ emoji }),
    });

    if (!response.ok) {
      throw new Error(`Failed to react to message: ${response.statusText}`);
    }
  };

  const markMessageAsRead = async (messageId: string): Promise<void> => {
    const response = await fetchFn(`${apiEndpoint}/messages/${messageId}/read`, {
      method: 'POST',
      headers: authHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to mark message as read: ${response.statusText}`);
    }
  };

  const pinMessage = async (messageId: string, pin: boolean): Promise<void> => {
    const response = await fetchFn(`${apiEndpoint}/messages/${messageId}/pin`, {
      method: pin ? 'POST' : 'DELETE',
      headers: authHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to ${pin ? 'pin' : 'unpin'} message: ${response.statusText}`);
    }
  };

  const startTyping = (roomId: string) => {
    const ws = websocket();
    if (ws?.readyState === WebSocket.OPEN && config.enableTypingIndicators) {
      ws.send(JSON.stringify({
        type: 'typing_start',
        roomId,
      }));

      // Clear existing timer
      const existingTimer = typingTimers.get(roomId);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Auto-stop typing after 3 seconds
      const timer = window.setTimeout(() => {
        stopTyping(roomId);
      }, 3000);

      typingTimers.set(roomId, timer);
    }
  };

  const stopTyping = (roomId: string) => {
    const ws = websocket();
    if (ws?.readyState === WebSocket.OPEN && config.enableTypingIndicators) {
      ws.send(JSON.stringify({
        type: 'typing_stop',
        roomId,
      }));

      // Clear timer
      const timer = typingTimers.get(roomId);
      if (timer) {
        clearTimeout(timer);
        typingTimers.delete(roomId);
      }
    }
  };

  // File upload implementation
  const uploadFile = async (file: File, roomId: string, messageId?: string): Promise<MessageAttachment> => {
    if (!config.enableFileUploads) {
      throw new Error('File uploads are disabled');
    }

    if (file.size > config.maxFileSize!) {
      throw new Error(`File size exceeds limit of ${config.maxFileSize! / 1024 / 1024}MB`);
    }

    const attachmentId = generateAttachmentId();
    const attachment: MessageAttachment = {
      id: attachmentId,
      name: file.name,
      type: file.type,
      size: file.size,
      url: '',
      uploadProgress: 0,
      uploadStatus: 'uploading',
    };

    setUploads(prev => ({ ...prev, [attachmentId]: attachment }));

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('roomId', roomId);
      if (messageId) {
        formData.append('messageId', messageId);
      }

      const response = await fetchFn(`${apiEndpoint}/upload`, {
        method: 'POST',
        headers: authHeaders,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      const completedAttachment: MessageAttachment = {
        ...attachment,
        url: result.url,
        thumbnailUrl: result.thumbnailUrl,
        uploadProgress: 100,
        uploadStatus: 'completed',
      };

      setUploads(prev => ({ ...prev, [attachmentId]: completedAttachment }));
      return completedAttachment;

    } catch (error) {
      const failedAttachment: MessageAttachment = {
        ...attachment,
        uploadStatus: 'failed',
      };
      setUploads(prev => ({ ...prev, [attachmentId]: failedAttachment }));
      throw error;
    }
  };

  const downloadFile = async (attachmentId: string): Promise<Blob> => {
    const response = await fetchFn(`${apiEndpoint}/attachments/${attachmentId}`, {
      headers: authHeaders,
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }

    return await response.blob();
  };

  // Additional actions...
  const updateUserStatusViaWebSocket = async (status: ChatUser['status']): Promise<void> => {
    const ws = websocket();
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'update_status',
        status,
      }));
    }
  };

  const getUserProfile = async (userId: string): Promise<ChatUser> => {
    const response = await fetchFn(`${apiEndpoint}/users/${userId}`, {
      headers: authHeaders,
    });

    if (!response.ok) {
      throw new Error(`Failed to get user profile: ${response.statusText}`);
    }

    return await response.json();
  };

  const searchMessages = async (query: string, roomId?: string): Promise<P2PChatMessage[]> => {
    const params = new URLSearchParams({
      q: query,
      ...(roomId && { roomId }),
    });

    const response = await fetchFn(`${apiEndpoint}/search/messages?${params}`, {
      headers: authHeaders,
    });

    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    return await response.json();
  };

  // Computed values
  const currentRoomMessages = createMemo(() => {
    const room = activeRoom();
    return room ? messagesByRoom()[room.id] || [] : [];
  });

  const currentRoomTyping = createMemo(() => {
    const room = activeRoom();
    return room ? typingIndicators()[room.id] || [] : [];
  });

  // Auto-connect on mount
  onMount(() => {
    if (autoConnect) {
      connectWebSocket();
    }
  });

  // Cleanup on unmount
  onCleanup(() => {
    const ws = websocket();
    if (ws) {
      ws.close();
    }

    const timer = reconnectTimer();
    if (timer) {
      clearTimeout(timer);
    }

    // Clear all typing timers
    typingTimers.forEach(timer => clearTimeout(timer));
    typingTimers.clear();
  });

  // Combine base chat actions with P2P actions
  const p2pActions: P2PChatActions = {
    ...baseChat.actions,
    createRoom,
    joinRoom,
    leaveRoom,
    updateRoom: updateRoomAction,
    getRoomMessages,
    switchRoom,
    sendMessageToRoom,
    editMessage,
    deleteMessage,
    reactToMessage,
    markMessageAsRead,
    pinMessage,
    startTyping,
    stopTyping,
    updateUserStatusViaWebSocket,
    getUserProfile,
    blockUser: async (userId: string, block: boolean) => {
      // Implementation for blocking users
      throw new Error('Not implemented');
    },
    inviteUser: async (roomId: string, userId: string) => {
      // Implementation for inviting users
      throw new Error('Not implemented');
    },
    uploadFile,
    downloadFile,
    searchMessages,
    getMessageHistory: async (roomId: string, options = {}) => {
      return getRoomMessages(roomId, options.limit, options.before?.toString());
    },
    setPresence: async (status: ChatUser['status'], message?: string) => {
      return updateUserStatusViaWebSocket(status);
    },
    getRoomPresence: async (roomId: string) => {
      const room = rooms().find(r => r.id === roomId);
      return room?.participants || [];
    },
    configureNotifications: async (settings) => {
      // Implementation for notification settings
      console.log('Configuring notifications:', settings);
    },
  };

  // Return combined state and actions
  return {
    // Base chat state (excluding currentMessage to avoid type conflict)
    isStreaming: baseChat.isStreaming,
    isThinking: baseChat.isThinking,
    availableModels: baseChat.availableModels,
    selectedModel: baseChat.selectedModel,
    availableTools: baseChat.availableTools,
    connectionState: baseChat.connectionState,
    error: baseChat.error,
    config: baseChat.config,
    
    // P2P-specific state
    currentUser: () => currentUser,
    rooms,
    activeRoom,
    messagesByRoom,
    onlineUsers,
    typingIndicators,
    p2pConnection,
    uploads,
    
    // Enhanced messages (current room messages)
    messages: currentRoomMessages,
    currentMessage: () => {
      const room = activeRoom();
      if (!room) return undefined;
      const messages = messagesByRoom()[room.id] || [];
      return messages[messages.length - 1];
    },
    
    // Combined actions
    actions: p2pActions,
  };
}
