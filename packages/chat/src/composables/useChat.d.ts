/**
 * Main chat composable for Reynard Chat System
 *
 * Orchestrates focused composables to provide comprehensive state management
 * and streaming functionality for chat applications.
 */
import type { ChatState, UseChatReturn } from "../types";
export interface UseChatOptions {
    /** Chat service endpoint */
    endpoint?: string;
    /** Authentication headers */
    authHeaders?: Record<string, string>;
    /** Initial configuration */
    config?: Partial<ChatState["config"]>;
    /** Available tools */
    tools?: any[];
    /** Initial messages */
    initialMessages?: any[];
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
}
export declare function useChat(options?: UseChatOptions): UseChatReturn;
