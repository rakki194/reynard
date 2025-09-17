/**
 * P2P Chat System Export
 *
 * Main entry point for the peer-to-peer chat functionality
 * that extends the base chat system for user-to-user messaging.
 */
export * from "./types/p2p";
export { useP2PChat } from "./composables/useP2PChat";
export type { UseP2PChatOptions } from "./composables/useP2PChat";
export { P2PChatContainer } from "./components/P2PChatContainer";
export { P2PMessage } from "./components/P2PMessage";
export { RoomList } from "./components/RoomList";
export { UserList } from "./components/UserList";
export { ChatMessage, MessageInput, MarkdownRenderer, ThinkingIndicator, ToolCallDisplay, } from "./components";
export { StreamingMarkdownParser, createStreamingMarkdownParser, parseMarkdown, parseMarkdownStream, } from "./utils";
export type { ChatMessage as BaseChatMessage, ChatState as BaseChatState, ChatActions as BaseChatActions, MarkdownNode, ParseResult, StreamChunk, } from "./types";
