/**
 * P2P Chat Component Props Types
 *
 * Defines component prop interfaces for P2P chat UI components.
 */
import type { ChatUser } from "./user";
import type { ChatRoom } from "./room";
import type { P2PChatMessage } from "./message";
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
        theme?: "light" | "dark" | "auto";
    };
    /** Event callbacks */
    onRoomJoined?: (room: ChatRoom) => void;
    onRoomLeft?: (room: ChatRoom) => void;
    onMessageReceived?: (message: P2PChatMessage) => void;
    onUserStatusChanged?: (user: ChatUser) => void;
    onError?: (error: Error | unknown) => void;
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
