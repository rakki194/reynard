/**
 * P2P Chat System Export
 *
 * Main entry point for the peer-to-peer chat functionality
 * that extends the base chat system for user-to-user messaging.
 */

// Export P2P-specific types
export * from "./types/p2p";

// Export P2P composables
export { useP2PChat } from "./composables/useP2PChat";
export type { UseP2PChatOptions } from "./composables/useP2PChat";

// Export P2P components
export { P2PChatContainer } from "./components/P2PChatContainer";
export { P2PMessage } from "./components/P2PMessage";
export { RoomList } from "./components/RoomList";
export { UserList } from "./components/UserList";

// Re-export base chat functionality for convenience
export { ChatMessage, MessageInput, MarkdownRenderer, ThinkingIndicator, ToolCallDisplay } from "./components";

export { StreamingMarkdownParser, createStreamingMarkdownParser, parseMarkdown, parseMarkdownStream } from "./utils";

// Re-export base types that are commonly used in P2P
export type {
  ChatMessage as BaseChatMessage,
  ChatState as BaseChatState,
  ChatActions as BaseChatActions,
  MarkdownNode,
  ParseResult,
  StreamChunk,
} from "./types";
