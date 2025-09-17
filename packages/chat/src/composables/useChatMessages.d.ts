/**
 * Chat Messages Composable
 *
 * Handles message management including adding, updating, and clearing messages
 */
import type { ChatMessage } from "../types";
export interface UseChatMessagesOptions {
    /** Initial messages */
    initialMessages?: ChatMessage[];
    /** Maximum history length */
    maxHistoryLength?: number;
}
export interface UseChatMessagesReturn {
    messages: () => ChatMessage[];
    currentMessage: () => ChatMessage | undefined;
    setCurrentMessage: (message: ChatMessage | undefined) => void;
    addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => ChatMessage;
    updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
    clearConversation: () => void;
    exportConversation: (format: "json" | "markdown" | "txt") => string;
    importConversation: (data: string, format: "json") => void;
}
export declare function useChatMessages(options?: UseChatMessagesOptions): UseChatMessagesReturn;
