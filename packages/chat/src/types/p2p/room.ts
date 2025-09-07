/**
 * P2P Chat Room and Channel Management Types
 *
 * Defines room/channel structures, settings, and management interfaces.
 */

import type { ChatUser } from "./user";
import type { ChatMessage } from "../../types";

// Room/Channel management
export interface ChatRoom {
  /** Unique room identifier */
  id: string;
  /** Room name/title */
  name: string;
  /** Room type */
  type: "direct" | "group" | "public" | "private";
  /** Room description */
  description?: string;
  /** Room participants */
  participants: ChatUser[];
  /** Room metadata */
  metadata?: {
    createdAt: number;
    createdBy: string;
    topic?: string;
    settings?: RoomSettings;
  };
  /** Unread message count */
  unreadCount?: number;
  /** Last message preview */
  lastMessage?: ChatMessage;
  /** Whether current user is typing */
  isTyping?: boolean;
  /** Users currently typing */
  typingUsers?: ChatUser[];
  /** Room members */
  members?: ChatUser[];
  /** Last activity timestamp */
  lastActivity?: Date;
  /** Creation timestamp */
  createdAt?: Date;
  /** Last update timestamp */
  updatedAt?: Date;
  /** Last message timestamp */
  lastMessageAt?: Date;
}

export interface RoomSettings {
  /** Whether messages are encrypted */
  encrypted?: boolean;
  /** Message retention period (in days) */
  retentionDays?: number;
  /** Whether to allow file uploads */
  allowFileUploads?: boolean;
  /** Maximum file size (in bytes) */
  maxFileSize?: number;
  /** Whether to show read receipts */
  showReadReceipts?: boolean;
  /** Whether to allow reactions */
  allowReactions?: boolean;
  /** Custom room settings */
  custom?: Record<string, unknown>;
}
