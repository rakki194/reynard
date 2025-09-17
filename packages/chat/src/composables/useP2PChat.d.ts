/**
 * P2P Chat Composable for User-to-User Messaging
 *
 * Orchestrates specialized composables to provide peer-to-peer communication
 * while sharing core infrastructure and markdown parsing capabilities.
 */
import type { ChatUser, ChatRoom, UseP2PChatReturn } from "../types/p2p";
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
export declare function useP2PChat(options: UseP2PChatOptions): UseP2PChatReturn;
