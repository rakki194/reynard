/**
 * P2P Messages Composable for Message Management
 *
 * This module handles message storage, retrieval, and real-time message updates
 * for peer-to-peer chat functionality.
 */
import type { P2PChatMessage, ChatRoom } from "../types/p2p";
export interface P2PMessagesOptions {
    /** Initial rooms */
    initialRooms?: ChatRoom[];
    /** Current user ID */
    currentUserId: string;
}
export interface P2PMessagesReturn {
    messagesByRoom: () => Record<string, P2PChatMessage[]>;
    addMessageToRoom: (roomId: string, message: P2PChatMessage) => void;
    updateMessage: (roomId: string, messageId: string, updates: Partial<P2PChatMessage>) => void;
    deleteMessage: (roomId: string, messageId: string) => void;
    getRoomMessages: (roomId: string) => P2PChatMessage[];
    getMessageById: (roomId: string, messageId: string) => P2PChatMessage | undefined;
    clearRoomMessages: (roomId: string) => void;
    markMessageAsRead: (roomId: string, messageId: string) => void;
    markAllMessagesAsRead: (roomId: string) => void;
    getUnreadCount: (roomId: string) => number;
}
export declare function useP2PMessages(options: P2PMessagesOptions): P2PMessagesReturn;
