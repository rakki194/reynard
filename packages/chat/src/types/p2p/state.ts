/**
 * P2P Chat State Types
 *
 * Defines state management interfaces for peer-to-peer chat.
 */

import type { ChatUser } from "./user";
import type { ChatRoom } from "./room";
import type { P2PChatMessage, MessageAttachment } from "./message";
import type { TypingIndicator } from "./user";
import type { ChatState, Tool } from "../../types";
import type { P2PChatActions } from "./actions";

// P2P Chat State extending base ChatState
export interface P2PChatState extends Omit<ChatState, "messages"> {
  /** Current user */
  currentUser?: ChatUser;
  /** Available rooms/channels */
  rooms: ChatRoom[];
  /** Currently active room */
  activeRoom?: ChatRoom;
  /** Messages by room ID */
  messagesByRoom: Record<string, P2PChatMessage[]>;
  /** Online users */
  onlineUsers: ChatUser[];
  /** Typing indicators by room ID */
  typingIndicators: Record<string, TypingIndicator[]>;
  /** Connection to P2P service */
  p2pConnection: {
    status:
      | "disconnected"
      | "connecting"
      | "connected"
      | "reconnecting"
      | "error";
    lastConnected?: number;
    reconnectAttempts: number;
    protocol?: "websocket" | "webrtc" | "sse";
  };
  /** File upload state */
  uploads: Record<string, MessageAttachment>;
}

// Combined P2P Chat composable return type
export interface UseP2PChatReturn {
  /** Current conversation messages for active room */
  messages: () => P2PChatMessage[];
  /** Currently streaming message (if any) */
  currentMessage: () => P2PChatMessage | undefined;
  /** Whether the chat is currently streaming */
  isStreaming: () => boolean;
  /** Whether the assistant is currently thinking */
  isThinking: () => boolean;
  /** Available models for selection */
  availableModels: () => string[];
  /** Currently selected model */
  selectedModel: () => string | undefined;
  /** Available tools */
  availableTools: () => Tool[];
  /** Connection state */
  connectionState: () => "disconnected" | "connecting" | "connected" | "error";
  /** Current error (if any) */
  error: () =>
    | {
        type: string;
        message: string;
        timestamp: number;
        recoverable: boolean;
      }
    | undefined;
  /** Chat configuration */
  config: () => {
    enableThinking: boolean;
    enableTools: boolean;
    autoScroll: boolean;
    showTimestamps: boolean;
    showTokenCounts: boolean;
    maxHistoryLength: number;
  };

  // P2P-specific state
  /** Current user */
  currentUser: () => ChatUser;
  /** Available rooms/channels */
  rooms: () => ChatRoom[];
  /** Currently active room */
  activeRoom: () => ChatRoom | undefined;
  /** Messages by room ID */
  messagesByRoom: () => Record<string, P2PChatMessage[]>;
  /** Online users */
  onlineUsers: () => ChatUser[];
  /** Typing indicators by room ID */
  typingIndicators: () => Record<string, TypingIndicator[]>;
  /** Connection to P2P service */
  p2pConnection: () => {
    status:
      | "disconnected"
      | "connecting"
      | "connected"
      | "reconnecting"
      | "error";
    lastConnected?: number;
    reconnectAttempts: number;
    protocol?: "websocket" | "webrtc" | "sse";
  };
  /** File upload state */
  uploads: () => Record<string, MessageAttachment>;

  /** Actions for controlling the chat */
  actions: P2PChatActions;
}
