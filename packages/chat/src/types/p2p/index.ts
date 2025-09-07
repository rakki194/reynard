/**
 * P2P Chat Types - Main Export
 *
 * Centralized export point for all P2P chat type definitions.
 * This maintains backward compatibility while organizing types into logical modules.
 */

// Re-export all user and presence types
export type {
  ChatUser,
  TypingIndicator,
} from "./user";

// Re-export all room and channel types
export type {
  ChatRoom,
  RoomSettings,
} from "./room";

// Re-export all message and attachment types
export type {
  P2PChatMessage,
  MessageReaction,
  MessageReadReceipt,
  MessageAttachment,
  MessageEdit,
} from "./message";

// Re-export all event types
export type {
  P2PChatEvent,
  UserJoinedEvent,
  UserLeftEvent,
  UserStatusChangedEvent,
  MessageSentEvent,
  MessageEditedEvent,
  MessageDeletedEvent,
  MessageReactionEvent,
  TypingStartEvent,
  TypingStopEvent,
  RoomCreatedEvent,
  RoomUpdatedEvent,
  ReadReceiptEvent,
} from "./events";

// Re-export all state and action types
export type {
  P2PChatState,
  UseP2PChatReturn,
} from "./state";

export type {
  P2PChatActions,
} from "./actions";

// Re-export all component prop types
export type {
  P2PChatContainerProps,
  P2PMessageProps,
  RoomListProps,
  UserListProps,
} from "./components";
