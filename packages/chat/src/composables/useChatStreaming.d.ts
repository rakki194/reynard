/**
 * Chat Streaming Composable
 *
 * Handles streaming functionality including response processing,
 * chunk handling, and streaming state management
 */
import { StreamingMarkdownParser } from "../utils/StreamingMarkdownParser";
import type { ChatMessage, ChatRequest, StreamChunk } from "../types";
export interface UseChatStreamingOptions {
    /** Custom fetch function */
    fetchFn?: typeof fetch;
    /** Authentication headers */
    authHeaders?: Record<string, string>;
    /** Chat service endpoint */
    endpoint?: string;
}
export interface UseChatStreamingReturn {
    isStreaming: () => boolean;
    isThinking: () => boolean;
    currentResponse: () => string;
    currentThinking: () => string;
    streamController: () => AbortController | null;
    streamingParser: () => StreamingMarkdownParser | null;
    sendMessage: (content: string, requestOptions?: Partial<ChatRequest>) => Promise<void>;
    streamResponse: (request: ChatRequest) => Promise<void>;
    processStreamChunk: (chunk: StreamChunk, parser: StreamingMarkdownParser, messageId: string) => Promise<void>;
    finalizeStreaming: (messageId: string) => Promise<void>;
    cancelStreaming: () => void;
    retryLastMessage: () => Promise<void>;
}
export declare function useChatStreaming(options: UseChatStreamingOptions | undefined, messageHandlers: {
    addMessage: (message: Omit<ChatMessage, "id" | "timestamp">) => ChatMessage;
    updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
    messages: () => ChatMessage[];
}): UseChatStreamingReturn;
