/**
 * P2P Rooms Composable for Room Management
 *
 * This module handles chat room creation, joining, leaving, and room state management
 * for peer-to-peer chat functionality.
 */
import type { ChatRoom, ChatUser } from "../types/p2p";
export interface P2PRoomsOptions {
    /** Initial rooms */
    initialRooms?: ChatRoom[];
    /** Current user */
    currentUser: ChatUser;
    /** Initial room to join */
    initialRoomId?: string;
}
export interface P2PRoomsReturn {
    rooms: () => ChatRoom[];
    activeRoom: () => ChatRoom | null;
    setActiveRoom: (room: ChatRoom | null) => void;
    addRoom: (room: ChatRoom) => void;
    removeRoom: (roomId: string) => void;
    updateRoom: (roomId: string, updates: Partial<ChatRoom>) => void;
    joinRoom: (roomId: string) => Promise<void>;
    leaveRoom: (roomId: string) => Promise<void>;
    createRoom: (roomData: Omit<ChatRoom, "id" | "createdAt" | "updatedAt">) => Promise<ChatRoom>;
    getRoomById: (roomId: string) => ChatRoom | undefined;
    isUserInRoom: (roomId: string, userId: string) => boolean;
    addUserToRoom: (roomId: string, user: ChatUser) => void;
    removeUserFromRoom: (roomId: string, userId: string) => void;
    updateRoomLastMessage: (roomId: string, message: {
        content: string;
        timestamp: Date;
    }) => void;
}
export declare function useP2PRooms(options: P2PRoomsOptions): P2PRoomsReturn;
