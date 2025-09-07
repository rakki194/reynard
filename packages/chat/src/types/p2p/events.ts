/**
 * P2P Chat Real-time Event Types
 *
 * Defines WebSocket/SSE event structures for real-time peer-to-peer communication.
 */

import type { ChatUser } from "./user";
import type { ChatRoom } from "./room";
import type { P2PChatMessage, MessageReaction } from "./message";

// Real-time events
export type P2PChatEvent =
  | UserJoinedEvent
  | UserLeftEvent
  | UserStatusChangedEvent
  | MessageSentEvent
  | MessageEditedEvent
  | MessageDeletedEvent
  | MessageReactionEvent
  | TypingStartEvent
  | TypingStopEvent
  | RoomCreatedEvent
  | RoomUpdatedEvent
  | ReadReceiptEvent;

export interface UserJoinedEvent {
  type: "user_joined";
  roomId: string;
  user: ChatUser;
  timestamp: number;
}

export interface UserLeftEvent {
  type: "user_left";
  roomId: string;
  user: ChatUser;
  timestamp: number;
}

export interface UserStatusChangedEvent {
  type: "user_status_changed";
  user: ChatUser;
  previousStatus: ChatUser["status"];
  timestamp: number;
}

export interface MessageSentEvent {
  type: "message_sent";
  message: P2PChatMessage;
  timestamp: number;
}

export interface MessageEditedEvent {
  type: "message_edited";
  message: P2PChatMessage;
  previousContent: string;
  timestamp: number;
}

export interface MessageDeletedEvent {
  type: "message_deleted";
  messageId: string;
  roomId: string;
  deletedBy: ChatUser;
  timestamp: number;
}

export interface MessageReactionEvent {
  type: "message_reaction";
  messageId: string;
  roomId: string;
  reaction: MessageReaction;
  user: ChatUser;
  action: "added" | "removed";
  timestamp: number;
}

export interface TypingStartEvent {
  type: "typing_start";
  roomId: string;
  user: ChatUser;
  timestamp: number;
}

export interface TypingStopEvent {
  type: "typing_stop";
  roomId: string;
  user: ChatUser;
  timestamp: number;
}

export interface RoomCreatedEvent {
  type: "room_created";
  room: ChatRoom;
  createdBy: ChatUser;
  timestamp: number;
}

export interface RoomUpdatedEvent {
  type: "room_updated";
  room: ChatRoom;
  updatedBy: ChatUser;
  changes: Partial<ChatRoom>;
  timestamp: number;
}

export interface ReadReceiptEvent {
  type: "read_receipt";
  messageId: string;
  roomId: string;
  user: ChatUser;
  timestamp: number;
}
