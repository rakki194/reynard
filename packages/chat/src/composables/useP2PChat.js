/**
 * P2P Chat Composable for User-to-User Messaging
 *
 * Orchestrates specialized composables to provide peer-to-peer communication
 * while sharing core infrastructure and markdown parsing capabilities.
 */
import { createSignal, createMemo, onMount } from "solid-js";
import { useChat } from "./useChat";
import { useP2PConnection } from "./useP2PConnection";
import { useP2PMessages } from "./useP2PMessages";
import { useP2PRooms } from "./useP2PRooms";
import { useP2PFileUpload } from "./useP2PFileUpload";
const DEFAULT_P2P_CONFIG = {
    enableFileUploads: true,
    enableReactions: true,
    enableTypingIndicators: true,
    enableReadReceipts: true,
    enableThreads: true,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ["image/*", "text/*", "application/pdf"],
    messageRetention: 30, // 30 days
};
const DEFAULT_RECONNECTION = {
    enabled: true,
    maxAttempts: 5,
    delay: 1000,
    backoff: 2,
};
export function useP2PChat(options) {
    const { currentUser, realtimeEndpoint, apiEndpoint = "/api/chat", authHeaders = {}, initialRoomId, initialRooms = [], autoConnect = true, fetchFn = fetch, reconnection = DEFAULT_RECONNECTION, config = DEFAULT_P2P_CONFIG, } = options;
    // Extend base chat functionality
    const baseChat = useChat({
        endpoint: apiEndpoint,
        authHeaders,
        autoConnect: false, // We'll handle connection manually
        fetchFn,
        reconnection,
    });
    // Initialize specialized composables
    const p2pConnection = useP2PConnection({
        realtimeEndpoint,
        reconnection,
        autoConnect,
    });
    const p2pMessages = useP2PMessages({
        initialRooms,
        currentUserId: currentUser.id,
    });
    const p2pRooms = useP2PRooms({
        initialRooms,
        currentUser,
        initialRoomId,
    });
    const p2pFileUpload = useP2PFileUpload({
        maxFileSize: config.maxFileSize,
        allowedTypes: config.allowedFileTypes,
        uploadEndpoint: `${apiEndpoint}/upload`,
        authHeaders,
        fetchFn,
    });
    // P2P-specific state
    const [onlineUsers, setOnlineUsers] = createSignal([]);
    const [typingIndicators, setTypingIndicators] = createSignal([]);
    // Typing timer management (for future use)
    const _typingTimers = new Map();
    // Computed values
    const currentRoomMessages = createMemo(() => {
        const room = p2pRooms.activeRoom();
        if (!room)
            return [];
        return p2pMessages.getRoomMessages(room.id);
    });
    // Handle WebSocket messages
    const _handleWebSocketMessage = (data) => {
        switch (data.type) {
            case "message_sent":
                p2pMessages.addMessageToRoom(data.message.roomId, data.message);
                p2pRooms.updateRoomLastMessage(data.message.roomId, {
                    content: data.message.content,
                    timestamp: new Date(data.message.timestamp),
                });
                break;
            case "typing_start":
                if (config.enableTypingIndicators) {
                    setTypingIndicators((prev) => [
                        ...prev.filter((t) => !(t.user.id === data.user.id && t.roomId === data.roomId)),
                        { roomId: data.roomId, user: data.user, startedAt: Date.now() },
                    ]);
                }
                break;
            case "typing_stop":
                if (config.enableTypingIndicators) {
                    setTypingIndicators((prev) => prev.filter((t) => !(t.user.id === data.user.id && t.roomId === data.roomId)));
                }
                break;
            case "user_joined":
                setOnlineUsers((prev) => [
                    ...prev.filter((u) => u.id !== data.user.id),
                    data.user,
                ]);
                break;
            case "user_left":
                setOnlineUsers((prev) => prev.filter((u) => u.id !== data.user.id));
                break;
            case "room_created":
                p2pRooms.addRoom(data.room);
                break;
            case "room_updated":
                p2pRooms.updateRoom(data.room.id, {});
                break;
        }
    };
    // P2P Actions
    const p2pActions = {
        // Connection actions
        connect: p2pConnection.connect,
        disconnect: p2pConnection.disconnect,
        // Room actions
        joinRoom: p2pRooms.joinRoom,
        leaveRoom: p2pRooms.leaveRoom,
        createRoom: async (name, type, participants) => {
            return await p2pRooms.createRoom({
                name,
                type,
                participants: participants || [],
            });
        },
        updateRoom: async (roomId, updates) => {
            p2pRooms.updateRoom(roomId, updates);
        },
        getRoomMessages: async (roomId, _limit, _before) => {
            return p2pMessages.getRoomMessages(roomId);
        },
        switchRoom: (roomId) => {
            p2pRooms.joinRoom(roomId);
        },
        // Message actions
        sendMessage: async (content, _options) => {
            const targetRoomId = p2pRooms.activeRoom()?.id;
            if (!targetRoomId) {
                throw new Error("No room selected");
            }
            return await p2pActions.sendMessageToRoom(targetRoomId, content);
        },
        sendMessageToRoom: async (roomId, content, options) => {
            const message = {
                id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                role: "user",
                content,
                timestamp: Date.now(),
                roomId,
                sender: currentUser,
                replyTo: options?.replyTo,
                threadId: options?.threadId,
                priority: options?.priority || "normal",
            };
            // Add message locally
            p2pMessages.addMessageToRoom(roomId, message);
            p2pRooms.updateRoomLastMessage(roomId, {
                content,
                timestamp: new Date(),
            });
            // Send via WebSocket
            const ws = p2pConnection.websocket();
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: "message_sent",
                    roomId,
                    message,
                }));
            }
        },
        // File upload actions
        uploadFile: async (file, roomId) => {
            const targetRoomId = roomId || p2pRooms.activeRoom()?.id;
            if (!targetRoomId) {
                throw new Error("No room selected");
            }
            if (!config.enableFileUploads) {
                throw new Error("File uploads are disabled");
            }
            return await p2pFileUpload.uploadFile(file, targetRoomId);
        },
        // Typing indicators
        startTyping: (roomId) => {
            if (!config.enableTypingIndicators)
                return;
            const ws = p2pConnection.websocket();
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: "typing_start",
                    roomId,
                    user: currentUser,
                }));
            }
        },
        stopTyping: (roomId) => {
            if (!config.enableTypingIndicators)
                return;
            // Clear typing indicator
            setTypingIndicators((prev) => prev.filter((t) => !(t.user.id === currentUser.id && t.roomId === roomId)));
        },
        // Message management
        deleteMessage: async (messageId) => {
            const room = p2pRooms.activeRoom();
            if (room) {
                p2pMessages.deleteMessage(room.id, messageId);
            }
        },
        markMessageAsRead: async (messageId) => {
            const room = p2pRooms.activeRoom();
            if (room) {
                p2pMessages.markMessageAsRead(room.id, messageId);
            }
        },
        editMessage: async (messageId, newContent, _reason) => {
            const room = p2pRooms.activeRoom();
            if (room) {
                p2pMessages.updateMessage(room.id, messageId, { content: newContent });
            }
        },
        reactToMessage: async (messageId, emoji) => {
            // Implementation for message reactions
            console.log("Reacting to message:", messageId, "with emoji:", emoji);
        },
        pinMessage: async (messageId, pin) => {
            // Implementation for pinning messages
            console.log("Pinning message:", messageId, "pin:", pin);
        },
        // User management
        updateUserStatusViaWebSocket: async (status) => {
            const ws = p2pConnection.websocket();
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: "user_status_update",
                    userId: currentUser.id,
                    status,
                }));
            }
        },
        getUserProfile: async (_userId) => {
            // Implementation for getting user profile
            throw new Error("getUserProfile not implemented");
        },
        blockUser: async (userId, block) => {
            // Implementation for blocking users
            console.log("Blocking user:", userId, "block:", block);
        },
        inviteUser: async (roomId, userId) => {
            // Implementation for inviting users to rooms
            console.log("Inviting user:", userId, "to room:", roomId);
        },
        // File handling
        downloadFile: async (_attachmentId) => {
            // Implementation for downloading files
            throw new Error("downloadFile not implemented");
        },
        // Search and history
        searchMessages: async (_query, _roomId) => {
            // Implementation for searching messages
            return [];
        },
        getMessageHistory: async (roomId, _options) => {
            return p2pMessages.getRoomMessages(roomId);
        },
        // Presence and notifications
        setPresence: async (status, message) => {
            const ws = p2pConnection.websocket();
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                    type: "user_presence_update",
                    userId: currentUser.id,
                    status,
                    message,
                }));
            }
        },
        getRoomPresence: async (_roomId) => {
            // Implementation for getting room presence
            return onlineUsers();
        },
        // Base ChatActions methods
        cancelStreaming: () => {
            // Implementation for canceling streaming
            console.log("Canceling streaming");
        },
        clearConversation: () => {
            // Implementation for clearing conversation
            const room = p2pRooms.activeRoom();
            if (room) {
                p2pMessages.clearRoomMessages(room.id);
            }
        },
        retryLastMessage: async () => {
            // Implementation for retrying last message
            console.log("Retrying last message");
        },
        updateConfig: (config) => {
            // Implementation for updating config
            console.log("Updating config:", config);
        },
        exportConversation: (format) => {
            // Implementation for exporting conversation
            const room = p2pRooms.activeRoom();
            if (!room)
                return "";
            const messages = p2pMessages.getRoomMessages(room.id);
            if (format === "json") {
                return JSON.stringify(messages, null, 2);
            }
            return messages
                .map((msg) => `${msg.sender?.name || "Unknown"}: ${msg.content}`)
                .join("\n");
        },
        importConversation: (data, format) => {
            // Implementation for importing conversation
            if (format === "json") {
                try {
                    const messages = JSON.parse(data);
                    const room = p2pRooms.activeRoom();
                    if (room) {
                        messages.forEach((msg) => {
                            p2pMessages.addMessageToRoom(room.id, msg);
                        });
                    }
                }
                catch (error) {
                    console.error("Failed to import conversation:", error);
                }
            }
        },
        // Notification actions
        configureNotifications: async (settings) => {
            // Implementation for notification settings
            console.log("Configuring notifications:", settings);
        },
    };
    // Auto-join initial room
    onMount(() => {
        if (initialRoomId) {
            p2pRooms.joinRoom(initialRoomId);
        }
    });
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
        rooms: p2pRooms.rooms,
        activeRoom: () => p2pRooms.activeRoom() || undefined,
        messagesByRoom: p2pMessages.messagesByRoom,
        onlineUsers,
        typingIndicators: () => {
            const indicators = typingIndicators();
            const grouped = {};
            indicators.forEach((indicator) => {
                if (!grouped[indicator.roomId]) {
                    grouped[indicator.roomId] = [];
                }
                grouped[indicator.roomId].push(indicator);
            });
            return grouped;
        },
        p2pConnection: p2pConnection.connectionState,
        uploads: () => {
            const uploads = p2pFileUpload.uploads();
            const attachments = {};
            // Convert upload progress to attachments (simplified)
            Object.entries(uploads).forEach(([key, upload]) => {
                if (upload.status === "completed") {
                    attachments[key] = {
                        id: upload.fileId,
                        name: upload.fileName,
                        type: "application/octet-stream", // Would need to determine from file
                        size: 0, // Would need to store original file size
                        url: "", // Would need to store upload URL
                    };
                }
            });
            return attachments;
        },
        // Enhanced messages (current room messages)
        messages: currentRoomMessages,
        currentMessage: () => {
            const room = p2pRooms.activeRoom();
            if (!room)
                return undefined;
            const messages = p2pMessages.getRoomMessages(room.id);
            return messages[messages.length - 1];
        },
        // Combined actions
        actions: p2pActions,
    };
}
