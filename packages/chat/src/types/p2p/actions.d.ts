/**
 * P2P Chat Actions Types
 *
 * Defines action handler interfaces for peer-to-peer chat operations.
 */
import type { ChatUser } from "./user";
import type { ChatRoom } from "./room";
import type { P2PChatMessage, MessageAttachment } from "./message";
import type { ChatActions } from "../../types";
export interface P2PChatActions extends ChatActions {
    /** Create a new room */
    createRoom: (name: string, type: ChatRoom["type"], participants?: ChatUser[]) => Promise<ChatRoom>;
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
    /** Send message to specific room */
    sendMessageToRoom: (roomId: string, content: string, options?: {
        replyTo?: string;
        threadId?: string;
        priority?: P2PChatMessage["priority"];
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
    /** Start typing indicator */
    startTyping: (roomId: string) => void;
    /** Stop typing indicator */
    stopTyping: (roomId: string) => void;
    /** Update user status via WebSocket */
    updateUserStatusViaWebSocket: (status: ChatUser["status"]) => Promise<void>;
    /** Get user profile */
    getUserProfile: (userId: string) => Promise<ChatUser>;
    /** Block/unblock user */
    blockUser: (userId: string, block: boolean) => Promise<void>;
    /** Invite user to room */
    inviteUser: (roomId: string, userId: string) => Promise<void>;
    /** Upload file */
    uploadFile: (file: File, roomId: string, messageId?: string) => Promise<MessageAttachment>;
    /** Download file */
    downloadFile: (attachmentId: string) => Promise<Blob>;
    /** Search messages */
    searchMessages: (query: string, roomId?: string) => Promise<P2PChatMessage[]>;
    /** Get message history */
    getMessageHistory: (roomId: string, options?: {
        before?: number;
        after?: number;
        limit?: number;
    }) => Promise<P2PChatMessage[]>;
    /** Set user presence */
    setPresence: (status: ChatUser["status"], message?: string) => Promise<void>;
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
